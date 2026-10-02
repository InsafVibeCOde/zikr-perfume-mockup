(() => {
  const DATA = window.CATALOG || [];
  const Z = window.ZIKR;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const rub = n => n.toLocaleString('ru-RU') + ' ₽';
  const num = n => n.toLocaleString('ru-RU');

  // Распив считается за миллилитр: если у аромата задан perMl, суммы за объёмы считаются сами.
  DATA.forEach(p => p.volumes.forEach(v => {
    if (v.decant && v.price == null && p.perMl) v.price = p.perMl * v.ml;
  }));

  const known = p => p.volumes.filter(v => v.price != null);
  const hasDecant = p => p.volumes.some(v => v.decant);
  const perMl = v => Math.round(v.price / v.ml);
  const decantPerMl = p => {
    if (p.perMl) return p.perMl;
    const d = p.volumes.filter(v => v.decant && v.price != null);
    return d.length ? Math.min(...d.map(perMl)) : null;
  };

  function range(vols) {
    const prices = vols.map(v => v.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? rub(min) : `${num(min)} – ${rub(max)}`;
  }
  const minPrice = p => Math.min(...known(p).map(v => v.price), Infinity);

  const fullName = p => `${p.brand} ${p.name}`;

  function orderText(p, v) {
    const what = v ? (v.decant ? `распив ${v.ml} мл` : `флакон ${v.ml} мл`) : '';
    const price = v && v.price != null ? ` (${rub(v.price)})` : '';
    return `Здравствуйте! Хочу заказать: ${fullName(p)}${what ? ', ' + what : ''}${price}.`;
  }
  const tgLink = text => `https://t.me/${Z.tg}?text=${encodeURIComponent(text)}`;
  const waLink = text => `https://wa.me/${Z.wa}?text=${encodeURIComponent(text)}`;

  function photo(p, cls = '') {
    return p.img
      ? `<img src="${p.img}" alt="${esc(fullName(p))}" loading="lazy" class="${cls}">`
      : `<div class="ph"><b>${esc(p.brand)}</b><span>фото в работе</span></div>`;
  }

  function card(p) {
    const badges = hasDecant(p) ? '<span class="badge">Распив</span>' : '';
    const full = p.volumes.filter(v => !v.decant && v.price != null);
    const ml = decantPerMl(p);
    let main, sub = '';
    if (full.length) {
      main = range(full);
      if (hasDecant(p)) sub = ml ? `Распив от ${rub(ml)} за 1 мл` : 'Распив: цена по запросу';
    } else if (ml) {
      main = `от ${rub(ml)} за мл`;
      sub = p.volumes.some(v => !v.decant) ? 'Распив. Флакон — цена по запросу' : 'Распив';
    } else {
      main = 'Цена по запросу';
    }
    return `
      <button class="card" type="button" data-id="${p.id}">
        <div class="card-img">${photo(p)}<div class="card-badges">${badges}</div></div>
        <span class="card-brand">${esc(p.brand)}</span>
        <span class="card-name display">${esc(p.name)}</span>
        ${p.similar ? `<span class="card-similar">Схож с: ${esc(p.similar)}</span>` : ''}
        <span class="card-price"><span class="display">${main}</span></span>
        ${sub ? `<span class="card-decant">${sub}</span>` : ''}
      </button>`;
  }

  /* ---------- карточка аромата ---------- */
  const modal = $('#modal');
  let current = null;

  function openModal(id) {
    const p = DATA.find(x => x.id === id);
    if (!p || !modal) return;
    current = p;
    const first = p.volumes.find(v => v.price != null) || p.volumes[0];
    const tiles = [
      ['Пол', p.gender], ['Концентрация', p.conc], ['Характер', p.family && p.family.join(', ')], ['Год', p.year]
    ].filter(t => t[1]);

    $('.modal-inner', modal).innerHTML = `
      <div class="modal-img">${photo(p)}</div>
      <div class="modal-body">
        <div class="m-brand">${esc(p.brand)}</div>
        <h2 class="m-name display">${esc(p.name)}</h2>
        ${p.similar ? `<div class="m-similar">Схож с: ${esc(p.similar)}</div>` : ''}
        <p class="m-line">${esc(p.line)}</p>
        <div class="chips" role="group" aria-label="Объём">
          ${p.volumes.map((v, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${v === first}">
            ${v.ml} мл${v.decant ? '<small>распив</small>' : '<small>флакон</small>'}</button>`).join('')}
        </div>
        <div class="m-price"></div>
        <div class="m-avail">Под заказ, доставка 2–3 дня</div>
        <div class="m-actions">
          <a class="btn btn-black js-tg" target="_blank" rel="noopener">Заказать в Telegram</a>
          <a class="btn btn-outline js-wa" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <dl class="tiles">${tiles.map(t => `<div class="tile"><dt>${t[0]}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl>
        <dl class="pyramid">
          <div><dt>Верх</dt><dd>${esc(p.top.join(', '))}</dd></div>
          <div><dt>Сердце</dt><dd>${esc(p.heart.join(', '))}</dd></div>
          <div><dt>База</dt><dd>${esc(p.base.join(', '))}</dd></div>
        </dl>
      </div>`;
    selectVolume(p.volumes.indexOf(first));
    modal.showModal();
    document.body.classList.add('is-locked');
  }

  function selectVolume(i) {
    const p = current, v = p.volumes[i];
    modal.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i)));
    $('.m-price', modal).innerHTML = v.price != null
      ? `<span class="display">${rub(v.price)}</span>${v.decant ? `<span class="mute">${rub(perMl(v))} за 1 мл</span>` : ''}`
      : `<span class="display">Цену подскажем</span><span class="mute">напишите в Telegram</span>`;
    const text = orderText(p, v);
    $('.js-tg', modal).href = tgLink(text);
    $('.js-wa', modal).href = waLink(text);
  }

  if (modal) {
    modal.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (chip) return selectVolume(+chip.dataset.i);
      if (e.target === modal || e.target.closest('.modal-close')) modal.close();
    });
    modal.addEventListener('close', () => document.body.classList.remove('is-locked'));
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('.card[data-id], [data-open]');
    if (!c) return;
    e.preventDefault();
    openModal(c.dataset.id || c.dataset.open);
  });

  /* ---------- главная ---------- */
  const featured = $('#featured');
  if (featured) featured.innerHTML = DATA.filter(p => p.featured).slice(0, 8).map(card).join('');

  const demo = $('#decant-demo');
  if (demo) {
    const p = DATA.find(x => x.id === 'blonde-amber');
    const vols = p.volumes;
    const chips = $('.chips', demo), out = $('.decant-price', demo);
    chips.innerHTML = vols.map((v, i) =>
      `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 1}">${v.ml} мл${v.decant ? '' : '<small>флакон</small>'}</button>`).join('');
    const show = i => {
      const v = vols[i];
      chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i)));
      out.innerHTML = `<span class="display">${rub(v.price)}</span>${v.decant ? `<span class="mute">${rub(perMl(v))} за 1 мл</span>` : ''}`;
    };
    chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) show(+c.dataset.i); });
    show(1);
  }

  /* ---------- каталог ---------- */
  const grid = $('#catalog');
  if (grid) {
    const state = { q: '', format: 'all', gender: 'all', family: 'all', brand: 'all', sort: 'default' };
    const params = new URLSearchParams(location.search);
    if (params.get('f') === 'decant') state.format = 'decant';

    const families = [...new Set(DATA.flatMap(p => p.family || []))].sort();
    const brands = [...new Set(DATA.map(p => p.brand))].sort();
    $('#f-family').innerHTML += families.map(f => `<option value="${f}">${f}</option>`).join('');
    $('#f-brand').innerHTML += brands.map(b => `<option value="${b}">${b}</option>`).join('');
    $('#total').textContent = DATA.length;

    const haystack = p => [p.brand, p.name, p.similar, p.line, ...(p.family || []), ...p.top, ...p.heart, ...p.base]
      .filter(Boolean).join(' ').toLowerCase();

    function render() {
      const words = state.q.toLowerCase().split(/[\s,]+/).filter(Boolean);
      let list = DATA.filter(p =>
        words.every(w => haystack(p).includes(w)) &&
        (state.format === 'all' || (state.format === 'decant' ? hasDecant(p) : p.volumes.some(v => !v.decant))) &&
        (state.gender === 'all' || p.gender === state.gender || (state.gender !== 'Унисекс' && p.gender === 'Унисекс')) &&
        (state.family === 'all' || (p.family || []).includes(state.family)) &&
        (state.brand === 'all' || p.brand === state.brand));
      if (state.sort === 'asc') list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
      if (state.sort === 'desc') list = [...list].sort((a, b) => minPrice(b) - minPrice(a));

      $('#shown').textContent = list.length;
      grid.innerHTML = list.map(card).join('');
      $('#empty').hidden = list.length > 0;
      grid.hidden = list.length === 0;
      document.querySelectorAll('[data-format]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.format === state.format)));
      document.querySelectorAll('[data-gender]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.gender === state.gender)));
    }

    $('#q').addEventListener('input', e => { state.q = e.target.value; render(); });
    document.querySelectorAll('[data-format]').forEach(b => b.addEventListener('click', () => { state.format = b.dataset.format; render(); }));
    document.querySelectorAll('[data-gender]').forEach(b => b.addEventListener('click', () => { state.gender = b.dataset.gender; render(); }));
    $('#f-family').addEventListener('change', e => { state.family = e.target.value; render(); });
    $('#f-brand').addEventListener('change', e => { state.brand = e.target.value; render(); });
    $('#f-sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
    $('#empty-tg').href = tgLink('Здравствуйте! Ищу аромат, которого нет в каталоге: ');
    render();
  }

  /* ---------- интро: один раз за визит ---------- */
  const intro = $('#intro');
  if (intro) {
    let seen = false;
    try { seen = sessionStorage.getItem('zikr-intro') === '1'; } catch (e) {}
    if (new URLSearchParams(location.search).has('intro')) seen = false;
    if (seen) { intro.remove(); return; }
    document.body.classList.add('is-locked');
    const start = () => {
      intro.classList.add('play');
      setTimeout(() => intro.classList.add('out'), 1350);
      setTimeout(() => {
        intro.remove();
        document.body.classList.remove('is-locked');
        try { sessionStorage.setItem('zikr-intro', '1'); } catch (e) {}
      }, 2100);
    };
    (document.fonts ? document.fonts.load('700 100px Antonio') : Promise.resolve()).catch(() => {}).then(start);
  }
})();

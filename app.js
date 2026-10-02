(() => {
  const DATA = window.CATALOG || [];
  const Z = window.ZIKR;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const rub = n => n.toLocaleString('ru-RU') + ' ₽';
  const num = n => n.toLocaleString('ru-RU');

  // Распив считается за миллилитр: если у аромата задан perMl, суммы за объёмы считаются сами.
  DATA.forEach(p => p.volumes.forEach(v => {
    if (v.decant && v.price == null && p.perMl) v.price = p.perMl * v.ml;
  }));

  const known = p => p.volumes.filter(v => v.price != null);
  const hasDecant = p => p.volumes.some(v => v.decant);
  const hasFull = p => p.volumes.some(v => !v.decant);
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

  function photo(p) {
    return p.img
      ? `<img src="${p.img}" alt="${esc(fullName(p))}" loading="lazy">`
      : `<div class="ph"><b>${esc(p.brand)}</b><span>фото в работе</span></div>`;
  }

  function card(p) {
    const full = p.volumes.filter(v => !v.decant && v.price != null);
    const ml = decantPerMl(p);
    let main, sub = '';
    if (full.length) {
      main = range(full);
      if (hasDecant(p)) sub = ml ? `Распив от ${rub(ml)} за 1 мл` : 'Есть распив, цена по запросу';
    } else if (ml) {
      main = `от ${rub(ml)} за 1 мл`;
      sub = hasFull(p) ? 'Распив. Флакон по запросу' : 'Распив';
    } else {
      main = 'Цена по запросу';
      if (hasDecant(p)) sub = 'Есть распив';
    }
    return `
      <button class="card" type="button" data-id="${p.id}">
        <div class="card-img">${photo(p)}<div class="card-badges">${hasDecant(p) ? '<span class="badge">Распив</span>' : ''}</div></div>
        <span class="card-brand">${esc(p.brand)}</span>
        <span class="card-name">${esc(p.name)}</span>
        <span class="card-conc">${esc(p.conc)}</span>
        ${p.similar ? `<span class="card-similar">Схож с ${esc(p.similar)}</span>` : ''}
        <span class="card-price">${main}</span>
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
    const tiles = [['Концентрация', p.conc], ['Характер', p.family && p.family.join(', ')], ['Год', p.year]].filter(t => t[1]);

    $('.modal-inner', modal).innerHTML = `
      <div class="modal-img">${photo(p)}</div>
      <div class="modal-body">
        <div class="m-brand">${esc(p.brand)}</div>
        <h2 class="m-name">${esc(p.name)}</h2>
        <div class="m-conc">${esc(p.conc)}</div>
        ${p.similar ? `<div class="m-similar">Схож с ${esc(p.similar)}</div>` : ''}
        <p class="m-line">${esc(p.line)}</p>
        <div class="m-label">Объём</div>
        <div class="chips" role="group" aria-label="Объём">
          ${p.volumes.map((v, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${v === first}">${v.ml} мл<small>${v.decant ? 'распив' : 'флакон'}</small></button>`).join('')}
        </div>
        <div class="m-price"></div>
        <div class="m-avail">Под заказ, доставка 2–3 дня</div>
        <div class="m-actions">
          <a class="btn btn-wine js-tg" target="_blank" rel="noopener">Заказать в Telegram</a>
          <a class="btn btn-line js-wa" target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <dl class="tiles">${tiles.map(t => `<div class="tile"><dt>${t[0]}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl>
        <div class="pyramid">
          <h3>Ноты</h3>
          <dl>
            <div><dt>Верх</dt><dd>${esc(p.top.join(', '))}</dd></div>
            <div><dt>Сердце</dt><dd>${esc(p.heart.join(', '))}</dd></div>
            <div><dt>База</dt><dd>${esc(p.base.join(', '))}</dd></div>
          </dl>
        </div>
      </div>`;
    selectVolume(p.volumes.indexOf(first));
    modal.showModal();
    document.body.classList.add('is-locked');
  }

  function selectVolume(i) {
    const p = current, v = p.volumes[i];
    $$('.chip', modal).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i)));
    $('.m-price', modal).innerHTML = v.price != null
      ? `<b>${rub(v.price)}</b>${v.decant ? `<span class="mute">${rub(perMl(v))} за 1 мл</span>` : ''}`
      : `<b>Цену подскажем</b><span class="mute">напишите в Telegram</span>`;
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
  const popular = $('#popular');
  if (popular) popular.innerHTML = DATA.filter(p => p.featured).slice(0, 5).map(card).join('');
  const decants = $('#decants');
  if (decants) decants.innerHTML = DATA.filter(p => hasDecant(p) && !p.featured).concat(DATA.filter(p => hasDecant(p) && p.featured)).slice(0, 5).map(card).join('');

  const brandsEl = $('#brands');
  if (brandsEl) {
    const brands = [...new Set(DATA.map(p => p.brand))];
    brandsEl.innerHTML = brands.map(b => `<a class="brand-tile" href="catalog.html?brand=${encodeURIComponent(b)}">${esc(b)}</a>`).join('');
  }

  const demo = $('#decant-demo');
  if (demo) {
    const vols = DATA.find(x => x.id === 'blonde-amber').volumes;
    const chips = $('.chips', demo), out = $('.decant-price', demo);
    chips.innerHTML = vols.map((v, i) =>
      `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 1}">${v.ml} мл${v.decant ? '' : '<small>флакон</small>'}</button>`).join('');
    const show = i => {
      const v = vols[i];
      $$('.chip', chips).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i)));
      out.innerHTML = `<b>${rub(v.price)}</b>${v.decant ? `<span class="mute">${rub(perMl(v))} за 1 мл</span>` : ''}`;
    };
    chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) show(+c.dataset.i); });
    show(1);
  }

  /* ---------- каталог ---------- */
  const grid = $('#catalog');
  if (grid) {
    const params = new URLSearchParams(location.search);
    const state = { q: params.get('q') || '', format: params.get('f') === 'decant' ? 'decant' : 'all', families: new Set(), brands: new Set(), sort: 'default' };
    if (params.get('brand')) state.brands.add(params.get('brand'));
    $('#q').value = state.q;

    const count = fn => DATA.filter(fn).length;
    const families = [...new Set(DATA.flatMap(p => p.family || []))].sort();
    const brands = [...new Set(DATA.map(p => p.brand))].sort();
    const box = (name, value, label, n) =>
      `<label><input type="checkbox" name="${name}" value="${esc(value)}">${esc(label)}<span class="count">${n}</span></label>`;
    $('#f-family').innerHTML = families.map(f => box('family', f, f, count(p => (p.family || []).includes(f)))).join('');
    $('#f-brand').innerHTML = brands.map(b => box('brand', b, b, count(p => p.brand === b))).join('');
    $('#f-format').innerHTML = [
      `<label><input type="radio" name="format" value="all">Всё<span class="count">${DATA.length}</span></label>`,
      `<label><input type="radio" name="format" value="decant">Есть распив<span class="count">${count(hasDecant)}</span></label>`,
      `<label><input type="radio" name="format" value="full">Флаконы<span class="count">${count(hasFull)}</span></label>`
    ].join('');

    const haystack = p => [p.brand, p.name, p.similar, p.line, ...(p.family || []), ...p.top, ...p.heart, ...p.base]
      .filter(Boolean).join(' ').toLowerCase();

    function syncInputs() {
      $$('input[name=format]').forEach(i => { i.checked = i.value === state.format; });
      $$('input[name=family]').forEach(i => { i.checked = state.families.has(i.value); });
      $$('input[name=brand]').forEach(i => { i.checked = state.brands.has(i.value); });
    }

    function render() {
      const words = state.q.toLowerCase().split(/[\s,]+/).filter(Boolean);
      let list = DATA.filter(p =>
        words.every(w => haystack(p).includes(w)) &&
        (state.format === 'all' || (state.format === 'decant' ? hasDecant(p) : hasFull(p))) &&
        (!state.families.size || (p.family || []).some(f => state.families.has(f))) &&
        (!state.brands.size || state.brands.has(p.brand)));
      if (state.sort === 'asc') list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
      if (state.sort === 'desc') list = [...list].sort((a, b) => minPrice(b) - minPrice(a));
      $('#shown').textContent = list.length;
      grid.innerHTML = list.map(card).join('');
      $('#empty').hidden = list.length > 0;
      grid.hidden = list.length === 0;
    }

    $('.filters').addEventListener('change', e => {
      const t = e.target;
      if (t.name === 'format') state.format = t.value;
      if (t.name === 'family') t.checked ? state.families.add(t.value) : state.families.delete(t.value);
      if (t.name === 'brand') t.checked ? state.brands.add(t.value) : state.brands.delete(t.value);
      render();
    });
    $('#reset').addEventListener('click', () => {
      Object.assign(state, { q: '', format: 'all', sort: state.sort }); state.families.clear(); state.brands.clear();
      $('#q').value = ''; syncInputs(); render();
    });
    $('#q').addEventListener('input', e => { state.q = e.target.value; render(); });
    $('.search-form').addEventListener('submit', e => e.preventDefault());
    $('#f-sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
    $('.filters-toggle').addEventListener('click', () => $('.filters').classList.toggle('is-open'));
    $('#empty-tg').href = tgLink('Здравствуйте! Ищу аромат, которого нет в каталоге: ');
    syncInputs();
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

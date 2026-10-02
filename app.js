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

  // Пока заказчик не переснял ароматы: силуэт флакона на тёплой подложке, у каждого бренда свой оттенок.
  const TINTS = ['#EFE6DC', '#EDE3DE', '#E9E6DB', '#ECE4D6', '#E6E2DD', '#EFE2D9'];
  const tint = brand => TINTS[[...brand].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  const bottle = `<svg class="ph-bottle" viewBox="0 0 120 180" aria-hidden="true">
      <rect x="44" y="6" width="32" height="34" rx="4"/><rect x="52" y="38" width="16" height="12" opacity=".7"/>
      <rect x="14" y="48" width="92" height="126" rx="16" opacity=".55"/><rect x="24" y="58" width="8" height="104" rx="4" fill="#fff" opacity=".35"/>
    </svg>`;
  function photo(p) {
    return p.img
      ? `<img src="${p.img}" alt="${esc(fullName(p))}" loading="lazy">`
      : `<div class="ph" style="--tint:${tint(p.brand)}">${bottle}<b>${esc(p.brand)}</b><span>${esc(p.name)}</span></div>`;
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
    const vols = p.volumes.map(v => `<i>${v.ml} мл</i>`).join('');
    return `
      <button class="card" type="button" data-id="${p.id}">
        <div class="card-img">${photo(p)}
          <div class="card-badges">${hasDecant(p) ? '<span class="badge">Распив</span>' : ''}</div>
          <div class="card-quick"><span class="card-vols">${vols}</span><span class="card-more">Подробнее</span></div>
        </div>
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
    const tiles = [['Концентрация', p.conc], ['Год', p.year]].filter(t => t[1]);

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
    const priceEl = $('.m-price', modal);
    priceEl.style.animation = 'none'; void priceEl.offsetWidth; priceEl.style.animation = '';
    priceEl.innerHTML = v.price != null
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
    const vols = DATA.find(x => x.id === 'blonde-amber').volumes.filter(v => v.decant);
    const chips = $('.chips', demo), out = $('.decant-price', demo), vial = $('.vial');
    chips.innerHTML = vols.map((v, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 1}">${v.ml} мл</button>`).join('');
    const show = i => {
      const v = vols[i];
      $$('.chip', chips).forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i)));
      out.style.animation = 'none'; void out.offsetWidth; out.style.animation = '';
      out.innerHTML = `<b>${rub(v.price)}</b><span class="mute">${rub(perMl(v))} за 1 мл</span>`;
      if (vial) vial.style.setProperty('--f', (v.ml / 20 * 0.96).toFixed(3));
    };
    chips.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) show(+c.dataset.i); });
    show(1);
  }

  const track = $('#brand-track');
  if (track) {
    const names = [...new Set(DATA.map(p => p.brand))].map(b => `<span>${esc(b)}</span>`).join('');
    track.innerHTML = names + names;
  }

  // витрина на первом экране слегка следует за курсором
  const hero = $('.hero');
  if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(hover: hover)').matches) {
    const items = $$('.show-item', hero);
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      items.forEach(it => {
        const d = +it.dataset.depth || 10;
        it.style.setProperty('--px', `${(-dx * d).toFixed(1)}px`);
        it.style.setProperty('--py', `${(-dy * d).toFixed(1)}px`);
      });
    });
    hero.addEventListener('pointerleave', () => items.forEach(it => { it.style.setProperty('--px', '0px'); it.style.setProperty('--py', '0px'); }));
  }

  /* ---------- каталог ---------- */
  const grid = $('#catalog');
  if (grid) {
    const params = new URLSearchParams(location.search);
    const state = { q: params.get('q') || '', format: params.get('f') === 'decant' ? 'decant' : 'all', brand: params.get('brand') || 'all', sort: 'default' };
    $('#q').value = state.q;

    const brands = [...new Set(DATA.map(p => p.brand))].sort();
    $('#brand-pills').innerHTML = [`<button class="pill" type="button" data-brand="all">Все бренды</button>`]
      .concat(brands.map(b => `<button class="pill" type="button" data-brand="${esc(b)}">${esc(b)}<span>${DATA.filter(p => p.brand === b).length}</span></button>`)).join('');
    $('#total').textContent = DATA.length;

    const haystack = p => [p.brand, p.name, p.similar, p.line, ...p.top, ...p.heart, ...p.base]
      .filter(Boolean).join(' ').toLowerCase();

    function render() {
      const words = state.q.toLowerCase().split(/[\s,]+/).filter(Boolean);
      let list = DATA.filter(p =>
        words.every(w => haystack(p).includes(w)) &&
        (state.format === 'all' || (state.format === 'decant' ? hasDecant(p) : hasFull(p))) &&
        (state.brand === 'all' || p.brand === state.brand));
      if (state.sort === 'asc') list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
      if (state.sort === 'desc') list = [...list].sort((a, b) => minPrice(b) - minPrice(a));

      $('#shown').textContent = list.length;
      grid.innerHTML = list.map(card).join('');
      $('#empty').hidden = list.length > 0;
      grid.hidden = list.length === 0;
      $$('.pill').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.brand === state.brand)));
      $$('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.format === state.format)));
      animate(grid);
    }

    $('#brand-pills').addEventListener('click', e => {
      const b = e.target.closest('.pill'); if (!b) return;
      state.brand = state.brand === b.dataset.brand ? 'all' : b.dataset.brand; render();
    });
    $('.seg').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state.format = b.dataset.format; render();
    });
    $('#q').addEventListener('input', e => { state.q = e.target.value; render(); });
    $('.search-form').addEventListener('submit', e => e.preventDefault());
    $('#f-sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
    $('#empty-tg').href = tgLink('Здравствуйте! Ищу аромат, которого нет в каталоге: ');
    render();
  }

  /* ---------- бургер-меню: раскрывается кругом от кнопки ---------- */
  const menu = $('#menu'), burger = $('.burger');
  if (menu && burger) {
    $('#menu-brands').innerHTML = [...new Set(DATA.map(p => p.brand))]
      .map(b => `<a href="catalog.html?brand=${encodeURIComponent(b)}">${esc(b)}</a>`).join('');
    $$('.menu-links a', menu).forEach((a, i) => a.style.setProperty('--i', i));
    $('.menu-side', menu).style.setProperty('--i', 5);
    const setOrigin = () => {
      const r = burger.getBoundingClientRect();
      menu.style.setProperty('--mx', `${r.left + r.width / 2}px`);
      menu.style.setProperty('--my', `${r.top + r.height / 2}px`);
    };
    const open = () => {
      setOrigin(); menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true'); document.body.classList.add('is-locked');
      setTimeout(() => $('.menu-close', menu).focus(), 300);
    };
    const close = () => {
      setOrigin(); menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('is-locked'); burger.focus();
    };
    burger.addEventListener('click', open);
    $('.menu-close', menu).addEventListener('click', close);
    menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
  }

  /* ---------- плавность: проявление блоков и фото ---------- */
  // var: animate() вызывается из каталога раньше этих строк
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false;
  var pending = new Set();
  var queued = false;

  // Видимость считаем по getBoundingClientRect на прокрутке — работает в любом браузере, в том числе во встроенном в Telegram.
  function check() {
    queued = false;
    const h = innerHeight;
    pending.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.94 && r.bottom > 0) { el.classList.add('is-in'); pending.delete(el); }
    });
  }
  function queueCheck() { if (!queued) { queued = true; setTimeout(check, 40); } }

  function animate(root = document) {
    if (reduce || !started) return;
    const scope = root === document ? document : root.parentNode;
    const groups = ['.hero-text', '.showcase', '.perks > div', '.block-head', '.grid', '.brands', '.decant-panel', '.place > *', '.info-row > *', '.cat-hero', '.toolbar'];
    const add = (el, delay) => { el.classList.add('reveal'); el.style.setProperty('--d', `${delay}ms`); pending.add(el); };
    $$(groups.join(','), scope).forEach(el => {
      if (el.classList.contains('grid') || el.classList.contains('brands')) {
        [...el.children].forEach((c, i) => { if (!c.classList.contains('reveal')) add(c, Math.min(i, 8) * 50); });
      } else if (!el.classList.contains('reveal')) {
        add(el, Math.min([...el.parentNode.children].indexOf(el), 4) * 80);
      }
    });
    $$('.card-img img, .show-item img', root).forEach(img => {
      if (img.classList.contains('fade-img')) return;
      img.classList.add('fade-img');
      const done = () => img.classList.add('is-loaded');
      img.complete && img.naturalWidth ? setTimeout(done, 30) : img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
    queueCheck();
  }
  function startAnimations() {
    if (reduce || started) return;
    started = true;
    document.documentElement.classList.add('js-anim');
    addEventListener('scroll', queueCheck, { passive: true });
    addEventListener('resize', queueCheck);
    animate();
  }

  /* ---------- интро: при каждом открытии сайта, но не при переходе на главную изнутри сайта ---------- */
  const intro = $('#intro');
  if (intro) {
    let seen = false;
    try { seen = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
    if (new URLSearchParams(location.search).has('intro')) seen = false;
    if (seen) { intro.remove(); startAnimations(); return; }
    document.body.classList.add('is-locked');
    const start = () => {
      intro.classList.add('play');
      setTimeout(() => { intro.classList.add('out'); startAnimations(); }, 1350);
      setTimeout(() => {
        intro.remove();
        document.body.classList.remove('is-locked');
      }, 2100);
    };
    (document.fonts ? document.fonts.load('700 100px Antonio') : Promise.resolve()).catch(() => {}).then(start);
  }
  if (!intro) startAnimations();
})();

// Каталог для макета. Цены и ноты — из постов t.me/zikr_perfume.
// price: null — цена в канале не указана, уточняется у заказчика.
// decant: true — объём на распив.
// perMl — цена распива за 1 мл; если задана, суммы за 5/10/15/20 мл считаются сами.
window.CATALOG = [
  {
    id: 'interlude-53', brand: 'Amouage', name: 'Interlude 53', conc: 'Extrait de Parfum',
    img: null, gender: 'Мужской', family: ['Дымные', 'Пряные'], featured: true,
    line: 'Дым, ладан и кожа. Тяжёлый вечерний аромат с цитрусовым стартом.',
    top: ['Орегано', 'Душистый перец', 'Бергамот'],
    heart: ['Ладан', 'Амбра', 'Опопонакс', 'Лабданум'],
    base: ['Дым', 'Уд', 'Кожа', 'Пачули', 'Сандал'],
    volumes: [{ ml: 100, price: 35900 }]
  },
  {
    id: 'blonde-amber', brand: 'Clive Christian', name: 'Blonde Amber', conc: 'Perfume',
    img: null, gender: 'Унисекс', family: ['Амбровые', 'Табачные'], year: 2022, featured: true,
    line: 'Мёд, белый табак и ваниль. Звучит статусно и долго держится.',
    top: ['Олибанум', 'Имбирь', 'Бергамот', 'Грейпфрут'],
    heart: ['Белый табак', 'Сандал', 'Шафран', 'Османтус', 'Жасмин'],
    base: ['Ваниль', 'Пачули', 'Мускус', 'Кедр', 'Ветивер'],
    volumes: [
      { ml: 5, price: 5500, decant: true }, { ml: 10, price: 10500, decant: true },
      { ml: 15, price: 13500, decant: true }, { ml: 20, price: 18500, decant: true },
      { ml: 50, price: 42900 }
    ]
  },
  {
    id: 'red-tobacco', brand: 'Mancera', name: 'Red Tobacco', conc: 'Eau de Parfum',
    img: 'img/red-tobacco.jpg', gender: 'Унисекс', family: ['Табачные', 'Пряные'], featured: true,
    line: 'Корица, уд и табак. Тёплый, обволакивающий, для холодов.',
    top: ['Корица', 'Уд', 'Ладан'], heart: ['Пачули', 'Жасмин'], base: ['Табак', 'Сандал', 'Амбра', 'Ветивер'],
    volumes: [{ ml: 60, price: 10900 }, { ml: 120, price: 13900 }]
  },
  {
    id: 'ombre-leather', brand: 'Tom Ford', name: 'Ombré Leather', conc: 'Eau de Parfum',
    img: 'img/ombre-leather.jpg', gender: 'Унисекс', family: ['Кожаные'], featured: true,
    line: 'Запах салона нового мерседеса. Лучший из кожаных у Tom Ford.',
    top: ['Кардамон'], heart: ['Кожа'], base: ['Амбра'],
    volumes: [
      { ml: 5, price: null, decant: true }, { ml: 10, price: null, decant: true },
      { ml: 50, price: 12900 }, { ml: 100, price: 15900 }
    ]
  },
  {
    id: 'amber-wood', brand: 'Ajmal', name: 'Amber Wood', conc: 'Eau de Parfum',
    img: 'img/amber-wood.jpg', family: ['Древесные'], featured: true,
    line: 'Классическое дерево: кедр, кардамон и белый перец.',
    top: ['Кардамон', 'Белый перец'], heart: ['Кедр', 'Дерево'], base: ['Амбра'],
    volumes: [{ ml: 100, price: 14900 }]
  },
  {
    id: 'layton', brand: 'Parfums de Marly', name: 'Layton', conc: 'Eau de Parfum',
    img: null, gender: 'Мужской', family: ['Свежие', 'Древесные'],
    line: 'Бергамот и лаванда, фиалка, внизу сандал. Самый популярный у PDM.',
    top: ['Бергамот', 'Лаванда'], heart: ['Фиалка'], base: ['Сандал'],
    volumes: [{ ml: 75, price: 17900 }, { ml: 125, price: 22900 }]
  },
  {
    id: 'althair', brand: 'Parfums de Marly', name: 'Althair', conc: 'Eau de Parfum',
    img: null, gender: 'Мужской', family: ['Сладкие', 'Пряные'],
    line: 'Ваниль с корицей и пралине. Сладкий, но не приторный.',
    top: ['Корица', 'Кардамон', 'Бергамот'], heart: ['Ваниль'], base: ['Пралине', 'Мускус'],
    volumes: [{ ml: 5, price: null, decant: true }, { ml: 10, price: null, decant: true }]
  },
  {
    id: 'art-of-arabia-1', brand: 'Lattafa', name: 'Art of Arabia I', conc: 'Eau de Parfum',
    img: null, similar: 'Louis Vuitton Imagination', family: ['Свежие'], featured: true,
    line: 'Мята и холодный бергамот на чёрном чае. Самый любимый у наших клиентов.',
    top: ['Бергамот', 'Мята'], heart: ['Чёрный чай', 'Имбирь', 'Лаванда'], base: ['Амброксан', 'Олибанум', 'Корица'],
    volumes: [{ ml: 5, price: null, decant: true }, { ml: 10, price: null, decant: true }, { ml: 100, price: 6500 }]
  },
  {
    id: 'art-of-arabia-3', brand: 'Lattafa', name: 'Art of Arabia III', conc: 'Eau de Parfum',
    img: 'img/art-of-arabia-3.jpg', similar: 'Clive Christian Blonde Amber', family: ['Табачные', 'Сладкие'], featured: true,
    line: 'Финики, табак и ваниль. Лучше раскрывается осенью и зимой.',
    top: ['Олибанум', 'Бергамот'], heart: ['Финики', 'Табак'], base: ['Ваниль', 'Бобы тонка'],
    volumes: [{ ml: 10, price: null, decant: true }, { ml: 100, price: null }]
  },
  {
    id: 'art-of-nature-1', brand: 'Lattafa', name: 'Art of Nature I', conc: 'Eau de Parfum',
    img: null, similar: 'Maison Crivelli Oud Maracuja', family: ['Фруктовые', 'Древесные'],
    line: 'Маракуйя и слива сверху, уд и кожа снизу. Аромат контрастов.',
    top: ['Маракуйя', 'Слива', 'Чёрная смородина'], heart: ['Кожа', 'Ревень', 'Роза'], base: ['Уд', 'Амбра', 'Ваниль'],
    volumes: [{ ml: 10, price: null, decant: true }, { ml: 100, price: null }]
  },
  {
    id: 'masa', brand: 'Lattafa', name: 'Masa', conc: 'Eau de Parfum',
    img: null, similar: 'Marc-Antoine Barrios Ganymede', family: ['Фруктовые', 'Минеральные'], featured: true,
    line: 'Манго, шафран и замша. Его либо любят, либо нет.',
    top: ['Манго', 'Шафран', 'Цитрус'], heart: ['Фиалка', 'Османтус', 'Имбирь'], base: ['Минералы', 'Замша', 'Амбра'],
    volumes: [
      { ml: 5, price: 999, decant: true }, { ml: 10, price: 1799, decant: true },
      { ml: 15, price: 2499, decant: true }, { ml: 100, price: null }
    ]
  },
  {
    id: 'turathi-purple', brand: 'Afnan', name: 'Turathi Purple', conc: 'Eau de Parfum',
    img: null, gender: 'Женский', similar: 'Gucci Guilty Absolute pour Femme', family: ['Цветочные', 'Фруктовые'],
    line: 'Красные фрукты с кардамоном, ваниль и мох в базе.',
    top: ['Кардамон', 'Красные фрукты', 'Чёрный перец'], heart: ['Ананас', 'Жасмин'], base: ['Пачули', 'Мох', 'Ваниль'],
    volumes: [{ ml: 10, price: null, decant: true }, { ml: 90, price: 6000 }]
  },
  {
    id: 'tribute-blue', brand: 'Afnan', name: 'Tribute Blue', conc: 'Eau de Parfum',
    img: 'img/tribute.jpg', gender: 'Мужской', family: ['Пряные', 'Древесные'],
    line: 'Мускатный орех и кашемировое дерево. Пряный и спокойный.',
    top: ['Мускатный орех', 'Пименто', 'Бергамот'], heart: ['Амбра', 'Кашемировое дерево'], base: ['Мускус', 'Ветивер', 'Ладан'],
    volumes: [{ ml: 5, price: null, decant: true }, { ml: 10, price: null, decant: true }, { ml: 100, price: null }]
  },
  {
    id: 'mirsaal', brand: 'Afnan', name: 'Mirsaal', conc: 'Eau de Parfum',
    img: null, similar: 'Tom Ford Ombré Leather', family: ['Кожаные'],
    line: 'Кожа, шафран и малина. Тоже про салон нового мерседеса.',
    top: ['Малина', 'Шафран'], heart: ['Кожа'], base: ['Амброксан'],
    volumes: [{ ml: 10, price: null, decant: true }, { ml: 100, price: null }]
  }
];

window.ZIKR = {
  tg: 'yuzeevv',
  phone: '+7 965 585-77-22',
  wa: '79655857722',
  address: 'Казань, ул. Дзержинского, 9/1'
};

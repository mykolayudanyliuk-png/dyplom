const GNEWS_API_KEY = '17f9130866c5e61b01d7d93ca5043fe4';

export const CATEGORIES = {
  general:       'general',
  technology:    'technology',
  science:       'science',
  business:      'business',
  entertainment: 'entertainment',
  sports:        'sports',
  health:        'health',
  world:         'world',
};

const MOCK_NEWS = [
  {
    id: 'mock-1',
    title: 'Тестова новина: Сайт працює!',
    source: 'System',
    publishedAt: new Date().toISOString(),
    url: '#',
    fullText: 'Якщо ви бачите цей текст — застосунок запущено успішно. Вставте API ключ від GNews, щоб отримувати реальні новини.',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
    category: 'general',
  },
  {
    id: 'mock-2',
    title: 'SpaceX успішно запустила нову ракету Starship',
    source: 'Space News',
    publishedAt: '2026-03-10T10:00:00Z',
    url: '#',
    fullText: 'Компанія Ілона Маска досягла нового прогресу в космічних польотах. Ракета успішно вийшла на орбіту та повернулася.',
    image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80',
    category: 'technology',
  },
  {
    id: 'mock-3',
    title: 'Як штучний інтелект змінює програмування',
    source: 'Tech Daily',
    publishedAt: '2026-03-09T15:30:00Z',
    url: '#',
    fullText: 'Розробники все частіше використовують AI-асистентів для написання коду. Це пришвидшує роботу, але вимагає нових навичок перевірки.',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
    category: 'technology',
  },
  {
    id: 'mock-4',
    title: 'Нові відкриття у дослідженні раку мозку',
    source: 'Health Today',
    publishedAt: '2026-03-08T09:00:00Z',
    url: '#',
    fullText: 'Вчені виявили новий маркер, який дозволяє виявляти пухлини на ранніх стадіях з точністю 94%.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    category: 'health',
  },
  {
    id: 'mock-5',
    title: 'Євро 2026: анонс розкладу матчів',
    source: 'Sport News',
    publishedAt: '2026-03-07T12:00:00Z',
    url: '#',
    fullText: 'УЄФА офіційно оголосила розклад матчів чемпіонату Європи 2026. Перший матч відбудеться у червні.',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
    category: 'sports',
  },
  {
    id: 'mock-6',
    title: 'Рекордний прибуток Apple за перший квартал',
    source: 'Business Insider',
    publishedAt: '2026-03-06T18:00:00Z',
    url: '#',
    fullText: 'Apple повідомила про рекордний квартальний прибуток завдяки продажам iPhone 17 та зростанню сервісного сегменту.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    category: 'business',
  },
];

export const fetchNews = async (category = 'general') => {
  if (!GNEWS_API_KEY) {
    const filtered = category === 'general'
      ? MOCK_NEWS
      : MOCK_NEWS.filter(n => n.category === category);
    return new Promise(resolve =>
      setTimeout(() => resolve(filtered.length ? filtered : MOCK_NEWS), 600)
    );
  }

  try {
    const baseUrl = window.location.hostname === 'localhost'
      ? 'https://gnews.io/api/v4/top-headlines'
      : '/api/gnews';

    const url = `${baseUrl}?category=${category}&lang=uk&max=20&apikey=${GNEWS_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`GNews API error: ${response.status}`);

    const data = await response.json();
    if (!data.articles?.length) throw new Error('Порожній список новин');

    return data.articles.map(article => ({
      id: `gnews-${btoa(article.url).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`,
      title: article.title || 'Без заголовка',
      source: article.source?.name || 'Невідоме джерело',
      url: article.url,
      publishedAt: article.publishedAt,
      image: article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
      fullText: article.description || article.content || 'Текст новини доступний за посиланням.',
      category,
    }));
  } catch {
    return MOCK_NEWS;
  }
};
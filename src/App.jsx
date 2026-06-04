import React, { useState, useEffect, useCallback } from 'react';
import { fetchNews } from './services/newsService';
import { generateAIResponse } from './services/aiService';
import NewsCard from './components/NewsCard';
import {
  addBookmark, removeBookmark, loadBookmarks,
  addLike, removeLike, loadLikes,
} from './services/firebaseService';
import { Loader2, Moon, Sun, Newspaper, RefreshCcw } from 'lucide-react';

const CATEGORY_LABELS = {
  general:       '🌍 Усі',
  technology:    '💻 Технології',
  science:       '🔬 Наука',
  business:      '💼 Бізнес',
  entertainment: '🎬 Розваги',
  sports:        '⚽ Спорт',
  health:        '🏥 Здоров\'я',
  world:         '🗺️ Світ',
};

const toggleItem = (state, setState, id, addFn, removeFn, value = true) => {
  const existed = state[id];
  setState(prev =>
    existed
      ? (({ [id]: _, ...rest }) => rest)(prev)
      : { ...prev, [id]: value }
  );
  (existed ? removeFn : addFn)(id).catch(() =>
    setState(prev =>
      existed
        ? { ...prev, [id]: value }
        : (({ [id]: _, ...rest }) => rest)(prev)
    )
  );
};

export default function App() {
  const [news, setNews]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState('general');
  const [bookmarks, setBookmarks]           = useState({});
  const [likes, setLikes]                   = useState({});
  const [expandedIds, setExpandedIds]       = useState(new Set());
  const [summaries, setSummaries]           = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});
  const [darkMode, setDarkMode]             = useState(
    () => localStorage.getItem('shortnews_dark') === 'true'
  );
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const [bm, lk] = await Promise.all([loadBookmarks(), loadLikes()]);
        setBookmarks(bm);
        setLikes(lk);
      } catch (e) {
        console.error('Firebase init error:', e);
      } finally {
        setLoading(false);
      }
    };
    initFirebase();
  }, []);

  useEffect(() => {
    localStorage.setItem('shortnews_dark', darkMode);
  }, [darkMode]);

  const loadNewsData = useCallback(async (category = activeCategory) => {
    setLoading(true);
    const data = await fetchNews(category);
    setNews(data);
    setLoading(false);
  }, [activeCategory]);

  useEffect(() => { loadNewsData(activeCategory); }, [activeCategory]);

  const handleToggleBookmark = (id) => {
    const newsItem = news.find(n => n.id === id);
    if (!newsItem && !bookmarks[id]) return;
    toggleItem(bookmarks, setBookmarks, id, addBookmark, removeBookmark, newsItem);
  };

  const handleToggleLike = (id) => {
    toggleItem(likes, setLikes, id, addLike, removeLike);
  };

  const handleToggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGenerateSummary = async (newsItem) => {
    setSummaryLoading(prev => ({ ...prev, [newsItem.id]: true }));
    try {
      const prompt = `
        Ти — професійний редактор новин.
        Прочитай цей текст і напиши стислий висновок українською мовою (максимум 2 речення).
        Зроби текст цікавим і зрозумілим.
        Заголовок: ${newsItem.title}
        Текст: ${newsItem.fullText}
      `;
      const aiResult = await generateAIResponse(prompt);
      setSummaries(prev => ({ ...prev, [newsItem.id]: { summary: aiResult } }));
    } catch {
      alert('Не вдалося згенерувати опис. Перевір API ключ Gemini.');
    } finally {
      setSummaryLoading(prev => ({ ...prev, [newsItem.id]: false }));
    }
  };

  const bookmarkedNews = Object.values(bookmarks);
  const displayedNews  = activeTab === 'bookmarks' ? bookmarkedNews : news;
  const bookmarkCount  = bookmarkedNews.length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`sticky top-0 z-10 border-b backdrop-blur-md ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">News AI</h1>
              <p className="text-xs opacity-60">Новини з інтелектом</p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setActiveTab(prev => prev === 'bookmarks' ? 'feed' : 'bookmarks')}
              className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'bookmarks'
                  ? 'bg-blue-600 text-white'
                  : darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔖 Збережені
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {bookmarkCount > 9 ? '9+' : bookmarkCount}
                </span>
              )}
            </button>

            <button
              onClick={() => loadNewsData(activeCategory)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              title="Оновити новини"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setDarkMode(d => !d)}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {activeTab === 'feed' && (
          <div className={`border-t overflow-x-auto ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 min-w-max">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === key
                      ? 'bg-blue-600 text-white'
                      : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-4">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            <p className="text-gray-500">Завантажуємо свіжі новини...</p>
          </div>
        ) : (
          <>
            {activeTab === 'bookmarks' && (
              <h2 className="text-lg font-semibold mb-6">
                🔖 Збережені новини {bookmarkCount > 0 ? `(${bookmarkCount})` : ''}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedNews.map(item => (
                <NewsCard
                  key={item.id}
                  newsItem={item}
                  isBookmarked={!!bookmarks[item.id]}
                  onToggleBookmark={handleToggleBookmark}
                  isLiked={!!likes[item.id]}
                  onToggleLike={handleToggleLike}
                  isExpanded={expandedIds.has(item.id)}
                  onToggleExpand={handleToggleExpand}
                  summaryData={summaries[item.id]}
                  onGenerateSummary={handleGenerateSummary}
                  isLoadingSummary={summaryLoading[item.id]}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {displayedNews.length === 0 && (
              <div className={`text-center mt-10 p-10 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {activeTab === 'bookmarks' ? (
                  <>
                    <p className="text-lg">Немає збережених новин.</p>
                    <p className="text-sm text-gray-500 mt-2">Натисни 🔖 на будь-якій новині, щоб зберегти.</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg">Новин не знайдено.</p>
                    <p className="text-sm text-gray-500 mt-2">Перевір свій API ключ у файлі newsService.js</p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
import React from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, Calendar, ChevronDown, Loader2, Heart } from 'lucide-react';

export default function NewsCard({
  newsItem,
  isBookmarked, onToggleBookmark,
  isLiked,      onToggleLike,
  isExpanded,   onToggleExpand,
  summaryData,  onGenerateSummary, isLoadingSummary,
  darkMode,
}) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });

  return (
    <div className={`border rounded-xl overflow-hidden shadow-sm flex flex-col h-full transition-shadow hover:shadow-md
        ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

      <div className="relative h-48 bg-gray-200">
        <img
          src={newsItem.image}
          alt={newsItem.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'; }}
        />
        <button
          onClick={() => onToggleBookmark(newsItem.id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow hover:scale-110 transition"
          title={isBookmarked ? 'Видалити із збережених' : 'Зберегти'}
        >
          {isBookmarked
            ? <BookmarkCheck className="w-5 h-5 text-blue-600" />
            : <Bookmark className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow">

        <div className="flex justify-between mb-3 text-xs text-gray-500 font-medium">
          <span className="text-blue-600">{newsItem.source}</span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(newsItem.publishedAt)}
          </span>
        </div>

        <h3 className="text-lg font-bold mb-3 leading-snug">{newsItem.title}</h3>

        {summaryData ? (
          <div className={`mb-4 p-3 rounded-lg text-sm ${darkMode ? 'bg-gray-700' : 'bg-blue-50 text-blue-900'}`}>
            <p>🤖 {summaryData.summary}</p>
          </div>
        ) : (
          <button
            onClick={() => onGenerateSummary(newsItem)}
            disabled={isLoadingSummary}
            className="w-full py-2 mb-4 border border-dashed rounded-lg flex justify-center items-center text-sm text-gray-500 hover:border-blue-500 hover:text-blue-500 transition"
          >
            {isLoadingSummary
              ? <Loader2 className="animate-spin w-4 h-4" />
              : '✨ Створити AI саммарі'}
          </button>
        )}

        {isExpanded && (
          <div className={`text-sm mb-4 p-3 rounded ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {newsItem.fullText}
          </div>
        )}

        <div className={`mt-auto flex justify-between items-center pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleExpand(newsItem.id)}
              className="text-blue-600 text-sm font-medium flex items-center"
            >
              {isExpanded ? 'Згорнути' : 'Читати далі'}
              <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => onToggleLike(newsItem.id)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isLiked ? 'text-red-500' : darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
              }`}
              title={isLiked ? 'Прибрати лайк' : 'Вподобати'}
            >
              <Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-red-500 scale-110' : ''}`} />
              <span className="text-xs">{isLiked ? 'Вподобано' : 'Подобається'}</span>
            </button>
          </div>

          {newsItem.url && newsItem.url !== '#' && (
            <a
              href={newsItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Відкрити оригінал"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
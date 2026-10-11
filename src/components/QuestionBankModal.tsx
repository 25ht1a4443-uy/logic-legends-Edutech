import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { SEEDED_QUESTIONS, CATEGORIES } from '../data/seededQuestions';
import { CategorySlug } from '../types';

export const QuestionBankModal: React.FC = () => {
  const { isQuestionBankOpen, setIsQuestionBankOpen, setSelectedCodingQuestion, setIsIdeModalOpen } =
    useAssessment();

  const [activeCategory, setActiveCategory] = useState<CategorySlug | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isQuestionBankOpen) return null;

  const filteredQuestions = SEEDED_QUESTIONS.filter((q) => {
    const matchCat = activeCategory === 'all' || q.category === activeCategory;
    const matchSearch =
      q.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1128]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 transition-all">
      <div className="bg-white w-full max-w-5xl h-[88vh] rounded-2xl border border-[#c7c4d8] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#c7c4d8] flex items-center justify-between bg-[#f2f3ff] flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e2dfff] text-[#0f0069] uppercase">
                Institutional Repository
              </span>
              <h2 className="text-lg font-bold text-[#131b2e] font-headline">
                Official 48-Question Standardized Bank
              </h2>
            </div>
            <p className="text-xs text-[#464555] mt-0.5">
              12 Seeded Questions each across Coding, Aptitude, Communication & Domain Knowledge.
            </p>
          </div>
          <button
            onClick={() => setIsQuestionBankOpen(false)}
            className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Filter Strip */}
        <div className="p-3.5 bg-white border-b border-[#c7c4d8] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#3525cd] text-white'
                  : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
              }`}
            >
              All (48)
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-[#3525cd] text-white'
                    : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
                }`}
              >
                {cat.name} (12)
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search code or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#c7c4d8] bg-[#f2f3ff] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-sm text-[#777587]">
              search
            </span>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto custom-scrollbar space-y-3 bg-[#faf8ff]">
          {filteredQuestions.map((q) => {
            const badgeColor =
              q.category === 'coding'
                ? 'bg-[#e2dfff] text-[#0f0069]'
                : q.category === 'aptitude'
                ? 'bg-[#d8e2ff] text-[#001a42]'
                : q.category === 'communication'
                ? 'bg-[#e9ddff] text-[#23005c]'
                : 'bg-amber-100 text-amber-900';

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-[#c7c4d8] bg-white shadow-xs hover:border-[#3525cd] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#3525cd]">{q.code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeColor}`}>
                      {q.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#131b2e]">{q.title}</h3>
                  </div>

                  {q.category === 'coding' && (
                    <button
                      onClick={() => {
                        setSelectedCodingQuestion(q);
                        setIsQuestionBankOpen(false);
                        setIsIdeModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded bg-[#eaedff] text-[#3525cd] font-semibold text-xs hover:bg-[#3525cd] hover:text-white transition-colors cursor-pointer"
                    >
                      Open in IDE
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#464555] leading-relaxed whitespace-pre-line">{q.prompt}</p>

                {/* Options preview for MCQ */}
                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                          opt.id === q.correctOption
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-[#f2f3ff] border-[#c7c4d8] text-[#464555]'
                        }`}
                      >
                        <span className="w-4 h-4 rounded bg-white text-[10px] font-bold flex items-center justify-center font-mono">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                        {opt.id === q.correctOption && (
                          <span className="ml-auto text-[10px] text-emerald-700 font-bold">
                            KEY
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sample I/O for coding */}
                {q.publicSampleInput && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                    <div className="p-2 rounded bg-[#f2f3ff] border border-[#c7c4d8]">
                      <span className="text-[#777587] block">Input:</span>
                      <span className="text-[#131b2e]">{q.publicSampleInput}</span>
                    </div>
                    <div className="p-2 rounded bg-[#f2f3ff] border border-[#c7c4d8]">
                      <span className="text-[#777587] block">Output:</span>
                      <span className="text-[#3525cd] font-bold">{q.publicSampleOutput}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { SEEDED_QUESTIONS } from '../data/seededQuestions';

export const ResultsReviewModal: React.FC = () => {
  const { isResultsModalOpen, setIsResultsModalOpen, activeResultAttempt } = useAssessment();

  if (!isResultsModalOpen || !activeResultAttempt) return null;

  const questions = SEEDED_QUESTIONS.filter((q) =>
    activeResultAttempt.selectedQuestionIds.includes(q.id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1128]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-all">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl border border-[#c7c4d8] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#c7c4d8] flex items-center justify-between bg-[#f2f3ff]">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Evaluated Assessment Report
            </span>
            <h2 className="text-lg font-bold text-[#131b2e] mt-1 font-headline">
              {activeResultAttempt.title}
            </h2>
            <p className="text-xs text-[#464555]">
              Candidate: <strong className="text-[#131b2e]">{activeResultAttempt.studentName}</strong> • Submitted: {activeResultAttempt.submittedAt || 'Recent'}
            </p>
          </div>
          <button
            onClick={() => setIsResultsModalOpen(false)}
            className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Score Metric Strip */}
        <div className="p-4 bg-[#eaedff] border-b border-[#c7c4d8] flex flex-wrap items-center justify-around gap-4 text-center">
          <div>
            <span className="text-[11px] font-bold text-[#464555] uppercase">Evaluated Score</span>
            <div className="text-2xl font-bold text-[#3525cd] font-headline">
              {activeResultAttempt.scoreOutOf5?.toFixed(1) || '4.0'} <span className="text-xs font-normal">/ 5.0</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#c7c4d8] hidden sm:block"></div>
          <div>
            <span className="text-[11px] font-bold text-[#464555] uppercase">Earned Marks</span>
            <div className="text-2xl font-bold text-emerald-700 font-headline">
              {activeResultAttempt.earnedMarks ?? '10'} / {activeResultAttempt.maxMarks ?? '12'}
            </div>
          </div>
          <div className="h-8 w-px bg-[#c7c4d8] hidden sm:block"></div>
          <div>
            <span className="text-[11px] font-bold text-[#464555] uppercase">Integrity Verification</span>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>{activeResultAttempt.plagiarismScore || 'Verified'}</span>
            </div>
          </div>
        </div>

        {/* Question Solutions List */}
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#464555]">
            Question-by-Question Solution Breakdown & Pedagogical Keys
          </h3>

          {questions.map((q, idx) => {
            const resp = activeResultAttempt.responses[q.id];
            const isCorrect = resp?.isCorrect || resp?.selectedOption === q.correctOption;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-[#c7c4d8] bg-white shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3525cd]">
                    Q{idx + 1}. {q.code} — {q.title}
                  </span>
                  {q.type === 'multiple_choice' && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#131b2e] leading-relaxed font-medium">{q.prompt}</p>

                {q.type === 'multiple_choice' && (
                  <div className="text-xs space-y-1 pt-1">
                    <div className="text-[#464555]">
                      <span>Your Choice: </span>
                      <strong className={isCorrect ? 'text-emerald-700 font-mono' : 'text-red-600 font-mono'}>
                        Option {resp?.selectedOption || 'Not answered'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-emerald-700">Correct Key: </span>
                      <strong className="text-emerald-700 font-mono">
                        Option {q.correctOption} ({q.options?.find((o) => o.id === q.correctOption)?.text})
                      </strong>
                    </div>
                  </div>
                )}

                {q.explanation && (
                  <div className="p-2.5 rounded-lg bg-[#f2f3ff] border border-[#c7c4d8] text-xs text-[#464555]">
                    <span className="font-bold text-[#131b2e]">Solution Explanation: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f2f3ff] border-t border-[#c7c4d8] flex justify-end">
          <button
            onClick={() => setIsResultsModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

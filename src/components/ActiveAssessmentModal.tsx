import React, { useState, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { SEEDED_QUESTIONS, CATEGORIES } from '../data/seededQuestions';
import { Question } from '../types';

export const ActiveAssessmentModal: React.FC = () => {
  const {
    isActiveQuizOpen,
    setIsActiveQuizOpen,
    activeQuizCategory,
    updateStudentScores,
    addSubmission,
    addAuditLog,
    student,
    setIsResultsModalOpen,
    setActiveResultAttempt,
  } = useAssessment();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timerSeconds, setTimerSeconds] = useState(30 * 60);

  // Initialize randomized assessment
  useEffect(() => {
    if (isActiveQuizOpen && activeQuizCategory) {
      const categoryQuestions = SEEDED_QUESTIONS.filter((q) => q.category === activeQuizCategory);
      // Shuffle question order (Fisher-Yates)
      const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setSelectedAnswers({});
      const catInfo = CATEGORIES.find((c) => c.slug === activeQuizCategory);
      setTimerSeconds((catInfo?.durationMinutes || 30) * 60);
    }
  }, [isActiveQuizOpen, activeQuizCategory]);

  useEffect(() => {
    if (!isActiveQuizOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActiveQuizOpen]);

  if (!isActiveQuizOpen || !activeQuizCategory || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const catInfo = CATEGORIES.find((c) => c.slug === activeQuizCategory);
  const answeredCount = Object.keys(selectedAnswers).length;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleSubmit = () => {
    let earnedMarks = 0;
    const totalQuestions = questions.length;

    // Check answers for objective types
    questions.forEach((q) => {
      if (q.type === 'multiple_choice' && selectedAnswers[q.id] === q.correctOption) {
        earnedMarks += 1;
      } else if (q.type === 'open_ended') {
        // Communication auto-marks provisional score
        if (selectedAnswers[q.id]?.length > 20) earnedMarks += 1;
      }
    });

    const scoreOutOf5 = Math.round((earnedMarks / totalQuestions) * 5 * 10) / 10;

    // Update student score in this dimension
    updateStudentScores({ [activeQuizCategory]: scoreOutOf5 });

    const newAttempt = {
      id: `attempt-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      category: activeQuizCategory,
      title: `${catInfo?.name} Assessment (${totalQuestions} Questions)`,
      selectedQuestionIds: questions.map((q) => q.id),
      responses: Object.fromEntries(
        Object.entries(selectedAnswers).map(([qId, ans]) => [
          qId,
          {
            questionId: qId,
            selectedOption: ans,
            answerText: ans,
            isCorrect: questions.find((q) => q.id === qId)?.correctOption === ans,
            earnedMarks: questions.find((q) => q.id === qId)?.correctOption === ans ? 1 : 0,
            savedAt: new Date().toISOString(),
          },
        ])
      ),
      status: 'evaluated' as const,
      startedAt: 'Just now',
      submittedAt: 'Just now',
      deadlineAt: 'Today',
      scoreOutOf5,
      earnedMarks,
      maxMarks: totalQuestions,
      feedback: `Completed with ${earnedMarks} / ${totalQuestions} correct responses.`,
      plagiarismScore: 'Auto-Graded',
    };

    addSubmission(newAttempt);
    addAuditLog(
      'SUBMIT_ASSESSMENT',
      `${student.name} - ${catInfo?.name} (${earnedMarks}/${totalQuestions})`,
      'STUDENT',
      'SUCCESS'
    );

    setIsActiveQuizOpen(false);
    setActiveResultAttempt(newAttempt);
    setIsResultsModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1128]/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 transition-all">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl border border-[#c7c4d8] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-4 sm:px-6 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-lg text-indigo-400">
              {catInfo?.icon || 'quiz'}
            </span>
            <div>
              <span className="font-bold text-sm text-white font-headline">
                {catInfo?.name} Standardized Assessment
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-900/80 text-indigo-200">
                {currentIndex + 1} of {questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1 rounded bg-slate-800 text-amber-300 font-mono font-bold flex items-center gap-1.5 border border-slate-700">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span>{formatTimer(timerSeconds)}</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to exit? Your current progress will not be submitted.')) {
                  setIsActiveQuizOpen(false);
                }
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Question Numbers Strip */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#f2f3ff] border-b border-[#c7c4d8] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 flex-shrink-0 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-white text-[#464555] border border-[#c7c4d8] hover:bg-[#eaedff]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
          <div className="ml-auto text-xs text-[#464555] whitespace-nowrap pl-2">
            <span>Answered: </span>
            <strong className="text-[#131b2e]">{answeredCount}</strong> / {questions.length}
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto custom-scrollbar bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e2dfff] text-[#0f0069] uppercase tracking-wider">
                {currentQ.code} • 1 Mark
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Autosaved
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#131b2e] font-headline">
              {currentQ.title}
            </h3>

            <p className="text-sm text-[#131b2e] leading-relaxed whitespace-pre-line font-medium">
              {currentQ.prompt}
            </p>

            {/* MCQ Options */}
            {currentQ.options && (
              <div className="space-y-2.5 mt-4">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#3525cd] bg-[#eaedff] text-[#131b2e] shadow-xs'
                          : 'border-[#c7c4d8] bg-white hover:bg-[#f2f3ff] text-[#131b2e]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                          isSelected
                            ? 'bg-[#3525cd] text-white'
                            : 'bg-[#eaedff] text-[#464555]'
                        }`}
                      >
                        {opt.id}
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Open Ended Communication Prompt Textarea */}
            {currentQ.type === 'open_ended' && (
              <div className="mt-4 space-y-2">
                <label className="block text-xs font-semibold text-[#131b2e]">
                  Your Recorded / Written Response:
                </label>
                <textarea
                  rows={6}
                  value={selectedAnswers[currentQ.id] || ''}
                  onChange={(e) => handleSelectOption(e.target.value)}
                  placeholder="Draft your structured explanation following clarity, technical vocabulary, and trade-off guidelines..."
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-[#464555]">
                  <span>
                    Word count: {(selectedAnswers[currentQ.id] || '').split(/\s+/).filter(Boolean).length}
                  </span>
                  <span>Evaluated against 5-point holistic rubric</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#f2f3ff] border-t border-[#c7c4d8] flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-3.5 py-2 rounded-lg bg-white border border-[#c7c4d8] text-xs font-semibold text-[#131b2e] hover:bg-[#eaedff] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Next Question</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">task_alt</span>
                <span>Submit Final Assessment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

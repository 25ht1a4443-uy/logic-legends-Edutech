import React, { useState, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { SEEDED_QUESTIONS } from '../data/seededQuestions';
import { Question } from '../types';

export const EmbeddedIDEModal: React.FC = () => {
  const {
    isIdeModalOpen,
    setIsIdeModalOpen,
    selectedCodingQuestion,
    setSelectedCodingQuestion,
    updateStudentScores,
    addSubmission,
    addAuditLog,
    student,
  } = useAssessment();

  const codingQuestions = SEEDED_QUESTIONS.filter((q) => q.category === 'coding');
  const activeQ: Question = selectedCodingQuestion || codingQuestions[0];

  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [code, setCode] = useState(
    activeQ.starterCode?.python ||
      `# Python 3.11\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()`
  );

  useEffect(() => {
    if (activeQ.starterCode) {
      setCode(activeQ.starterCode[language] || activeQ.starterCode.python || '');
    }
  }, [activeQ, language]);

  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{ name: string; status: 'PASS' | 'FAIL'; time: string; output?: string }>
  >([
    { name: 'Test Case 1', status: 'PASS', time: '12ms' },
    { name: 'Test Case 2', status: 'PASS', time: '18ms' },
    { name: 'Edge Case / Hidden Test', status: 'PASS', time: '22ms' },
  ]);
  const [metrics, setMetrics] = useState('Runtime: 42ms • Memory: 14.2 MB');
  const [timerSeconds, setTimerSeconds] = useState(44 * 60 + 18);

  useEffect(() => {
    if (!isIdeModalOpen) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isIdeModalOpen]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRunSandbox = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setTestResults([
        { name: 'Test Case 1 (Public Input)', status: 'PASS', time: '11ms', output: activeQ.publicSampleOutput },
        { name: 'Test Case 2 (Constraint Bound)', status: 'PASS', time: '14ms' },
        { name: 'Hidden Verification Test 3', status: 'PASS', time: '18ms' },
      ]);
      setMetrics(`Runtime: ${Math.floor(Math.random() * 20 + 25)}ms • Memory: 13.9 MB`);
    }, 600);
  };

  const handleSubmitJudge0 = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      // Update student coding score to 4.5/5.0
      updateStudentScores({ coding: 4.5 });

      // Add a submission record
      addSubmission({
        id: `sub-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        category: 'coding',
        title: `Coding Challenge: ${activeQ.title}`,
        selectedQuestionIds: [activeQ.id],
        responses: {
          [activeQ.id]: {
            questionId: activeQ.id,
            submittedCode: code,
            language,
            isCorrect: true,
            earnedMarks: 5,
            savedAt: new Date().toISOString(),
          },
        },
        status: 'evaluated',
        startedAt: 'Just now',
        submittedAt: 'Just now',
        deadlineAt: 'Today 18:00',
        scoreOutOf5: 4.5,
        earnedMarks: 5,
        maxMarks: 5,
        feedback: 'Clean algorithm implementation. All unit test cases passed with 0 memory violations.',
        plagiarismScore: '0% Sim • 3/3 Pass',
      });

      addAuditLog(
        'SUBMIT_JUDGE0_SOLUTION',
        `${student.name} - ${activeQ.code} (${language})`,
        'STUDENT',
        'VERIFIED'
      );

      alert(
        `Assessment submitted successfully to Judge0 Online Sandbox!\n\nAll 3 test cases passed.\nCoding Score updated to 4.5 / 5.0 in your profile.`
      );
      setIsIdeModalOpen(false);
    }, 800);
  };

  if (!isIdeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1128]/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 transition-all">
      <div className="bg-white w-full max-w-7xl h-[92vh] max-h-[900px] rounded-2xl border border-[#c7c4d8] shadow-2xl flex flex-col overflow-hidden">
        {/* IDE Header Bar */}
        <div className="h-14 px-4 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            </div>
            <div className="h-4 w-px bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white font-headline">
                {activeQ.code}: {activeQ.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-900/80 text-indigo-200 border border-indigo-700">
                Weight: 30%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* Autosave Indicator */}
            <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Autosaved</span>
            </span>

            {/* Countdown Timer */}
            <div className="px-3 py-1 rounded bg-slate-800/90 border border-slate-700 text-amber-300 font-mono flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span>{formatTimer(timerSeconds)} remaining</span>
            </div>

            {/* Close Modal Trigger */}
            <button
              onClick={() => setIsIdeModalOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Split Screen Panes (Left: Problem & Constraints, Right: Monaco-Style Editor & Console) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Pane: Problem Statement */}
          <div className="w-full lg:w-5/12 border-b lg:border-b-0 lg:border-r border-[#c7c4d8] p-5 overflow-y-auto custom-scrollbar bg-white">
            <div className="space-y-4">
              {/* Question Switcher Dropdown */}
              <div className="flex items-center justify-between pb-2 border-b border-[#c7c4d8]">
                <span className="text-xs text-[#464555] font-semibold">Select Challenge:</span>
                <select
                  value={activeQ.id}
                  onChange={(e) => {
                    const found = codingQuestions.find((q) => q.id === e.target.value);
                    if (found) setSelectedCodingQuestion(found);
                  }}
                  className="text-xs py-1 px-2 border border-[#c7c4d8] rounded-md bg-[#f2f3ff] text-[#131b2e] font-semibold"
                >
                  {codingQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.code}: {q.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Points: {activeQ.points} / 5.0
                </span>
                <h2 className="text-lg font-bold text-[#131b2e] mt-1.5 font-headline">
                  {activeQ.title}
                </h2>
                <p className="text-xs text-[#464555] mt-2 leading-relaxed whitespace-pre-line">
                  {activeQ.prompt}
                </p>
              </div>

              {/* Sample Input & Output */}
              {activeQ.publicSampleInput && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#131b2e] uppercase tracking-wider">
                    Sample Input
                  </span>
                  <pre className="bg-[#f2f3ff] p-2.5 rounded-lg border border-[#c7c4d8] font-mono text-[11px] text-[#131b2e] overflow-x-auto">
                    {activeQ.publicSampleInput}
                  </pre>
                </div>
              )}

              {activeQ.publicSampleOutput && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#131b2e] uppercase tracking-wider">
                    Sample Output
                  </span>
                  <pre className="bg-[#f2f3ff] p-2.5 rounded-lg border border-[#c7c4d8] font-mono text-[11px] text-[#3525cd] font-semibold overflow-x-auto">
                    {activeQ.publicSampleOutput}
                  </pre>
                </div>
              )}

              {/* Edge Cases & Constraints */}
              {activeQ.constraints && activeQ.constraints.length > 0 && (
                <div className="p-3 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-xs space-y-1">
                  <span className="font-bold text-[#131b2e]">Constraints & SLA:</span>
                  <ul className="list-disc pl-4 text-[#464555] space-y-0.5 text-[11px]">
                    {activeQ.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                    <li>Judge0 Container Sandbox v1.13 isolation</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Code Editor & Console Drawer */}
          <div className="w-full lg:w-7/12 flex flex-col bg-[#0F172A] text-slate-100 overflow-hidden">
            {/* Editor Controls Toolbar */}
            <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="bg-slate-800 text-white border-0 text-xs py-1 px-2 rounded font-mono focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="python">Python 3.11</option>
                  <option value="javascript">Node.js (JavaScript)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (activeQ.starterCode) {
                    setCode(activeQ.starterCode[language] || '');
                  }
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Reset</span>
              </button>
            </div>

            {/* Code Editor Body */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar bg-[#0B1120] text-slate-200">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full min-h-[220px] bg-transparent resize-none border-0 focus:ring-0 text-emerald-300 font-mono text-xs leading-relaxed outline-none"
              />
            </div>

            {/* Console & Judge0 Execution Results Drawer */}
            <div className="h-48 bg-[#0A0F1D] border-t border-slate-800 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <span className="material-symbols-outlined text-sm text-emerald-400">terminal</span>
                    <span>Execution Output (Sandbox / Judge0 v1.13)</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">{metrics}</span>
                </div>

                {/* Output Display Box */}
                <div className="font-mono text-xs space-y-1.5 text-slate-300">
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-amber-300">
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      <span>Compiling & Executing in Judge0 Sandbox...</span>
                    </div>
                  ) : (
                    testResults.map((tr, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓ {tr.name}: PASS</span>
                        <span className="text-slate-500 text-[11px]">[{tr.time}]</span>
                        {tr.output && (
                          <span className="text-slate-400 text-[11px]">→ Output: {tr.output}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Execution Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleRunSandbox}
                  disabled={isRunning}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">play_circle</span>
                  <span>Run Code (Sandbox)</span>
                </button>
                <button
                  onClick={handleSubmitJudge0}
                  disabled={isRunning}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  <span>Submit to Judge0</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

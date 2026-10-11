import React, { useState, useEffect } from 'react';
import { useAssessment } from '../context/AssessmentContext';

export const RubricModal: React.FC = () => {
  const {
    isRubricModalOpen,
    setIsRubricModalOpen,
    activeRubricAttempt,
    updateSubmission,
    addAuditLog,
    updateStudentScores,
    student,
  } = useAssessment();

  const [c1, setC1] = useState(4);
  const [c2, setC2] = useState(4);
  const [c3, setC3] = useState(4);
  const [c4, setC4] = useState(4);
  const [feedback, setFeedback] = useState(
    'Excellent handling of negative weight edges with early cycle termination. Suggest adding explicit type annotations for production grade readability.'
  );

  useEffect(() => {
    if (activeRubricAttempt?.feedback) {
      setFeedback(activeRubricAttempt.feedback);
    }
  }, [activeRubricAttempt]);

  if (!isRubricModalOpen) return null;

  const avg = ((c1 + c2 + c3 + c4) / 4).toFixed(1);

  const handleReleaseGrade = () => {
    if (activeRubricAttempt) {
      updateSubmission(activeRubricAttempt.id, {
        scoreOutOf5: parseFloat(avg),
        status: 'evaluated',
        feedback,
      });

      // If evaluating current student, update their dimension score
      if (activeRubricAttempt.studentId === student.id) {
        if (activeRubricAttempt.category === 'coding') updateStudentScores({ coding: parseFloat(avg) });
        if (activeRubricAttempt.category === 'communication') updateStudentScores({ communication: parseFloat(avg) });
        if (activeRubricAttempt.category === 'domain_knowledge') updateStudentScores({ domain_knowledge: parseFloat(avg) });
        if (activeRubricAttempt.category === 'aptitude') updateStudentScores({ aptitude: parseFloat(avg) });
      }

      addAuditLog(
        'RELEASE_RUBRIC_GRADE',
        `${activeRubricAttempt.studentName} - Score: ${avg}/5.0`,
        'FACULTY_EVAL',
        'VERIFIED'
      );

      alert(`Rubric grade (${avg} / 5.0) published successfully to student portal and audit ledger!`);
    }
    setIsRubricModalOpen(false);
  };

  const handleRequestReassessment = () => {
    if (activeRubricAttempt) {
      updateSubmission(activeRubricAttempt.id, {
        status: 'reassessment_eligible',
        feedback: `${feedback} [Reassessment slot granted by evaluator]`,
      });

      addAuditLog(
        'GRANT_REASSESSMENT_SLOT',
        `${activeRubricAttempt.studentName} (${activeRubricAttempt.category})`,
        'FACULTY_EVAL',
        'SUCCESS'
      );

      alert('Reassessment notification triggered. Candidate granted 1 additional attempt slot.');
    }
    setIsRubricModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1128]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl border border-[#c7c4d8] p-5 md:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d8]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e9ddff] text-[#23005c]">
                Rubric Studio
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#131b2e] font-headline">
                Evaluation: {activeRubricAttempt?.studentName || 'Student'}
              </h3>
            </div>
            <p className="text-xs text-[#464555] mt-0.5">
              {activeRubricAttempt?.title || 'Assessment Rubric Evaluation'}
            </p>
          </div>
          <button
            onClick={() => setIsRubricModalOpen(false)}
            className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Rubric Sliders Grid */}
        <div className="space-y-3.5 my-4">
          <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#c7c4d8]">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">
                1. Algorithmic Correctness & Edge Cases
              </span>
              <span className="font-bold text-[#3525cd]">{c1} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={c1}
              onChange={(e) => setC1(parseInt(e.target.value))}
              className="w-full accent-[#3525cd] cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#c7c4d8]">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">
                2. Code Modularity & Time Complexity
              </span>
              <span className="font-bold text-[#3525cd]">{c2} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={c2}
              onChange={(e) => setC2(parseInt(e.target.value))}
              className="w-full accent-[#3525cd] cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#c7c4d8]">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">
                3. Code Clarity, PEP8 & Comments
              </span>
              <span className="font-bold text-[#3525cd]">{c3} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={c3}
              onChange={(e) => setC3(parseInt(e.target.value))}
              className="w-full accent-[#3525cd] cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#c7c4d8]">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">
                4. Memory & Stack Footprint
              </span>
              <span className="font-bold text-[#3525cd]">{c4} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={c4}
              onChange={(e) => setC4(parseInt(e.target.value))}
              className="w-full accent-[#3525cd] cursor-pointer"
            />
          </div>
        </div>

        {/* Feedback notes */}
        <div>
          <label className="block text-xs font-semibold text-[#131b2e] mb-1">
            Evaluator Qualitative Feedback:
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-[#c7c4d8] bg-white focus:ring-1 focus:ring-[#3525cd] outline-none"
          />
        </div>

        {/* Action Footer */}
        <div className="mt-4 pt-3 border-t border-[#c7c4d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-[#464555]">Computed Rubric Score:</span>
            <span className="font-bold text-[#3525cd] font-mono text-base ml-1">
              {avg} / 5.0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestReassessment}
              className="px-3 py-1.5 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-xs font-semibold text-amber-800 hover:bg-[#e2e7ff] transition-colors cursor-pointer"
            >
              Request Reassessment
            </button>
            <button
              onClick={handleReleaseGrade}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Release Grade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

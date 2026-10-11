import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';

export const ScoreSimulatorModal: React.FC = () => {
  const { isScoreSimModalOpen, setIsScoreSimModalOpen, student, weights, updateStudentScores } =
    useAssessment();

  const [simCoding, setSimCoding] = useState(student.scores.coding);
  const [simAptitude, setSimAptitude] = useState(student.scores.aptitude);
  const [simComm, setSimComm] = useState(student.scores.communication);
  const [simDomain, setSimDomain] = useState(student.scores.domain_knowledge);

  if (!isScoreSimModalOpen) return null;

  // Formula: (Coding * wC + Aptitude * wA + Comm * wCM + Domain * wD) / 100
  const simTotal =
    (simCoding * weights.coding +
      simAptitude * weights.aptitude +
      simComm * weights.communication +
      simDomain * weights.domain_knowledge) /
    100;

  const simPct = ((simTotal / 5.0) * 100).toFixed(1);

  const handleApply = () => {
    updateStudentScores({
      coding: simCoding,
      aptitude: simAptitude,
      communication: simComm,
      domain_knowledge: simDomain,
    });
    setIsScoreSimModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A1128]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-[#c7c4d8] p-5 md:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d8]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#131b2e] font-headline">
              Live Weighted Score Simulator
            </h3>
            <p className="text-xs text-[#464555]">
              Verify how each dimension mathematically determines the 5.0 score.
            </p>
          </div>
          <button
            onClick={() => setIsScoreSimModalOpen(false)}
            className="text-[#777587] hover:text-[#131b2e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="space-y-4 my-5">
          {/* Slider 1: Coding */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">Coding Score ({weights.coding}% weight)</span>
              <span className="font-mono font-bold text-[#3525cd]">{simCoding.toFixed(1)} / 5.0</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={simCoding}
              onChange={(e) => setSimCoding(parseFloat(e.target.value))}
              className="w-full accent-[#3525cd] cursor-pointer"
            />
          </div>

          {/* Slider 2: Aptitude */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">Aptitude Score ({weights.aptitude}% weight)</span>
              <span className="font-mono font-bold text-[#0058be]">{simAptitude.toFixed(1)} / 5.0</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={simAptitude}
              onChange={(e) => setSimAptitude(parseFloat(e.target.value))}
              className="w-full accent-[#0058be] cursor-pointer"
            />
          </div>

          {/* Slider 3: Communication */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">Communication Score ({weights.communication}% weight)</span>
              <span className="font-mono font-bold text-[#571ac0]">{simComm.toFixed(1)} / 5.0</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={simComm}
              onChange={(e) => setSimComm(parseFloat(e.target.value))}
              className="w-full accent-[#571ac0] cursor-pointer"
            />
          </div>

          {/* Slider 4: Domain */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[#131b2e]">Domain Knowledge ({weights.domain_knowledge}% weight)</span>
              <span className="font-mono font-bold text-amber-700">{simDomain.toFixed(1)} / 5.0</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={simDomain}
              onChange={(e) => setSimDomain(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Result Box */}
        <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#c7c4d8] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#464555] uppercase font-bold tracking-wider">
              Simulated Cumulative Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-[#3525cd] font-headline">
                {simTotal.toFixed(2)}
              </span>
              <span className="text-xs text-[#464555]">/ 5.0</span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {simPct}% Grade
          </span>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setIsScoreSimModalOpen(false)}
            className="px-3 py-2 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-xs font-semibold hover:bg-[#e2e7ff] text-[#131b2e] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-semibold hover:bg-[#3525cd] transition-colors cursor-pointer"
          >
            Apply to Main Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

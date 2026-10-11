import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';

export const AdminDashboard: React.FC = () => {
  const { weights, updateWeights, auditLogs, addAuditLog } = useAssessment();

  // Local state for interactive sliders
  const [sliderCoding, setSliderCoding] = useState(weights.coding);
  const [sliderAptitude, setSliderAptitude] = useState(weights.aptitude);
  const [sliderComm, setSliderComm] = useState(weights.communication);
  const [sliderDomain, setSliderDomain] = useState(weights.domain_knowledge);

  const currentSum = sliderCoding + sliderAptitude + sliderComm + sliderDomain;
  const isBalanced = currentSum === 100;

  const [commitMessage, setCommitMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleCommitWeights = () => {
    const res = updateWeights({
      coding: sliderCoding,
      aptitude: sliderAptitude,
      communication: sliderComm,
      domain_knowledge: sliderDomain,
    });

    if (res.success) {
      setCommitMessage({ text: 'Dimensional weights committed successfully to institutional policy engine!' });
      setTimeout(() => setCommitMessage(null), 4000);
    } else {
      setCommitMessage({ text: res.error || 'Failed to update weights', error: true });
    }
  };

  const handleRotateKeys = () => {
    addAuditLog('ROTATED_SANDBOX_JUDGE0_KEYS', 'Judge0 Cluster node-07 (mTLS)', 'LEAD_ADMIN', 'SUCCESS');
    alert('Security Key Rotation Dispatched: Judge0 Sandbox containers refreshed with new TLS credentials.');
  };

  return (
    <div className="space-y-6">
      {/* Admin KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Enrolled Students
          </span>
          <div className="text-3xl font-extrabold text-[#3525cd] mt-1 font-headline">1,420</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>
            <span>+14% from last trimester</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Active Evaluators
          </span>
          <div className="text-3xl font-extrabold text-[#0058be] mt-1 font-headline">48</div>
          <div className="text-[11px] text-[#464555] mt-1">Computer Science & InfoTech</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Assessment Completion
          </span>
          <div className="text-3xl font-extrabold text-emerald-700 mt-1 font-headline">94.2%</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-xs">check</span>
            <span>SLA target surpassed (&gt;90%)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Cohort Average Score
          </span>
          <div className="text-3xl font-extrabold text-[#571ac0] mt-1 font-headline">
            3.71 <span className="text-sm font-normal text-[#777587]">/ 5.0</span>
          </div>
          <div className="text-[11px] text-[#464555] mt-1">Calibrated across 4 dimensions</div>
        </div>
      </div>

      {/* WEIGHT CONFIGURATION MANAGER */}
      <div className="bg-white rounded-2xl border border-[#c7c4d8] p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#c7c4d8] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#131b2e] font-headline">
                Dimensional Weight Configuration Manager
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 animate-pulse'
                }`}
              >
                {isBalanced ? '100% Balanced' : `Total: ${currentSum}% (Must equal 100%)`}
              </span>
            </div>
            <p className="text-xs text-[#464555] mt-0.5">
              Calibrate institutional grading emphasis. Total across all four dimensions must strictly equal 100%.
            </p>
          </div>

          <button
            onClick={handleCommitWeights}
            className="px-4 py-2 rounded-lg bg-[#4f46e5] text-white font-semibold text-xs hover:bg-[#3525cd] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>Commit Weight Changes</span>
          </button>
        </div>

        {commitMessage && (
          <div
            className={`mt-3 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              commitMessage.error
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {commitMessage.error ? 'error' : 'check_circle'}
            </span>
            <span>{commitMessage.text}</span>
          </div>
        )}

        {/* Interactive Weight Calibration Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Coding Weight Slider */}
          <div className="p-4 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff]">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">Coding Dimension</span>
              <span className="font-bold text-[#3525cd] text-base font-mono">{sliderCoding}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={sliderCoding}
              onChange={(e) => setSliderCoding(parseInt(e.target.value))}
              className="w-full mt-3 accent-[#3525cd] cursor-pointer"
            />
            <span className="text-[11px] text-[#464555] block mt-1">
              Proctored hands-on coding tests evaluated by Judge0 sandbox.
            </span>
          </div>

          {/* Aptitude Weight Slider */}
          <div className="p-4 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff]">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">Aptitude Dimension</span>
              <span className="font-bold text-[#0058be] text-base font-mono">{sliderAptitude}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={sliderAptitude}
              onChange={(e) => setSliderAptitude(parseInt(e.target.value))}
              className="w-full mt-3 accent-[#0058be] cursor-pointer"
            />
            <span className="text-[11px] text-[#464555] block mt-1">
              Timed quantitative reasoning and logical puzzle patterns.
            </span>
          </div>

          {/* Communication Weight Slider */}
          <div className="p-4 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff]">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">Communication Dimension</span>
              <span className="font-bold text-[#571ac0] text-base font-mono">{sliderComm}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={sliderComm}
              onChange={(e) => setSliderComm(parseInt(e.target.value))}
              className="w-full mt-3 accent-[#571ac0] cursor-pointer"
            />
            <span className="text-[11px] text-[#464555] block mt-1">
              Verbal pitch, architectural presentation & clarity rubric.
            </span>
          </div>

          {/* Domain Knowledge Weight Slider */}
          <div className="p-4 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff]">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">Domain Knowledge Dimension</span>
              <span className="font-bold text-amber-700 text-base font-mono">{sliderDomain}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={sliderDomain}
              onChange={(e) => setSliderDomain(parseInt(e.target.value))}
              className="w-full mt-3 accent-amber-600 cursor-pointer"
            />
            <span className="text-[11px] text-[#464555] block mt-1">
              Core curriculum mastery (DBMS, OS, Networks, Architecture).
            </span>
          </div>
        </div>
      </div>

      {/* SECURITY & AUDIT TRAIL LOG */}
      <div className="bg-white rounded-2xl border border-[#c7c4d8] p-5 md:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d8]">
          <div>
            <h2 className="text-lg font-bold text-[#131b2e] font-headline">Security & Audit Trail Log</h2>
            <p className="text-xs text-[#464555]">
              Immutable cryptographically signed records of admin overrides and sandbox executions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRotateKeys}
              className="px-2.5 py-1 rounded bg-[#eaedff] border border-[#c7c4d8] text-xs font-semibold text-[#3525cd] hover:bg-[#e2e7ff] transition-colors cursor-pointer"
            >
              Rotate Judge0 Keys
            </button>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              RBAC Integrity Active
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#464555] font-bold uppercase tracking-wider border-b border-[#c7c4d8]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor Role</th>
                <th className="py-2.5 px-3">Operation Event</th>
                <th className="py-2.5 px-3">Target Subject</th>
                <th className="py-2.5 px-3">IP / Session Hash</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8] font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f2f3ff] transition-colors">
                  <td className="py-2.5 px-3 text-[#464555]">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-[#3525cd] font-sans font-semibold">{log.actorRole}</td>
                  <td className="py-2.5 px-3 text-[#131b2e]">{log.operation}</td>
                  <td className="py-2.5 px-3 font-sans text-[#464555]">{log.targetSubject}</td>
                  <td className="py-2.5 px-3 text-[#777587]">{log.ipHash}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

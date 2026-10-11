import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Attempt } from '../types';

export const TeacherDashboard: React.FC = () => {
  const { submissions, setActiveRubricAttempt, setIsRubricModalOpen, setIsQuestionBankOpen } = useAssessment();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubmissions = submissions.filter((sub) => {
    const matchCat = filterCategory === 'all' || sub.category === filterCategory;
    const matchSearch =
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenRubric = (sub: Attempt) => {
    setActiveRubricAttempt(sub);
    setIsRubricModalOpen(true);
  };

  const exportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Student,ID,Assessment,Category,Status,Score\n' +
      submissions
        .map(
          (s) =>
            `"${s.studentName}","${s.studentId}","${s.title}","${s.category}","${s.status}","${s.scoreOutOf5 || 'N/A'}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LogicLegends_Cohort_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Evaluator Quick Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Submissions in Queue
          </span>
          <div className="text-2xl font-bold text-[#3525cd] mt-1 font-headline">{submissions.length}</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-xs">pending_actions</span>
            <span>2 Require Faculty Review</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Class Average Score
          </span>
          <div className="text-2xl font-bold text-[#0058be] mt-1 font-headline">3.80 / 5.0</div>
          <div className="text-[11px] text-[#464555] mt-1">Cohort Batch 2024-CS</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Proctored Sandbox Runs
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-headline">1,142</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            <span>100% Sandbox Execution SLA</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#c7c4d8] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
            Reassessment Requests
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-headline">1 Active</div>
          <div className="text-[11px] text-[#464555] mt-1">DBMS Concurrency Unit</div>
        </div>
      </div>

      {/* Evaluator Faculty Workbench */}
      <div className="bg-white rounded-2xl border border-[#c7c4d8] p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#c7c4d8]">
          <div>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#e9ddff] text-[#23005c] uppercase tracking-wider">
              Evaluator Faculty Workbench
            </span>
            <h1 className="text-xl font-bold text-[#131b2e] mt-1 font-headline">
              Rubric Grading & Submission Queue
            </h1>
            <p className="text-xs text-[#464555]">
              Review code submissions, execute sandbox unit checks, and score multi-criteria rubrics.
            </p>
          </div>

          {/* Evaluator Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQuestionBankOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-semibold hover:bg-[#3525cd] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-base">library_books</span>
              <span>Question Bank (48)</span>
            </button>
            <button
              onClick={exportReport}
              className="px-3 py-2 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-[#131b2e] text-xs font-semibold hover:bg-[#e2e7ff] transition-colors flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'coding', 'aptitude', 'communication', 'domain_knowledge'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize cursor-pointer transition-all ${
                  filterCategory === cat
                    ? 'bg-[#3525cd] text-white'
                    : 'bg-[#f2f3ff] text-[#464555] hover:bg-[#eaedff]'
                }`}
              >
                {cat === 'all' ? 'All Dimensions' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search student or assessment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#c7c4d8] bg-[#f2f3ff] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3525cd]"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-sm text-[#777587]">
              search
            </span>
          </div>
        </div>

        {/* Evaluation Queue Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#464555] font-bold uppercase tracking-wider border-b border-[#c7c4d8]">
                <th className="py-3 px-4">Student Name & ID</th>
                <th className="py-3 px-4">Assessment Title</th>
                <th className="py-3 px-4">Dimension</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Sandbox / Plagiarism</th>
                <th className="py-3 px-4">Provisional Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c7c4d8]">
              {filteredSubmissions.map((sub) => {
                const badgeColor =
                  sub.category === 'coding'
                    ? 'bg-[#e2dfff] text-[#0f0069]'
                    : sub.category === 'aptitude'
                    ? 'bg-[#d8e2ff] text-[#001a42]'
                    : sub.category === 'communication'
                    ? 'bg-[#e9ddff] text-[#23005c]'
                    : 'bg-amber-100 text-amber-900';

                return (
                  <tr key={sub.id} className="hover:bg-[#f2f3ff] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#131b2e]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#3525cd] text-white text-[10px] flex items-center justify-center font-bold">
                          {sub.studentName.substring(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <div className="font-semibold text-[#131b2e]">{sub.studentName}</div>
                          <div className="text-[10px] text-[#777587] font-mono">
                            {sub.studentId.startsWith('usr-')
                              ? `LL-2024-${sub.studentId.replace('usr-', '')}`
                              : sub.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#131b2e]">{sub.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeColor}`}>
                        {sub.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#464555]">{sub.submittedAt || 'In Review'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                        {sub.plagiarismScore || 'Verified'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#131b2e] font-mono">
                      {sub.scoreOutOf5 ? `${sub.scoreOutOf5.toFixed(1)} / 5.0` : 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenRubric(sub)}
                        className="px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white text-xs font-semibold hover:bg-[#3525cd] transition-colors cursor-pointer"
                      >
                        Grade / Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

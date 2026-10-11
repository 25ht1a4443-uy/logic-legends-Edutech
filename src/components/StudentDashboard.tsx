import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';

export const StudentDashboard: React.FC = () => {
  const {
    student,
    weights,
    overallScore,
    percentageScore,
    setIsIdeModalOpen,
    setIsScoreSimModalOpen,
    setIsRubricModalOpen,
    setActiveRubricAttempt,
    submissions,
    setIsActiveQuizOpen,
    setActiveQuizCategory,
    setIsResultsModalOpen,
    setActiveResultAttempt,
  } = useAssessment();

  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'submitted' | 'evaluated'>('all');

  // Dimension points calculations
  const codingPoints = ((student.scores.coding * weights.coding) / 100).toFixed(2);
  const aptitudePoints = ((student.scores.aptitude * weights.aptitude) / 100).toFixed(2);
  const commPoints = ((student.scores.communication * weights.communication) / 100).toFixed(2);
  const domainPoints = ((student.scores.domain_knowledge * weights.domain_knowledge) / 100).toFixed(3);

  // SVG Radar coordinates calculation based on student scores (scale 0-5)
  // Center is (100, 100), max radius is 80 (score 5 = 80px offset)
  const topRadius = (student.scores.coding / 5) * 80; // Coding (Top)
  const rightRadius = (student.scores.domain_knowledge / 5) * 80; // Domain (Right)
  const bottomRadius = (student.scores.communication / 5) * 80; // Comm (Bottom)
  const leftRadius = (student.scores.aptitude / 5) * 80; // Aptitude (Left)

  const topPoint = `${100},${100 - topRadius}`;
  const rightPoint = `${100 + rightRadius},${100}`;
  const bottomPoint = `${100},${100 + bottomRadius}`;
  const leftPoint = `${100 - leftRadius},${100}`;

  return (
    <div className="space-y-6">
      {/* 5-Stage Learning Cycle Stepper Banner */}
      <div className="bg-white rounded-xl border border-[#c7c4d8] p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d8e2ff] text-[#001a42] uppercase tracking-wider">
              Academic Sprint 4
            </span>
            <h1 className="text-xl font-bold text-[#131b2e] mt-1 font-headline">Holistic Competency Lifecycle</h1>
            <p className="text-xs text-[#464555]">
              Track your standardized milestones from preparation through dynamic reassessment.
            </p>
          </div>

          {/* Stepper Indicators */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Step 1: Prepare (Completed) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2f3ff] text-emerald-800 border border-emerald-200">
              <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
              <span className="text-xs font-semibold">1. Prepare</span>
            </div>
            <span className="text-[#777587] text-xs">→</span>

            {/* Step 2: Assess (Active) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white ring-2 ring-[#e2dfff] shadow-xs">
              <span className="material-symbols-outlined text-sm animate-pulse">pending</span>
              <span className="text-xs font-semibold">2. Assess</span>
            </div>
            <span className="text-[#777587] text-xs">→</span>

            {/* Step 3: Review */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-[#464555]">
              <span className="material-symbols-outlined text-sm">rate_review</span>
              <span className="text-xs">3. Review</span>
            </div>
            <span className="text-[#777587] text-xs">→</span>

            {/* Step 4: Feedback */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-[#464555]">
              <span className="material-symbols-outlined text-sm">forum</span>
              <span className="text-xs">4. Feedback</span>
            </div>
            <span className="text-[#777587] text-xs">→</span>

            {/* Step 5: Reassess */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-[#464555]">
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span className="text-xs">5. Reassess</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE WEIGHTED SCORING ENGINE CARD (Bento Grid Header) */}
      <div className="bg-white rounded-2xl border border-[#c7c4d8] p-5 md:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-[#c7c4d8] gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#131b2e] font-headline">Weighted Scoring Engine</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#e2dfff] text-[#0f0069] font-semibold">
                Formula: Σ (Score × Weight)
              </span>
            </div>
            <p className="text-xs text-[#464555] mt-0.5">
              Transparent algorithmic evaluation across all four institutional cognitive dimensions.
            </p>
          </div>

          {/* Score Adjuster Simulation Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScoreSimModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-[#131b2e] text-xs font-semibold hover:bg-[#e2e7ff] transition-colors cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-sm text-[#3525cd]">tune</span>
              <span>Simulate Score Adjuster</span>
            </button>
            <div className="hidden sm:flex items-center px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              <span>Rank: {student.cohortRank}</span>
            </div>
          </div>
        </div>

        {/* Overall Readiness Metric Banner & 4 Dimensional Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          {/* Overall Score Block */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#f2f3ff] to-[#eaedff] rounded-xl p-4 md:p-5 border border-[#c7c4d8] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#464555]">
                Overall Student Readiness Score
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl text-[#3525cd] tracking-tight font-extrabold font-headline">
                  {overallScore.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-[#464555]">/ 5.0</span>
                <span className="ml-auto px-2.5 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  {percentageScore}% Equivalent
                </span>
              </div>
              <p className="text-xs text-[#464555] mt-2 leading-relaxed">
                Weighted sum calculation computed from verified proctored modules and continuous rubric reviews.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#c7c4d8]/60 flex items-center justify-between text-xs">
              <span className="text-[#464555]">Accreditation Tier:</span>
              <span className="font-bold text-[#131b2e]">{student.accreditationTier}</span>
            </div>
          </div>

          {/* 4 Dimension Score Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Coding Card */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-3.5 hover:border-[#3525cd] transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3525cd] text-lg">terminal</span>
                  <span className="text-sm text-[#131b2e] font-semibold">Coding</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e2dfff] text-[#0f0069]">
                  Weight: {weights.coding}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#131b2e] font-headline">
                    {student.scores.coding.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#464555]">/ 5.0</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[#3525cd]">→ {codingPoints} pts</span>
              </div>
              {/* Progress track */}
              <div className="w-full bg-[#eaedff] rounded-full h-1.5 mt-2">
                <div
                  className="bg-[#3525cd] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(student.scores.coding / 5) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-[11px] text-[#464555] flex items-center justify-between">
                <span>Strength: <strong className="text-[#131b2e]">Algorithmic Logic</strong></span>
                <span className="text-emerald-700 font-semibold">Evaluated</span>
              </div>
            </div>

            {/* 2. Aptitude Card */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-3.5 hover:border-[#0058be] transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0058be] text-lg">psychology</span>
                  <span className="text-sm text-[#131b2e] font-semibold">Aptitude</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d8e2ff] text-[#001a42]">
                  Weight: {weights.aptitude}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#131b2e] font-headline">
                    {student.scores.aptitude.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#464555]">/ 5.0</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[#0058be]">→ {aptitudePoints} pts</span>
              </div>
              {/* Progress track */}
              <div className="w-full bg-[#eaedff] rounded-full h-1.5 mt-2">
                <div
                  className="bg-[#0058be] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(student.scores.aptitude / 5) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-[11px] text-[#464555] flex items-center justify-between">
                <span>Practice: <strong className="text-[#131b2e]">Timed Permutations</strong></span>
                <span className="text-emerald-700 font-semibold">Evaluated</span>
              </div>
            </div>

            {/* 3. Communication Card */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-3.5 hover:border-[#571ac0] transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#571ac0] text-lg">record_voice_over</span>
                  <span className="text-sm text-[#131b2e] font-semibold">Communication</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e9ddff] text-[#23005c]">
                  Weight: {weights.communication}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#131b2e] font-headline">
                    {student.scores.communication.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#464555]">/ 5.0</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[#571ac0]">→ {commPoints} pts</span>
              </div>
              {/* Progress track */}
              <div className="w-full bg-[#eaedff] rounded-full h-1.5 mt-2">
                <div
                  className="bg-[#571ac0] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(student.scores.communication / 5) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-[11px] text-[#464555] flex items-center justify-between">
                <span>Strength: <strong className="text-[#131b2e]">Tech Pitch & Clarity</strong></span>
                <span className="text-emerald-700 font-semibold">Evaluated</span>
              </div>
            </div>

            {/* 4. Domain Knowledge Card */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-3.5 hover:border-[#d97706] transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-lg">database</span>
                  <span className="text-sm text-[#131b2e] font-semibold">Domain Knowledge</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eaedff] text-[#464555]">
                  Weight: {weights.domain_knowledge}%
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#131b2e] font-headline">
                    {student.scores.domain_knowledge.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#464555]">/ 5.0</span>
                </div>
                <span className="text-xs font-mono font-semibold text-[#464555]">→ {domainPoints} pts</span>
              </div>
              {/* Progress track */}
              <div className="w-full bg-[#eaedff] rounded-full h-1.5 mt-2">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(student.scores.domain_knowledge / 5) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-[11px] text-[#464555] flex items-center justify-between">
                <span>Gap: <strong className="text-[#131b2e]">Distributed Transactions</strong></span>
                <span className="text-emerald-700 font-semibold">Evaluated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPCOMING & ACTIVE ASSESSMENTS HUB */}
      <div className="bg-white rounded-2xl border border-[#c7c4d8] p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#c7c4d8]">
          <div>
            <h2 className="text-xl font-bold text-[#131b2e] font-headline">Upcoming & Active Assessments Hub</h2>
            <p className="text-xs text-[#464555]">
              Proctored module challenges with integrated automated code sandbox execution.
            </p>
          </div>
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#f2f3ff] rounded-lg border border-[#c7c4d8] text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded cursor-pointer transition-all ${
                activeFilter === 'all' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              All (4)
            </button>
            <button
              onClick={() => setActiveFilter('available')}
              className={`px-3 py-1 rounded cursor-pointer transition-all ${
                activeFilter === 'available' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              Available (2)
            </button>
            <button
              onClick={() => setActiveFilter('submitted')}
              className={`px-3 py-1 rounded cursor-pointer transition-all ${
                activeFilter === 'submitted' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              Submitted (1)
            </button>
            <button
              onClick={() => setActiveFilter('evaluated')}
              className={`px-3 py-1 rounded cursor-pointer transition-all ${
                activeFilter === 'evaluated' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-[#131b2e]'
              }`}
            >
              Evaluated (1)
            </button>
          </div>
        </div>

        {/* Cards Grid for 4 Assessments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Assessment 1: Coding (DSA Module 4) */}
          {(activeFilter === 'all' || activeFilter === 'available') && (
            <div className="rounded-xl border border-[#c7c4d8] bg-white p-4 flex flex-col justify-between hover:border-[#3525cd] transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#e2dfff] text-[#0f0069] uppercase tracking-wider">
                    Coding • {weights.coding}% Weight
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span> Live Now
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#131b2e] mt-2 font-headline">
                  DSA Module 4: Graph Algorithms
                </h3>
                <p className="text-xs text-[#464555] mt-1 leading-relaxed">
                  Shortest path in directed weighted graphs using Bellman-Ford & Dijkstra with negative edge detection.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#464555] mt-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span> 60 mins
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="material-symbols-outlined text-sm">priority_high</span> Deadline: Today 18:00
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">terminal</span> Judge0 Proctored
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#c7c4d8] flex items-center justify-between">
                <span className="text-xs text-[#777587]">Pass criteria: 3/3 hidden tests</span>
                <button
                  onClick={() => setIsIdeModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#4f46e5] text-white text-xs font-semibold hover:bg-[#3525cd] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-base">play_arrow</span>
                  <span>Launch Code Assessment</span>
                </button>
              </div>
            </div>
          )}

          {/* Assessment 2: Aptitude */}
          {(activeFilter === 'all' || activeFilter === 'available') && (
            <div className="rounded-xl border border-[#c7c4d8] bg-white p-4 flex flex-col justify-between hover:border-[#0058be] transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#d8e2ff] text-[#001a42] uppercase tracking-wider">
                    Aptitude • {weights.aptitude}% Weight
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#eaedff] text-[#464555]">
                    Ready
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#131b2e] mt-2 font-headline">
                  Logical Reasoning & Numerical Speed
                </h3>
                <p className="text-xs text-[#464555] mt-1 leading-relaxed">
                  Permutations, combinatorial logic, probability chains, and rapid quantitative pattern matrices.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#464555] mt-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">schedule</span> 30 mins
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">quiz</span> 12 Questions
                  </span>
                  <span className="flex items-center gap-1 text-[#0058be]">
                    <span className="material-symbols-outlined text-sm">timer</span> Adaptive Timebank
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#c7c4d8] flex items-center justify-between">
                <span className="text-xs text-[#777587]">Standard marking: +1 pt</span>
                <button
                  onClick={() => {
                    setActiveQuizCategory('aptitude');
                    setIsActiveQuizOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#0058be] text-white text-xs font-semibold hover:bg-[#2170e4] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-base">flash_on</span>
                  <span>Start Timed Test</span>
                </button>
              </div>
            </div>
          )}

          {/* Assessment 3: Communication */}
          {(activeFilter === 'all' || activeFilter === 'evaluated') && (
            <div className="rounded-xl border border-[#c7c4d8] bg-white p-4 flex flex-col justify-between hover:border-[#571ac0] transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#e9ddff] text-[#23005c] uppercase tracking-wider">
                    Communication • {weights.communication}% Weight
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Evaluated
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#131b2e] mt-2 font-headline">
                  Technical Concept Pitch: Microservices
                </h3>
                <p className="text-xs text-[#464555] mt-1 leading-relaxed">
                  Video presentation evaluating architectural justification, system trade-offs, and conceptual vocabulary.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#464555] mt-3">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="material-symbols-outlined text-sm">grade</span> Scored 4.0 / 5.0
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">mic</span> 5m Audio/Video Rubric
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#c7c4d8] flex items-center justify-between">
                <span className="text-xs text-[#777587]">Evaluator: Prof. V. Sharma</span>
                <button
                  onClick={() => {
                    const match = submissions.find((s) => s.category === 'communication') || null;
                    setActiveRubricAttempt(match);
                    setIsRubricModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-[#131b2e] text-xs font-semibold hover:bg-[#e2e7ff] transition-colors flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-base text-[#571ac0]">visibility</span>
                  <span>View Teacher Feedback & Rubric</span>
                </button>
              </div>
            </div>
          )}

          {/* Assessment 4: Domain Knowledge */}
          {(activeFilter === 'all' || activeFilter === 'submitted') && (
            <div className="rounded-xl border border-[#c7c4d8] bg-white p-4 flex flex-col justify-between hover:border-amber-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 uppercase tracking-wider">
                    Domain Knowledge • {weights.domain_knowledge}% Weight
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Reassessment Eligible
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#131b2e] mt-2 font-headline">
                  DBMS ACID Properties & Concurrency Case
                </h3>
                <p className="text-xs text-[#464555] mt-1 leading-relaxed">
                  Multi-version concurrency control (MVCC), isolation anomalies, two-phase locking protocols.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#464555] mt-3">
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <span className="material-symbols-outlined text-sm">score</span> Scored: 3.5 / 5.0
                  </span>
                  <span className="flex items-center gap-1 text-[#3525cd]">
                    <span className="material-symbols-outlined text-sm">refresh</span> 1 Attempt Remaining
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#c7c4d8] flex items-center justify-between">
                <span className="text-xs text-[#777587]">Window closes in 2 days</span>
                <button
                  onClick={() => {
                    const match = submissions.find((s) => s.category === 'domain_knowledge') || null;
                    setActiveResultAttempt(match);
                    setIsResultsModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#eaedff] border border-[#c7c4d8] text-[#131b2e] text-xs font-semibold hover:bg-[#e2e7ff] transition-colors flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-base">menu_book</span>
                  <span>Review Solutions</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SKILL GAP ANALYSIS & PERSONALIZED RECOMMENDATIONS (Bento Box 2-Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Competency Radar Breakdown Visualizer */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#c7c4d8] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d8]">
            <div>
              <h3 className="text-base font-bold text-[#131b2e] font-headline">Skill Gap Radar</h3>
              <p className="text-xs text-[#464555]">Target benchmark vs Current performance</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e2dfff] text-[#0f0069]">
              Target: 4.5/5.0
            </span>
          </div>

          {/* Dynamic Stylized SVG Radar Polygon Chart */}
          <div className="relative flex items-center justify-center py-6">
            <svg className="w-56 h-56" viewBox="0 0 200 200">
              {/* Concentric Web Rings */}
              <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              <polygon points="100,45 155,100 100,155 45,100" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              <polygon points="100,70 130,100 100,130 70,100" fill="none" stroke="#E2E8F0" strokeWidth="1" />

              {/* Axis lines */}
              <line x1="100" y1="20" x2="100" y2="180" stroke="#CBD5E1" strokeDasharray="2,2" strokeWidth="1" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="#CBD5E1" strokeDasharray="2,2" strokeWidth="1" />

              {/* Cohort Mean (Dashed Grey Benchmark Polygon) */}
              <polygon
                points="100,45 155,100 100,155 45,100"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />

              {/* Student Actual Metric Shape (Violet Area Fill) */}
              <polygon
                points={`${topPoint} ${rightPoint} ${bottomPoint} ${leftPoint}`}
                fill="#4F46E5"
                fillOpacity="0.25"
                stroke="#4F46E5"
                strokeWidth="2"
              />

              {/* Vertex Dots */}
              <circle cx="100" cy={100 - topRadius} r="3.5" fill="#4F46E5" />
              <circle cx={100 + rightRadius} cy="100" r="3.5" fill="#4F46E5" />
              <circle cx="100" cy={100 + bottomRadius} r="3.5" fill="#4F46E5" />
              <circle cx={100 - leftRadius} cy="100" r="3.5" fill="#4F46E5" />

              {/* Labels */}
              <text x="100" y="14" textAnchor="middle" fill="#1E293B" fontSize="9" fontWeight="600" fontFamily="Inter">
                Coding ({student.scores.coding.toFixed(1)})
              </text>
              <text x="188" y="103" textAnchor="start" fill="#1E293B" fontSize="9" fontWeight="600" fontFamily="Inter">
                Domain ({student.scores.domain_knowledge.toFixed(1)})
              </text>
              <text x="100" y="194" textAnchor="middle" fill="#1E293B" fontSize="9" fontWeight="600" fontFamily="Inter">
                Comm ({student.scores.communication.toFixed(1)})
              </text>
              <text x="12" y="103" textAnchor="end" fill="#1E293B" fontSize="9" fontWeight="600" fontFamily="Inter">
                Aptitude ({student.scores.aptitude.toFixed(1)})
              </text>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-[#464555] pt-2 border-t border-[#c7c4d8]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]"></span>
              <span>Current Profile ({overallScore.toFixed(2)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#777587]"></span>
              <span>Cohort Mean (3.41)</span>
            </div>
          </div>
        </div>

        {/* Personalized AI Recommendations & Next Action Items */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#c7c4d8] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#c7c4d8]">
              <div>
                <h3 className="text-base font-bold text-[#131b2e] font-headline">Personalized Action Plan</h3>
                <p className="text-xs text-[#464555]">AI-curated recommendations based on rubric gap scores</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                3 Priorities
              </span>
            </div>

            {/* Action Item List */}
            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff] flex items-start justify-between gap-3 hover:border-[#3525cd] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white text-[#3525cd] mt-0.5 shadow-xs">
                    <span className="material-symbols-outlined text-lg">bug_report</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                      Practice Edge-Cases in Dynamic Programming
                    </h4>
                    <p className="text-xs text-[#464555] mt-0.5">
                      Automated test logs revealed 2 memory-limit errors on large constraints in 0/1 Knapsack.
                    </p>
                    <span className="text-[10px] text-[#3525cd] font-bold uppercase tracking-wider mt-1 inline-block">
                      Estimated gain: +0.20 Overall
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsIdeModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-xs font-semibold hover:bg-[#eaedff] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Solve Drill
                </button>
              </div>

              <div className="p-3 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff] flex items-start justify-between gap-3 hover:border-[#0058be] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white text-[#0058be] mt-0.5 shadow-xs">
                    <span className="material-symbols-outlined text-lg">bolt</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                      Take 15-min Speed Aptitude Drill
                    </h4>
                    <p className="text-xs text-[#464555] mt-0.5">
                      Focus on permutation combinations to raise Aptitude component from 3.0 to 3.8 before finals.
                    </p>
                    <span className="text-[10px] text-[#0058be] font-bold uppercase tracking-wider mt-1 inline-block">
                      Estimated gain: +0.20 Overall
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveQuizCategory('aptitude');
                    setIsActiveQuizOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-xs font-semibold hover:bg-[#eaedff] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Launch Drill
                </button>
              </div>

              <div className="p-3 rounded-xl border border-[#c7c4d8] bg-[#f2f3ff] flex items-start justify-between gap-3 hover:border-amber-400 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white text-amber-600 mt-0.5 shadow-xs">
                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                      Reassess Domain Knowledge (Unit 3: ACID)
                    </h4>
                    <p className="text-xs text-[#464555] mt-0.5">
                      Review multi-version concurrency control before taking your scheduled second-attempt slot.
                    </p>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-1 inline-block">
                      Estimated gain: +0.125 Overall
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveQuizCategory('domain_knowledge');
                    setIsActiveQuizOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#c7c4d8] text-xs font-semibold hover:bg-[#eaedff] transition-colors whitespace-nowrap cursor-pointer"
                >
                  Re-Attempt
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#c7c4d8] text-xs text-[#464555] flex items-center justify-between">
            <span>Next cohort synchronization:</span>
            <span className="font-mono text-[#131b2e] font-semibold">In 18 hours (Batch 2024-CS)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

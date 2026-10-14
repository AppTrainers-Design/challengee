import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { Trophy, Medal, Award, Sparkles, Star, Play, ExternalLink, FileText, CheckCircle2, Shield } from 'lucide-react';

export const PublicResultsPage: React.FC = () => {
  const { lang, competition, teamSummaries, awards, submissions, schools, students } = useCompetition();
  const [selectedGameUrl, setSelectedGameUrl] = useState<string | null>(null);

  const isPublished = competition.resultsVisibility === 'published';

  if (!isPublished) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {lang === 'ar' ? 'نتائج تحدي التطبيقات 2026 قيد المراجعة الرسمية' : 'App Challenge 2026 Results Pending Announcement'}
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
          {lang === 'ar'
            ? 'تقوم لجنة التحكيم وإدارة المسابقة حالياً بالتدقيق النهائي في درجات التقييم وحساب متوسطات النقاط وفق معايير النزاهة. سيتم إعلان وتتويج الفائزين رسمياً في الموعد المحدد.'
            : 'The jury panel and competition administration are completing final verification of all evaluation rubrics and scores. Official results and winners will be announced soon.'}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>{lang === 'ar' ? 'حالة النتائج: سرية / مراجعة داخلية' : 'Current Status: Internal Review'}</span>
        </div>
      </div>
    );
  }

  const topThree = teamSummaries.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold tracking-wide uppercase">
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>{lang === 'ar' ? 'النتائج الرسمية المعتمدة' : 'Official Certified Winners'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {lang === 'ar' ? 'أبطال تحدي التطبيقات 2026' : 'App Challenge 2026 Champions'}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto">
          {lang === 'ar'
            ? 'نبارك لجميع المدارس والفرق الطلابية الفائزة في المسابقة الوطنية لتطوير الألعاب الإلكترونية'
            : 'Celebrating the ingenuity, coding excellence, and innovative game worlds built by our nation’s top school game studios.'}
        </p>
      </div>

      {/* Podium Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="order-2 md:order-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition-all text-center relative flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xl mb-3 border-2 border-slate-300">
              <Medal className="w-7 h-7 text-slate-500" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {lang === 'ar' ? 'المركز الثاني' : '2nd Place Runner Up'}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">{topThree[1].teamName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{topThree[1].schoolName}</p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 rounded-full font-extrabold text-sm text-slate-800">
              {topThree[1].averageScore} / 100
            </div>
            <p className="text-xs font-semibold text-blue-600 mt-2">🎮 {topThree[1].gameName}</p>
          </div>
        )}

        {/* 1st Place - Champion */}
        {topThree[0] && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-amber-400 p-8 shadow-xl text-center relative flex flex-col items-center transform md:-translate-y-4">
            <div className="absolute -top-5 px-4 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-full shadow-md flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-white" />
              <span>{lang === 'ar' ? 'بطل المملكة' : 'National Champion'}</span>
            </div>
            <div className="w-20 h-20 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-2xl mb-3 shadow-lg shadow-amber-500/30">
              <Trophy className="w-10 h-10" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
              {lang === 'ar' ? 'المركز الأول' : '1st Place Champion'}
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{topThree[0].teamName}</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{topThree[0].schoolName}</p>
            <div className="mt-4 inline-block px-4 py-1.5 bg-amber-400 text-slate-950 rounded-full font-black text-base shadow-sm">
              {topThree[0].averageScore} / 100
            </div>
            <div className="mt-3 p-2.5 bg-white/80 border border-amber-200 rounded-xl text-xs">
              <p className="font-bold text-slate-800">🎮 {topThree[0].gameName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lang === 'ar' ? 'أعلى تقييم في دقة الفيزياء وتجربة المستخدم' : 'Highest rated in physics accuracy and player UX'}
              </p>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="order-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-md hover:shadow-lg transition-all text-center relative flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xl mb-3 border-2 border-amber-300">
              <Award className="w-7 h-7 text-amber-700" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {lang === 'ar' ? 'المركز الثالث' : '3rd Place Bronze'}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">{topThree[2].teamName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{topThree[2].schoolName}</p>
            <div className="mt-3 inline-block px-3 py-1 bg-amber-50 rounded-full font-extrabold text-sm text-amber-800">
              {topThree[2].averageScore} / 100
            </div>
            <p className="text-xs font-semibold text-emerald-700 mt-2">🎮 {topThree[2].gameName}</p>
          </div>
        )}
      </div>

      {/* Special Award Categories Grid */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>{lang === 'ar' ? 'الجوائز التقديرية وفئات التميز' : 'Special Distinction Awards'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {awards.map((award) => {
            const team = teamSummaries.find((t) => t.teamId === award.assignedTeamId);
            return (
              <div
                key={award.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                    <Star className="w-5 h-5 fill-indigo-600 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">
                    {lang === 'ar' ? award.titleAr : award.titleEn}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {lang === 'ar' ? award.descriptionAr : award.descriptionEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-0.5">
                    {lang === 'ar' ? 'الفريق الفائز:' : 'Awarded Team:'}
                  </span>
                  {team ? (
                    <div>
                      <span className="font-bold text-xs text-indigo-700">{team.teamName}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{team.schoolName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      {lang === 'ar' ? 'قيد التخصيص' : 'Pending Selection'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">
          {lang === 'ar' ? 'الترتيب العام المعتمد لجميع الفرق' : 'Complete Official Tournament Standings'}
        </h2>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الترتيب' : 'Rank'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الفريق' : 'Team'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'المدرسة' : 'School'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'اللعبة' : 'Game'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'ar' ? 'المحكمون' : 'Judges'}</th>
                  <th className="py-3 px-4 text-center">{lang === 'ar' ? 'المعدل النهائي' : 'Final Score'}</th>
                  <th className="py-3 px-4 text-start">{lang === 'ar' ? 'الجائزة' : 'Award'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamSummaries.map((team) => (
                  <tr key={team.teamId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-sm text-slate-800">
                      {team.rank === 1 ? '🥇 #1' : team.rank === 2 ? '🥈 #2' : team.rank === 3 ? '🥉 #3' : `#${team.rank}`}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{team.teamName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{team.schoolName}</td>
                    <td className="py-3.5 px-4 text-indigo-600 font-medium">🎮 {team.gameName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                        {team.completedEvaluationsCount} / {team.assignedJudgesCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-sm text-slate-900">
                      {team.averageScore}
                    </td>
                    <td className="py-3.5 px-4">
                      {team.awardedCategory ? (
                        <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
                          {team.awardedCategory}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

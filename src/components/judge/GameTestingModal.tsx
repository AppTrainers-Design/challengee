import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Trophy,
  Volume2,
  VolumeX,
  Compass,
  Wind,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { GameSubmission, Language } from '../../types';

interface GameTestingModalProps {
  submission: GameSubmission;
  lang: Language;
  onClose: () => void;
  onOpenRubric: (teamId: string) => void;
}

export const GameTestingModal: React.FC<GameTestingModalProps> = ({
  submission,
  lang,
  onClose,
  onOpenRubric,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro');

  // Interactive Mini-Demo State for Petra Chronicles
  const [petraValves, setPetraValves] = useState([false, false, false, false]);
  const [waterPressure, setWaterPressure] = useState(25);

  // Interactive Mini-Demo State for AeroClean
  const [dronePos, setDronePos] = useState({ x: 50, y: 50 });
  const [particlesCollected, setParticlesCollected] = useState(0);
  const [airQuality, setAirQuality] = useState(280); // AQI: 280 is hazardous, target < 50

  const isPetra = submission.id === 'sub-petra-legacy' || submission.gameNameEn.includes('Petra');
  const isAero = submission.id === 'sub-sky-sweeper' || submission.gameNameEn.includes('AeroClean');

  // Toggle valve for Petra
  const handleToggleValve = (idx: number) => {
    const next = [...petraValves];
    next[idx] = !next[idx];
    setPetraValves(next);
    const activeCount = next.filter(Boolean).length;
    const newPressure = 25 + activeCount * 18.75;
    setWaterPressure(newPressure);
    setScore(activeCount * 250);
    if (activeCount === 4) {
      setGameState('completed');
    }
  };

  // Steer drone for AeroClean
  const moveDrone = (dx: number, dy: number) => {
    setDronePos((prev) => {
      const nx = Math.max(10, Math.min(90, prev.x + dx));
      const ny = Math.max(10, Math.min(90, prev.y + dy));
      return { x: nx, y: ny };
    });
    setParticlesCollected((p) => {
      const next = p + 1;
      setScore(next * 120);
      setAirQuality((aq) => Math.max(32, aq - 18));
      if (next >= 12) {
        setGameState('completed');
      }
      return next;
    });
  };

  const handleResetGame = () => {
    setScore(0);
    setGameState('playing');
    setPetraValves([false, false, false, false]);
    setWaterPressure(25);
    setDronePos({ x: 50, y: 50 });
    setParticlesCollected(0);
    setAirQuality(280);
  };

  // Keyboard navigation for testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        moveDrone(0, -10);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveDrone(0, 10);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveDrone(-10, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveDrone(10, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  {lang === 'ar' ? submission.gameNameAr : submission.gameNameEn}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  {submission.genre}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Web Sandbox (60 FPS)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'بيئة المحاكاة التفاعلية المباشرة لاختبار ميكانيكا اللعبة وجودة التجربة'
                  : 'Interactive real-time test environment to evaluate gameplay feel and mechanics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute SFX' : 'Unmute SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Play Canvas Area */}
        <div className="relative bg-slate-950 aspect-video w-full flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {gameState === 'intro' ? (
            <div className="relative z-10 text-center max-w-md p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                {isPetra ? <Compass className="w-8 h-8" /> : isAero ? <Wind className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  {lang === 'ar' ? submission.gameNameAr : submission.gameNameEn}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {lang === 'ar' ? submission.shortDescAr : submission.shortDescEn}
                </p>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 text-start space-y-1">
                <span className="font-bold text-amber-400 block mb-1">
                  {lang === 'ar' ? 'أهداف تجربة التحكيم السريعة:' : 'Jury Playtest Objectives:'}
                </span>
                {isPetra ? (
                  <>
                    <p>• {lang === 'ar' ? 'افتح الصمامات الأربعة لربط قنوات سريان المياه بالبتراء' : 'Open the 4 hydraulic valves to route water to the Great Temple'}</p>
                    <p>• {lang === 'ar' ? 'راقب استجابة المؤشرات والضغط الهيدروليكي وجودة الصوت' : 'Observe pressure gauges, water shaders, and audio responsiveness'}</p>
                  </>
                ) : isAero ? (
                  <>
                    <p>• {lang === 'ar' ? 'حرك الطائرة المسيّرة عبر الأسهم أو WASD لامتصاص ذرات الدخان' : 'Steer drone via Arrow keys or WASD to collect atmospheric smog'}</p>
                    <p>• {lang === 'ar' ? 'خفض مؤشر تلوث الهواء AQI من 280 إلى المعدل الصحي (<50)' : 'Reduce Air Quality Index (AQI) from toxic 280 to safe zone (<50)'}</p>
                  </>
                ) : (
                  <>
                    <p>• {lang === 'ar' ? 'اختبر سلاسة الإطارات (60 FPS) واستجابة أزرار التحكم' : 'Test framerate stability (60 FPS) and input responsiveness'}</p>
                    <p>• {lang === 'ar' ? 'تحقق من توازن الصعوبة وملاءمة واجهة المستخدم (UI/UX)' : 'Verify mechanic pacing and HUD accessibility balance'}</p>
                  </>
                )}
              </div>

              <button
                onClick={() => setGameState('playing')}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg flex items-center gap-2 mx-auto cursor-pointer transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{lang === 'ar' ? 'بدء تجربة اللعبة الحية' : 'Launch Interactive Playtest'}</span>
              </button>
            </div>
          ) : isPetra ? (
            /* PETRA CHRONICLES INTERACTIVE PUZZLE */
            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
              {/* HUD */}
              <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-xs p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-amber-400 font-bold">
                    {lang === 'ar' ? 'الضغط الهيدروليكي للمياه:' : 'Hydraulic Water Pressure:'}
                  </span>
                  <div className="w-32 bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${waterPressure}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-300">{Math.round(waterPressure)}%</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-400">
                    {lang === 'ar' ? 'النقاط:' : 'Score:'} <strong className="text-amber-400">{score}</strong>
                  </span>
                  <span className="text-slate-400">
                    {lang === 'ar' ? 'الصمامات المفتوحة:' : 'Valves Open:'}{' '}
                    <strong className="text-emerald-400">{petraValves.filter(Boolean).length}/4</strong>
                  </span>
                </div>
              </div>

              {/* Puzzle Stage (Ancient Cistern Routing) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-auto">
                {[
                  {
                    nameEn: 'Siq Conduit Alpha',
                    nameAr: 'قناة السيق العلوية',
                    descEn: 'Canyon gravity channel',
                    descAr: 'مجرى مياه الصدع الصخري',
                  },
                  {
                    nameEn: 'Treasury Cistern',
                    nameAr: 'خزان الخزنة الملكي',
                    descEn: 'Subterranean sandstone vault',
                    descAr: 'حوض الترسيب المنحوت بالصخر',
                  },
                  {
                    nameEn: 'Monastery Aqueduct',
                    nameAr: 'قناة الدير الغربية',
                    descEn: 'Terrace irrigation conduit',
                    descAr: 'قناة ري الحدائق النبطية',
                  },
                  {
                    nameEn: 'Royal Tomb Overflow',
                    nameAr: 'صمام الأمان والفيضان',
                    descEn: 'Flash flood diverter system',
                    descAr: 'نظام تصريف فيضانات الشتاء',
                  },
                ].map((valve, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleValve(idx)}
                    className={`p-4 rounded-2xl border transition-all text-start cursor-pointer flex flex-col justify-between h-36 ${
                      petraValves[idx]
                        ? 'bg-cyan-950/60 border-cyan-500/50 shadow-md shadow-cyan-900/30 text-white'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">
                        VALVE #{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? valve.nameAr : valve.nameEn}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? valve.descAr : valve.descEn}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] font-semibold">
                      <span>{lang === 'ar' ? 'الحالة:' : 'Status:'}</span>
                      <span className={petraValves[idx] ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                        {petraValves[idx]
                          ? lang === 'ar'
                            ? 'تدفق نشط 🌊'
                            : 'Flow Active 🌊'
                          : lang === 'ar'
                          ? 'مغلق (انقر للفتح)'
                          : 'Closed (Click)'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Compass className="w-4 h-4 text-amber-400" />
                  {lang === 'ar'
                    ? 'انقر على الصمامات الأربعة لفتح شبكة المياه بالكامل والتأكد من استقرار الميكانيكا'
                    : 'Click all 4 valves to align ancient aqueduct pressure channels'}
                </span>
                <button
                  onClick={handleResetGame}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'إعادة تشغيل' : 'Reset'}</span>
                </button>
              </div>
            </div>
          ) : isAero ? (
            /* AEROCLEAN SKY PATROL INTERACTIVE SIMULATION */
            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
              {/* HUD */}
              <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-xs p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      {lang === 'ar' ? 'مؤشر جودة الهواء (AQI):' : 'City Air Quality (AQI):'}
                    </span>
                    <span
                      className={`text-sm font-black font-mono ${
                        airQuality < 60
                          ? 'text-emerald-400'
                          : airQuality < 150
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {airQuality} AQI · {airQuality < 60 ? 'Optimal' : airQuality < 150 ? 'Moderate' : 'Toxic Smog'}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-slate-800" />

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      {lang === 'ar' ? 'جزيئات ممتصة:' : 'Particles Filtered:'}
                    </span>
                    <span className="text-sm font-black text-cyan-300 font-mono">
                      {particlesCollected} / 12 PM2.5
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    {lang === 'ar' ? 'النقاط:' : 'Score:'} <strong className="text-amber-400">{score}</strong>
                  </span>
                  <button
                    onClick={handleResetGame}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Reset Drone"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sky Flight Area */}
              <div className="relative flex-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl my-3 overflow-hidden">
                {/* Smog Cloud Overlay */}
                <div
                  className="absolute inset-0 bg-amber-950/20 transition-opacity duration-500 pointer-events-none"
                  style={{ opacity: Math.max(0.1, airQuality / 300) }}
                />

                {/* Drone Visual Element */}
                <div
                  className="absolute w-12 h-12 -ml-6 -mt-6 transition-all duration-150 flex items-center justify-center pointer-events-none"
                  style={{ left: `${dronePos.x}%`, top: `${dronePos.y}%` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50 flex items-center justify-center animate-pulse">
                    <Wind className="w-5 h-5 text-cyan-200" />
                  </div>
                </div>

                {/* Smog Particles Floating */}
                {[
                  { x: 25, y: 30 },
                  { x: 75, y: 25 },
                  { x: 35, y: 70 },
                  { x: 80, y: 75 },
                  { x: 50, y: 40 },
                  { x: 65, y: 55 },
                ].map((pt, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setDronePos({ x: pt.x, y: pt.y });
                      moveDrone(0, 0);
                    }}
                    className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
                    style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                ))}
              </div>

              {/* Controls Bar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{lang === 'ar' ? 'التحكم بالطائرة:' : 'Controls:'}</span>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <button
                      onClick={() => moveDrone(0, -15)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      ▲ W
                    </button>
                    <button
                      onClick={() => moveDrone(-15, 0)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      ◀ A
                    </button>
                    <button
                      onClick={() => moveDrone(0, 15)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      ▼ S
                    </button>
                    <button
                      onClick={() => moveDrone(15, 0)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      ▶ D
                    </button>
                  </div>
                </div>

                <span className="text-slate-400">
                  {lang === 'ar'
                    ? 'أو انقر على جزيئات الدخان البرتقالية لاصطيادها مباشرة'
                    : 'Or click the floating smog particles to capture'}
                </span>
              </div>
            </div>
          ) : (
            /* GENERIC GAME PLAYTEST SIMULATOR */
            <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-amber-400 font-bold">Standard WebGL Playtest Mode</span>
                <span className="font-mono text-slate-400">FPS: 60 · Latency: 4ms</span>
              </div>

              <div className="my-auto text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                  <Play className="w-7 h-7 fill-current" />
                </div>
                <h4 className="text-base font-bold text-white">
                  {lang === 'ar' ? submission.gameNameAr : submission.gameNameEn}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {lang === 'ar'
                    ? 'محاكاة اللعب التفاعلية جاهزة للاختبار والتقييم'
                    : 'Interactive playtest loop ready for inspection'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setScore((s) => s + 100)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'اختبار تفاعل أزرار اللعب (+100 نقطة)' : 'Simulate Input Loop (+100)'}
                  </button>
                  <span className="font-mono text-amber-400 font-bold text-xs">{score} PTS</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center">
                {lang === 'ar'
                  ? 'تم استيفاء معايير استقرار المحرك والفيزياء البرمجية'
                  : 'Engine mechanics and physics loops verified stable'}
              </div>
            </div>
          )}

          {/* Success Banner when test objective reached */}
          {gameState === 'completed' && (
            <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-6 text-center">
              <div className="max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {lang === 'ar' ? 'اكتملت التجربة بنجاح!' : 'Playtest Loop Completed!'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {isPetra
                      ? lang === 'ar'
                        ? 'تم تدفق المياه بنجاح عبر كافة القنوات الهيدروليكية النبطية. اللعبة تقدم ميكانيكا استثنائية وأصالة تاريخية عالية.'
                        : 'Water successfully delivered to all Nabataean cisterns! Excellent mechanics and authenticity.'
                      : isAero
                      ? lang === 'ar'
                        ? 'تم تنقية سماء المدينة بنجاح وخفض مؤشر التلوث إلى المعدل الصحي (Optimal AQI). تحكم سلس وتجربة ممتعة.'
                        : 'City atmosphere cleared to optimal levels! Smooth controls and great educational engagement.'
                      : lang === 'ar'
                      ? 'تم التحقق من ميكانيكا اللعبة وسلاسة الإطارات.'
                      : 'Play mechanics and 60 FPS verified successfully.'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetGame}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'إعادة التجربة' : 'Replay Demo'}
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRubric(submission.teamId);
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'فتح استمارة التحكيم ورصد الدرجات' : 'Open Rubric & Score Game'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with External Links and Scoring Action */}
        <div className="p-5 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {submission.webGameUrl && (
              <a
                href={submission.webGameUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>itch.io Web Build</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {submission.pitchDeckUrl && (
              <a
                href={submission.pitchDeckUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Pitch Deck (PDF)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {submission.gddDocumentUrl && (
              <a
                href={submission.gddDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>GDD Document</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto"
            >
              {lang === 'ar' ? 'إغلاق المعاينة' : 'Close Sandbox'}
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenRubric(submission.teamId);
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all hover:scale-105 w-full sm:w-auto"
            >
              <Sliders className="w-4 h-4" />
              <span>{lang === 'ar' ? 'فتح استمارة التحكيم الآن' : 'Score Submission Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

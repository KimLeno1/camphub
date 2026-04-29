import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, Circle, Trophy, Zap, Clock, ShieldCheck, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const QUIZZES = [
  {
    id: 1,
    title: 'Algebra Foundations',
    subject: 'Math',
    xpReward: 100,
    time: '5 mins',
    difficulty: 'Basic',
    questions: [
      { q: 'What is x if 2x + 4 = 10?', options: ['x = 2', 'x = 3', 'x = 4', 'x = 6'], correct: 1 },
      { q: 'Simplify: 3(x - 2)', options: ['3x - 2', '3x - 6', 'x - 6', '3x - 5'], correct: 1 }
    ]
  },
  {
    id: 2,
    title: 'Cell Structure & Energy',
    subject: 'Biology',
    xpReward: 250,
    time: '12 mins',
    difficulty: 'Sovereign',
    questions: [
      { q: 'Which organelle is known as the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'], correct: 1 }
    ]
  }
];

export function Quizzes() {
  const { tenant, awardXP } = useAppContext();
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const quiz = QUIZZES.find(q => q.id === activeQuiz);

  const startQuiz = (id: number) => {
    setActiveQuiz(id);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setQuizCompleted(false);
    setScore(0);
  };

  const handleNext = () => {
    if (!quiz || selectedOption === null) return;
    
    if (selectedOption === quiz.questions[currentQuestion].correct) {
      setScore(s => s + 1);
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      const finalScore = score + (selectedOption === quiz.questions[currentQuestion].correct ? 1 : 0);
      const isPerfect = finalScore === quiz.questions.length;
      
      if (isPerfect) {
        awardXP(quiz.xpReward, `Terminal Success: ${quiz.title}`);
      } else if (finalScore > 0) {
        awardXP(Math.floor(quiz.xpReward * (finalScore/quiz.questions.length)), `Validation Complete: ${quiz.title}`);
      }
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
  };

  if (activeQuiz && quiz) {
    return (
      <div className="max-w-3xl mx-auto min-h-[60vh] flex flex-col justify-center py-10">
        <AnimatePresence mode="wait">
          {quizCompleted ? (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bento-card bg-white p-12 text-center border-slate-100 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-green-500" />
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100">
                <Trophy className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">Quest Success</h2>
              <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">
                Institutional validation complete. You achieved <span className="text-slate-900 font-black">{score}/{quiz.questions.length}</span> efficiency on the {quiz.title} module.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button 
                  onClick={closeQuiz}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition shadow-xl"
                >
                  Return to Archive
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="question"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bento-card bg-white p-8 md:p-12 border-slate-100 shadow-2xl relative text-left"
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                   <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-1">{quiz.title}</h2>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      <ShieldCheck className="w-4 h-4" /> Secure Validation Session
                   </div>
                </div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Protocol {currentQuestion + 1} / {quiz.questions.length}</span>
              </div>
              
              <div className="w-full bg-slate-100 h-1.5 rounded-full mb-12 overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${((currentQuestion) / quiz.questions.length) * 100}%` }}
                   className="bg-indigo-600 h-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                 />
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-10 tracking-tight leading-tight">{quiz.questions[currentQuestion].q}</h3>
              
              <div className="space-y-4 mb-12">
                {quiz.questions[currentQuestion].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(i)}
                    className={cn(
                      "w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 group",
                      selectedOption === i 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 scale-[1.02] shadow-xl shadow-indigo-100' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                    )}
                  >
                    <span className="font-bold text-lg">{opt}</span>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedOption === i ? "border-indigo-600 bg-indigo-600" : "border-slate-200"
                    )}>
                       {selectedOption === i && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                <button 
                  onClick={closeQuiz}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition"
                >
                  Terminate Quest
                </button>
                <button
                  disabled={selectedOption === null}
                  onClick={handleNext}
                  className="bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition shadow-xl shadow-indigo-100 flex items-center gap-2"
                >
                  {currentQuestion === quiz.questions.length - 1 ? 'Finalize' : 'Confirm & Proceed'} 
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Merit Quests</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-[10px] tracking-widest">Knowledge Validation Engine for {tenant.name}</p>
        </div>
        <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl">
           <button className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-[10px] font-black uppercase tracking-widest text-indigo-600">Active</button>
           <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Archived</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {QUIZZES.map(quiz => (
          <div 
            key={quiz.id} 
            onClick={() => startQuiz(quiz.id)}
            className="bento-card bg-white p-8 border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all group cursor-pointer text-left overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700">
               <Zap className="w-32 h-32" />
            </div>
            
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" /> {quiz.subject}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 text-[10px] font-black uppercase tracking-widest">
                 <Zap className="w-3.5 h-3.5" /> +{quiz.xpReward} CR
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition tracking-tight uppercase relative z-10">{quiz.title}</h3>
            
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 relative z-10">
               <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {quiz.time}</span>
               <span className="flex items-center gap-1.5"><ChevronRight className="w-4 h-4" /> {quiz.questions.length} Modules</span>
               <span className={cn(
                 "px-2 py-0.5 rounded border",
                 quiz.difficulty === 'Sovereign' ? "text-amber-600 bg-amber-50 border-amber-100" : "text-slate-400 bg-slate-50 border-slate-100"
               )}>{quiz.difficulty}</span>
            </div>
            
            <button className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-slate-200 relative z-10">
               Initialize Sync
            </button>
          </div>
        ))}
      </div>

      <div className="bento-card bg-slate-50 border-dashed border-slate-200 p-12 text-center">
         <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Plus className="w-8 h-8" />
         </div>
         <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Custom Institutional Challenges</h4>
         <p className="text-xs text-slate-400 font-medium mt-2">Faculty can provision custom merit modules for specific course benchmarks.</p>
      </div>
    </div>
  );
}


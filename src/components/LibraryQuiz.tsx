import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Library, useStore } from '../store/useStore';
import { generateQuiz, QuizQuestion } from '../lib/gemini';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { haptic } from '../lib/haptics';

interface Props {
  library: Library;
  myLibrary: Library | null;
  onClose: () => void;
  onConquered: () => void;
}

export function LibraryQuiz({ library, myLibrary, onClose, onConquered }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function load() {
      let texts: string[] = [];
      if (myLibrary && myLibrary.articles?.length > 0) {
          texts.push(...myLibrary.articles.map(a => a.article.title + ": " + a.article.extract));
      }
      if (library.articles?.length > 0) {
          texts.push(...library.articles.map(a => a.article.title + ": " + a.article.extract));
      }
      if (texts.length === 0) {
          texts = ["The Colosseum is an elliptical amphitheatre in the centre of the city of Rome, Italy.", "Apollo 11 was the spaceflight that first landed humans on the Moon.", "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy."];
      }
         
      const generated = await generateQuiz(texts);
      setQuestions(generated);
      setLoading(false);
    }
    load();
  }, [library, myLibrary]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[currentIndex]?.correctIndex;
    if (correct) {
       setScore(s => s + 1);
       haptic.success();
    } else {
       haptic.error();
    }
    
    setTimeout(() => {
       if (currentIndex < questions.length - 1) {
          setCurrentIndex(i => i + 1);
          setSelected(null);
       } else {
          setFinished(true);
          if (score + (correct ? 1 : 0) === questions.length) {
             onConquered();
          }
       }
    }, 1500);
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex flex-col p-6 items-center justify-center">
       {loading ? (
         <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mb-4" />
            <p className="text-amber-400 font-bold uppercase tracking-widest text-xs">Generating Challenge...</p>
         </div>
       ) : finished ? (
         <div className="text-center w-full max-w-sm bg-white/5 border border-white/10 p-8 rounded-[32px]">
            {score === questions.length ? (
               <>
                  <div className="mx-auto w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
                     <Shield size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Dominance Achieved!</h2>
                  <p className="text-neutral-400 mb-6 text-sm">You answered all questions correctly and gained Dominance over {library.name} for 7 days.</p>
               </>
            ) : (
               <>
                  <div className="mx-auto w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                     <XCircle size={28} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Defeated</h2>
                  <p className="text-neutral-400 mb-6 text-sm">You got {score}/{questions.length} correct. You have been granted a "Revenge" buff for your next attempt!</p>
               </>
            )}
            <button onClick={onClose} className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors">Return to Map</button>
         </div>
       ) : questions.length > 0 ? (
         <div className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Question {currentIndex + 1}/{questions.length}</h3>
               <button onClick={onClose} className="text-neutral-500">×</button>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-8 leading-relaxed">
               {questions[currentIndex].question}
            </h2>
            
            <div className="flex flex-col gap-3">
               {questions[currentIndex].options.map((opt, idx) => {
                  let stateClass = "bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10";
                  if (selected !== null) {
                     if (idx === questions[currentIndex].correctIndex) {
                        stateClass = "bg-teal-500/20 text-teal-400 border-teal-500/40";
                     } else if (idx === selected) {
                        stateClass = "bg-red-500/20 text-red-400 border-red-500/40";
                     } else {
                        stateClass = "bg-white/5 text-neutral-600 border-white/5 opacity-50";
                     }
                  }
                  
                  return (
                     <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${stateClass} flex items-center justify-between`}
                     >
                        <span className="font-medium">{opt}</span>
                        {selected !== null && idx === questions[currentIndex].correctIndex && <CheckCircle size={18} />}
                        {selected === idx && idx !== questions[currentIndex].correctIndex && <XCircle size={18} />}
                     </button>
                  );
               })}
            </div>
         </div>
       ) : (
         <div className="text-center">
            <h3 className="text-white mb-4">Error loading quiz</h3>
            <button onClick={onClose} className="bg-white/10 px-4 py-2 rounded-xl text-white">Close</button>
         </div>
       )}
    </div>
  );
}

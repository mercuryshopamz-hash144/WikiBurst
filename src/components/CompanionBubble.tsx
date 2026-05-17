import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import { haptic } from '../lib/haptics';

const DIALOGUES = {
  Einstein: {
    happy: ["Curiosity has its own reason for existing.", "The important thing is not to stop questioning.", "A new idea comes suddenly and in a rather intuitive way."],
    excited: ["Imagination is more important than knowledge!", "It's a miracle that curiosity survives formal education!", "We cannot solve our problems with the same thinking we used when we created them!"],
    neutral: ["Space and time are not conditions in which we live, they are modes in which we think.", "Look deep into nature, and then you will understand everything better."],
    sad: ["It is not that I'm so smart, it's just that I stay with problems longer.", "A person who never made a mistake never tried anything new."]
  },
  'Da Vinci': {
    happy: ["Learning never exhausts the mind.", "Simplicity is the ultimate sophistication."],
    excited: ["I have been impressed with the urgency of doing. Knowing is not enough; we must apply!", "Art is never finished, only abandoned!"],
    neutral: ["Study without desire spoils the memory.", "Water is the driving force of all nature."],
    sad: ["I have offended God and mankind because my work didn't reach the quality it should have.", "Tears come from the heart and not from the brain."]
  },
  Cleopatra: {
    happy: ["I will not be triumphed over.", "Fool! Don't you see now that I could have poisoned you a hundred times had I been able to live without you?"],
    excited: ["I am Isis, floating on my barge down the Nile!", "My beauty is not my only weapon!"],
    neutral: ["A woman's mind is as complex as the empire she rules.", "All strange and terrible events are welcome."],
    sad: ["I die a Queen.", "No one will command me."]
  },
  Socrates: {
    happy: ["Wonder is the beginning of wisdom.", "To find yourself, think for yourself."],
    excited: ["I cannot teach anybody anything. I can only make them think!", "Education is the kindling of a flame, not the filling of a vessel!"],
    neutral: ["The only true wisdom is in knowing you know nothing.", "An unexamined life is not worth living."],
    sad: ["There is only one good, knowledge, and one evil, ignorance.", "Falling down is not a failure. Failure comes when you stay where you have fallen."]
  },
  Oppenheimer: {
    happy: ["The optimist thinks this is the best of all possible worlds. The pessimist fears it is true.", "There are children playing in the streets who could solve some of my top problems in physics, because they have modes of sensory perception that I lost long ago."],
    excited: ["Now I am become Death, the destroyer of worlds.", "We knew the world would not be the same."],
    neutral: ["Any man whose errors take ten years to correct is quite a man.", "No man should escape our universities without knowing how little he knows."],
    sad: ["It is a profound and necessary truth that the deep things in science are not found because they are useful; they are found because it was possible to find them.", "I feel I have blood on my hands."]
  },
  Aura: {
    happy: ["Great job! Your brain is growing stronger.", "I love seeing you learn new things.", `Let's keep the streak alive!`],
    excited: ["Incredible! You're an absolute legend!", "This is the best burst session ever!"],
    neutral: ["Take your time. The world is full of wonders.", "I'm here whenever you're ready to explore."],
    sad: ["I missed you! Don't worry, we can rebuild our momentum.", "Every master was once a beginner."]
  }
};

const EMOJIS = {
  Einstein: '👨‍🔬',
  'Da Vinci': '🎨',
  Cleopatra: '👑',
  Socrates: '🏛️',
  Oppenheimer: '⚛️',
  Aura: '✨'
};

export function CompanionBubble() {
  const { companionName, companionMood } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [dialogue, setDialogue] = useState('');

  useEffect(() => {
    // Show randomly or when mood changes
    const dList = DIALOGUES[companionName as keyof typeof DIALOGUES]?.[companionMood] || DIALOGUES['Aura'].neutral;
    const randomDialogue = dList[Math.floor(Math.random() * dList.length)];
    setDialogue(randomDialogue);
    
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [companionMood, companionName]);

  // Occasional random pop-up
  useEffect(() => {
    const randomTimer = setInterval(() => {
      if (Math.random() > 0.8) {
        const dList = DIALOGUES[companionName as keyof typeof DIALOGUES]?.[companionMood] || DIALOGUES['Aura'].neutral;
        const randomDialogue = dList[Math.floor(Math.random() * dList.length)];
        setDialogue(randomDialogue);
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 6000);
      }
    }, 30000); // Check every 30s
    return () => clearInterval(randomTimer);
  }, [companionName, companionMood]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-[100px] left-4 right-4 z-40 flex items-end gap-3 pointer-events-none"
      >
        <div className="w-12 h-12 rounded-full bg-teal-500/20 backdrop-blur-xl border border-teal-500/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(45,212,191,0.2)] shrink-0 shadow-inner">
          {EMOJIS[companionName as keyof typeof EMOJIS] || '✨'}
        </div>
        <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl rounded-bl-none p-3 shadow-xl relative pointer-events-auto max-w-[280px]">
           <button onClick={() => setIsVisible(false)} className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white">
             <X size={12} />
           </button>
           <p className="text-sm text-white leading-snug">{dialogue}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

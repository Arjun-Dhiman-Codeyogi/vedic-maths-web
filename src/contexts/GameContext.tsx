import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StudentData {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalProblems: number;
  accuracy: number;
  badges: string[];
  classGrade: number;
}

interface GameContextType {
  student: StudentData;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addBadge: (badge: string) => void;
  updateAccuracy: (correct: boolean) => void;
}

const defaultStudent: StudentData = {
  name: 'Student',
  level: 3,
  xp: 450,
  xpToNext: 600,
  streak: 7,
  totalProblems: 234,
  accuracy: 78,
  badges: ['🌟 First Step', '🔥 Week Warrior', '🧮 Abacus Beginner', '⚡ Speed Solver'],
  classGrade: 6,
};

const GameContext = createContext<GameContextType>({
  student: defaultStudent,
  addXP: () => {},
  incrementStreak: () => {},
  resetStreak: () => {},
  addBadge: () => {},
  updateAccuracy: () => {},
});

export const useGame = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentData>(defaultStudent);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const displayName = session.user.user_metadata?.display_name || 
                           session.user.email?.split('@')[0] || 
                           'Student';
        setStudent(prev => ({ ...prev, name: displayName }));
      } else {
        setStudent(prev => ({ ...prev, name: 'Student' }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const displayName = session.user.user_metadata?.display_name || 
                           session.user.email?.split('@')[0] || 
                           'Student';
        setStudent(prev => ({ ...prev, name: displayName }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addXP = (amount: number) => {
    setStudent(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNext;
      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel++;
        newXPToNext = Math.floor(newXPToNext * 1.3);
      }
      return { ...prev, xp: newXP, level: newLevel, xpToNext: newXPToNext };
    });
  };

  const incrementStreak = () => setStudent(prev => ({ ...prev, streak: prev.streak + 1 }));
  const resetStreak = () => setStudent(prev => ({ ...prev, streak: 0 }));
  const addBadge = (badge: string) => setStudent(prev => ({ ...prev, badges: [...prev.badges, badge] }));
  const updateAccuracy = (correct: boolean) => {
    setStudent(prev => {
      const total = prev.totalProblems + 1;
      const correctCount = Math.round(prev.accuracy * prev.totalProblems / 100) + (correct ? 1 : 0);
      return { ...prev, totalProblems: total, accuracy: Math.round(correctCount / total * 100) };
    });
  };

  return (
    <GameContext.Provider value={{ student, addXP, incrementStreak, resetStreak, addBadge, updateAccuracy }}>
      {children}
    </GameContext.Provider>
  );
};

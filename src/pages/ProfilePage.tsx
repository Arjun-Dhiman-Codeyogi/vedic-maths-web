import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { supabase } from '@/integrations/supabase/client';
import { User as UserIcon, TrendingUp, Target, Zap, Brain, BarChart3, Globe, Flame, LogIn, LogOut, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ProfilePage = () => {
  const { lang, toggleLang, t } = useLanguage();
  const { student, daysCount } = useGame();
  const navigate = useNavigate();
  const xpPercent = Math.round((student.xp / student.xpToNext) * 100);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const weeklyData = [
    { day: 'Mon', problems: 25, accuracy: 80 },
    { day: 'Tue', problems: 32, accuracy: 75 },
    { day: 'Wed', problems: 18, accuracy: 88 },
    { day: 'Thu', problems: 40, accuracy: 72 },
    { day: 'Fri', problems: 35, accuracy: 85 },
    { day: 'Sat', problems: 45, accuracy: 90 },
    { day: 'Sun', problems: 28, accuracy: 82 },
  ];

  const topicMastery = [
    { name: t('Addition', 'जोड़'), progress: 85 },
    { name: t('Subtraction', 'घटाव'), progress: 60 },
    { name: t('Multiplication', 'गुणा'), progress: 40 },
    { name: t('Division', 'भाग'), progress: 20 },
    { name: t('Squares', 'वर्ग'), progress: 10 },
  ];

  const weakAreas = [
    { topic: t('Large number multiplication', 'बड़ी संख्या गुणा'), type: t('Calculation Error', 'गणना त्रुटि'), suggestion: t('Practice Urdhva Tiryagbhyam', 'ऊर्ध्व तिर्यग्भ्याम का अभ्यास करें') },
    { topic: t('Division with remainders', 'शेषफल वाला भाग'), type: t('Concept Gap', 'अवधारणा अंतर'), suggestion: t('Review Paravartya method', 'परावर्त्य विधि की समीक्षा करें') },
  ];

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-7xl mx-auto">
      {/* Quick Settings Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-card rounded-xl p-3 shadow-card border border-border"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-muted px-2.5 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-streak animate-fire-flicker" />
            <span className="text-xs font-bold">{student.streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-muted px-2.5 py-1.5 rounded-full">
            <span className="text-xs">⚡</span>
            <span className="text-xs font-bold">{student.xp} XP</span>
          </div>
          <button onClick={toggleLang} className="flex items-center gap-1 bg-muted px-2.5 py-1.5 rounded-full hover:bg-accent/20 transition-colors">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-bold">{lang === 'en' ? 'हि' : 'EN'}</span>
          </button>
        </div>

        {user ? (
          <button onClick={handleLogout} className="flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full hover:bg-destructive/20 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{t('Logout', 'लॉगआउट')}</span>
          </button>
        ) : (
          <button onClick={() => navigate('/auth')} className="flex items-center gap-1.5 gradient-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-warm">
            <LogIn className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">{t('Login', 'लॉगिन')}</span>
          </button>
        )}
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-2xl p-5 text-primary-foreground text-center relative overflow-hidden"
      >
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/10" />
        <div className="w-16 h-16 gradient-warm rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white/30 shadow-lg">
          <UserIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="font-display font-bold text-xl">{student.name}</h2>
        <p className="text-sm opacity-80">{t('Class', 'कक्षा')} {student.classGrade} • {t('Level', 'स्तर')} {student.level}</p>
        <div className="mt-3 max-w-[200px] mx-auto">
          <div className="flex justify-between text-xs opacity-80 mb-1">
            <span>XP</span>
            <span>{student.xp}/{student.xpToNext}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-white/80 rounded-full" animate={{ width: `${xpPercent}%` }} />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Target, label: t('Accuracy', 'सटीकता'), value: `${student.accuracy}%`, color: 'text-level' },
          { icon: Brain, label: t('Problems', 'सवाल'), value: student.totalProblems.toString(), color: 'text-secondary' },
          { icon: Zap, label: t('Streak', 'स्ट्रीक'), value: `${student.streak}🔥`, color: 'text-streak' },
          { icon: Calendar, label: t('Days', 'दिन'), value: `${daysCount}`, color: 'text-xp' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-3 shadow-card text-center border border-border">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="font-display font-bold text-lg">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-sm">{t('Weekly Activity', 'साप्ताहिक गतिविधि')}</h3>
        </div>
        <div className="flex items-end justify-between gap-1 h-24">
          {weeklyData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.problems / 50) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="w-full gradient-primary rounded-t-md min-h-[4px]"
              />
              <span className="text-[10px] text-muted-foreground font-medium">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Mastery */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <h3 className="font-display font-bold text-sm mb-3">{t('Topic Mastery', 'विषय महारत')}</h3>
        <div className="space-y-3">
          {topicMastery.map(topic => (
            <div key={topic.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{topic.name}</span>
                <span className="font-bold text-muted-foreground">{topic.progress}%</span>
              </div>
              <Progress value={topic.progress} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <h3 className="font-display font-bold text-sm">{t('Areas to Improve', 'सुधार के क्षेत्र')}</h3>
        </div>
        <div className="space-y-3">
          {weakAreas.map(area => (
            <div key={area.topic} className="bg-muted rounded-lg p-3">
              <p className="text-sm font-semibold">{area.topic}</p>
              <p className="text-xs text-destructive font-medium mt-0.5">{area.type}</p>
              <p className="text-xs text-secondary font-medium mt-1">💡 {area.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-display font-bold text-sm mb-3">{t('All Badges', 'सभी बैज')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {student.badges.map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-3 shadow-card border border-border flex items-center gap-2 hover:shadow-elevated hover:scale-105 hover:border-primary/30 transition-all duration-200 cursor-default"
            >
              <span className="text-2xl">{badge.split(' ')[0]}</span>
              <span className="text-xs font-semibold">{badge.split(' ').slice(1).join(' ')}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

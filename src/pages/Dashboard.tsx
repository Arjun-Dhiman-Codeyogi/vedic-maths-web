import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Calculator, Camera, Trophy, TrendingUp, Target, Zap, Star, ArrowRight, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const quickActions = [
  { icon: Brain, label: 'Practice', labelHi: 'अभ्यास', path: '/practice', color: 'from-primary to-secondary' },
  { icon: BookOpen, label: 'Learn Vedic', labelHi: 'वैदिक सीखें', path: '/learn', color: 'from-secondary to-accent' },
  { icon: Calculator, label: 'Abacus', labelHi: 'अबेकस', path: '/abacus', color: 'from-accent to-primary' },
  { icon: Camera, label: 'Photo Solve', labelHi: 'फोटो हल', path: '/solver', color: 'from-primary to-accent' },
];



const Dashboard = () => {
  const { t } = useLanguage();
  const { student, daysCount } = useGame();
  const xpPercent = Math.round((student.xp / student.xpToNext) * 100);

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-4xl mx-auto">
      {/* Hero Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-2xl p-5 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-sm" />
        <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-sm opacity-90 font-medium">{t('Welcome back', 'वापस स्वागत है')} 👋</p>
          <h2 className="text-2xl font-display font-bold mt-1">{student.name}!</h2>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs opacity-90 mb-1">
              <span>{t('Level', 'स्तर')} {student.level}</span>
              <span>{student.xp}/{student.xpToNext} XP</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/90 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-display font-bold text-base mb-3">{t('Quick Start', 'तुरंत शुरू करें')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={action.path}
                className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${action.color} text-primary-foreground shadow-warm transition-transform active:scale-95`}
              >
                <action.icon className="w-6 h-6" />
                <span className="font-display font-semibold text-sm">{t(action.label, action.labelHi)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Daily Stats */}
      <div>
        <h3 className="font-display font-bold text-base mb-3">{t("Your Stats", 'आपके आंकड़े')}</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Target, label: t('Accuracy', 'सटीकता'), value: `${student.accuracy}%`, color: 'text-level' },
            { icon: Zap, label: t('Streak', 'स्ट्रीक'), value: `${student.streak}🔥`, color: 'text-secondary' },
            { icon: TrendingUp, label: t('Problems', 'सवाल'), value: `${student.totalProblems}`, color: 'text-primary' },
            { icon: Calendar, label: t('Days', 'दिन'), value: `${daysCount}`, color: 'text-xp' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="bg-card rounded-xl p-3 shadow-card text-center"
            >
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-bold font-display">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weekly Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-xl p-4 shadow-card border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-xp" />
            <h3 className="font-display font-bold text-sm">{t('Weekly Challenge', 'साप्ताहिक चुनौती')}</h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium">3/5</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{t('Solve 50 multiplication problems', '50 गुणा के सवाल हल करें')}</p>
        <Progress value={60} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-secondary">+100 XP {t('Reward', 'इनाम')}</span>
          <Link to="/practice" className="text-xs font-bold text-primary flex items-center gap-1">
            {t('Continue', 'जारी रखें')} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>

      {/* Recent Badges */}
      <div>
        <h3 className="font-display font-bold text-base mb-3">{t('Your Badges', 'आपके बैज')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {student.badges.map((badge, i) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-card rounded-2xl p-4 shadow-card border border-border text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-xl gradient-primary flex items-center justify-center mb-2">
                <span className="text-3xl">{badge.split(' ')[0]}</span>
              </div>
              <p className="text-xs font-bold font-display">{badge.split(' ').slice(1).join(' ')}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

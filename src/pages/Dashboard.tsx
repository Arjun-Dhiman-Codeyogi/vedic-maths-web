import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, Calculator, Camera, Trophy, TrendingUp, Target, Zap, Star, ArrowRight, Calendar } from 'lucide-react';
import DailyBrainTeaser from '@/components/DailyBrainTeaser';
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
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-7xl mx-auto">
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
      {student.badges.length > 0 && (
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
      )}

      {/* Earn Badges Prompt (when no badges) */}
      {student.badges.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 shadow-card border border-border text-center"
        >
          <Trophy className="w-10 h-10 mx-auto mb-2 text-xp" />
          <h3 className="font-display font-bold text-sm">{t('Earn Your First Badge!', 'अपना पहला बैज कमाएं!')}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t('Start practicing to unlock badges', 'बैज अनलॉक करने के लिए अभ्यास शुरू करें')}</p>
          <Link to="/practice" className="inline-flex items-center gap-1 mt-3 gradient-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-warm">
            {t('Start Practice', 'अभ्यास शुरू करें')} <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      )}

      {/* Daily Brain Teaser */}
      <DailyBrainTeaser />

      {/* Fun Math Facts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-xl p-4 shadow-card border border-border"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Star className="w-4 h-4 text-secondary-foreground" />
          </div>
          <h3 className="font-display font-bold text-sm">{t('✨ Did You Know?', '✨ क्या आप जानते हैं?')}</h3>
        </div>
        {(() => {
          const facts = [
            t('The number 142857 is magical! Multiply it by 1-6 and get the same digits rearranged! 🤯', '142857 एक जादुई संख्या है! इसे 1-6 से गुणा करो और वही अंक अलग क्रम में आएंगे! 🤯'),
            t('Zero was invented in India by Aryabhatta! 🇮🇳', 'शून्य का आविष्कार भारत में आर्यभट्ट ने किया था! 🇮🇳'),
            t('A pizza that has radius "z" and height "a" has volume = Pi × z × z × a! 🍕', 'एक पिज्जा जिसकी त्रिज्या "z" और ऊंचाई "a" है, उसका आयतन = Pi × z × z × a! 🍕'),
            t('111,111,111 × 111,111,111 = 12345678987654321! Beautiful! ✨', '111,111,111 × 111,111,111 = 12345678987654321! कितना सुंदर! ✨'),
            t('If you shuffle a deck of cards, the order has likely never existed before in history! 🃏', 'अगर आप ताश की गड्डी फेंटें, तो वो क्रम शायद इतिहास में पहले कभी नहीं आया! 🃏'),
            t('The word "hundred" comes from "hundrath" which means 120, not 100! 💯', '"Hundred" शब्द "hundrath" से आया है जिसका मतलब 120 था, 100 नहीं! 💯'),
            t('Vedic Math can help you multiply any 2-digit number by 11 in seconds! Try 45×11 = 4_5, put 4+5=9 in middle = 495! ⚡', 'वैदिक गणित से 11 से गुणा सेकंडों में! 45×11 = 4_5, बीच में 4+5=9 = 495! ⚡'),
          ];
          const today = new Date().getDate();
          return <p className="text-sm text-foreground">{facts[today % facts.length]}</p>;
        })()}
      </motion.div>

      {/* Quick Challenges */}
      <div>
        <h3 className="font-display font-bold text-base mb-3">{t('🎯 Quick Challenges', '🎯 त्वरित चुनौतियाँ')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: t('Speed Round', 'स्पीड राउंड'), desc: t('Solve 10 problems in 60 seconds', '60 सेकंड में 10 सवाल हल करें'), icon: '⚡', path: '/practice' },
            { title: t('Vedic Tricks', 'वैदिक ट्रिक्स'), desc: t('Learn a new mental math shortcut', 'नई मानसिक गणित शॉर्टकट सीखें'), icon: '🧠', path: '/learn' },
            { title: t('Photo Challenge', 'फोटो चैलेंज'), desc: t('Snap & solve a real-world math problem', 'असली दुनिया का गणित सवाल फोटो से हल करें'), icon: '📸', path: '/solver' },
          ].map((challenge, i) => (
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <Link
                to={challenge.path}
                className="flex items-center gap-3 p-4 bg-card rounded-xl shadow-card border border-border hover:shadow-elevated transition-shadow"
              >
                <span className="text-2xl">{challenge.icon}</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm">{challenge.title}</p>
                  <p className="text-xs text-muted-foreground">{challenge.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

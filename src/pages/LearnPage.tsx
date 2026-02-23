import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle2, ChevronRight, BookOpen, Play, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Topic {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  sutra?: string;
  icon: string;
  progress: number;
  locked: boolean;
  lessons: number;
}

const topics: Topic[] = [
  { id: 'add', titleEn: 'Vedic Addition', titleHi: 'वैदिक जोड़', descEn: 'Master lightning-fast addition with Vedic Sutras', descHi: 'वैदिक सूत्रों से तेज जोड़ सीखें', sutra: 'Ekadhikena Purvena', icon: '➕', progress: 85, locked: false, lessons: 8 },
  { id: 'sub', titleEn: 'Vedic Subtraction', titleHi: 'वैदिक घटाव', descEn: 'Nikhilam method for instant subtraction', descHi: 'निखिलम विधि से तुरंत घटाव', sutra: 'Nikhilam Sutra', icon: '➖', progress: 60, locked: false, lessons: 6 },
  { id: 'mul', titleEn: 'Multiplication Tricks', titleHi: 'गुणा की ट्रिक्स', descEn: 'Urdhva Tiryagbhyam & cross multiplication', descHi: 'ऊर्ध्व तिर्यग्भ्याम और क्रॉस गुणा', sutra: 'Urdhva Tiryagbhyam', icon: '✖️', progress: 40, locked: false, lessons: 12 },
  { id: 'div', titleEn: 'Division Mastery', titleHi: 'भाग में महारत', descEn: 'Paravartya Yojayet for fast division', descHi: 'परावर्त्य योजयेत से तेज भाग', sutra: 'Paravartya Yojayet', icon: '➗', progress: 20, locked: false, lessons: 8 },
  { id: 'sq', titleEn: 'Squares & Cubes', titleHi: 'वर्ग और घन', descEn: 'Yavadunam sutra for perfect squares', descHi: 'यावदूनम सूत्र से पूर्ण वर्ग', sutra: 'Yavadunam', icon: '²', progress: 0, locked: false, lessons: 10 },
  { id: 'sqrt', titleEn: 'Square & Cube Roots', titleHi: 'वर्गमूल और घनमूल', descEn: 'Find roots instantly with Vedic methods', descHi: 'वैदिक विधियों से तुरंत मूल ज्ञात करें', icon: '√', progress: 0, locked: true, lessons: 8 },
  { id: 'dec', titleEn: 'Decimal Operations', titleHi: 'दशमलव संक्रियाएं', descEn: 'Vedic tricks for decimal calculations', descHi: 'दशमलव गणना की वैदिक ट्रिक्स', icon: '🔢', progress: 0, locked: true, lessons: 6 },
  { id: 'pct', titleEn: 'Percentages', titleHi: 'प्रतिशत', descEn: 'Calculate percentages in seconds', descHi: 'सेकंडों में प्रतिशत निकालें', icon: '%', progress: 0, locked: true, lessons: 5 },
  { id: 'alg', titleEn: 'Algebraic Tricks', titleHi: 'बीजगणित ट्रिक्स', descEn: 'Solve algebra with Vedic shortcuts', descHi: 'वैदिक शॉर्टकट से बीजगणित हल करें', icon: '𝑥', progress: 0, locked: true, lessons: 10 },
];

const categories = [
  { id: 'vedic', labelEn: 'Vedic Math', labelHi: 'वैदिक गणित' },
  { id: 'finger', labelEn: 'Finger Math', labelHi: 'उंगली गणित' },
  { id: 'brain', labelEn: 'Brain Dev', labelHi: 'मस्तिष्क विकास' },
];

const LearnPage = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('vedic');

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="font-display font-bold text-xl">{t('Learn & Master', 'सीखें और महारत हासिल करें')}</h2>
        <p className="text-sm text-muted-foreground">{t('Vedic Math, Abacus & Brain Power', 'वैदिक गणित, अबेकस और मस्तिष्क शक्ति')}</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? 'gradient-primary text-primary-foreground shadow-warm'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {t(cat.labelEn, cat.labelHi)}
          </button>
        ))}
      </div>

      {/* AI Recommended */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-warm rounded-xl p-4 text-primary-foreground"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🤖</span>
          <h3 className="font-display font-bold text-sm">{t('AI Recommends', 'AI की सिफारिश')}</h3>
        </div>
        <p className="text-xs opacity-90 mb-2">
          {t('Based on your progress, focus on Multiplication today!', 'आपकी प्रगति के आधार पर, आज गुणा पर ध्यान दें!')}
        </p>
        <Link to="/practice" className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
          {t('Start Now', 'अभी शुरू करें')} <ArrowRight className="w-3 h-3" />
        </Link>
      </motion.div>

      {/* Topics List */}
      <div className="space-y-3">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={topic.locked ? '#' : `/practice?topic=${topic.id}`}
              className={`flex items-center gap-3 bg-card rounded-xl p-4 shadow-card border border-border transition-all active:scale-[0.98] ${topic.locked ? 'opacity-50' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-xl flex-shrink-0">
                {topic.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm truncate">{t(topic.titleEn, topic.titleHi)}</h4>
                  {topic.locked && <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  {topic.progress === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-level flex-shrink-0" />}
                </div>
                {topic.sutra && (
                  <p className="text-[10px] text-secondary font-semibold italic">{topic.sutra}</p>
                )}
                <p className="text-xs text-muted-foreground truncate">{t(topic.descEn, topic.descHi)}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${topic.progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">{topic.progress}%</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <BookOpen className="w-3 h-3" /> {topic.lessons}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LearnPage;

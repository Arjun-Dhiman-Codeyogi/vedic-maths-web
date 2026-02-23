import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Play, Plus, Minus, X as TimesIcon, Divide, BookOpen, Brain, Sparkles } from 'lucide-react';

interface VideoTopic {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: any;
  color: string;
  subtopics: { titleEn: string; titleHi: string; durationEn: string; durationHi: string }[];
}

const videoTopics: VideoTopic[] = [
  {
    id: 'addition',
    titleEn: 'Addition Tricks',
    titleHi: 'जोड़ की तरकीबें',
    descEn: 'Master fast addition with Vedic Math Ekadhikena Sutra',
    descHi: 'वैदिक गणित एकाधिकेन सूत्र से तेज़ जोड़ सीखें',
    icon: Plus,
    color: 'from-primary to-secondary',
    subtopics: [
      { titleEn: 'Adding numbers near 10, 100, 1000', titleHi: '10, 100, 1000 के पास की संख्याएं जोड़ना', durationEn: '5 min', durationHi: '5 मिनट' },
      { titleEn: 'Ekadhikena Purvena - By one more', titleHi: 'एकाधिकेन पूर्वेण - एक और अधिक', durationEn: '7 min', durationHi: '7 मिनट' },
      { titleEn: 'Speed addition of long columns', titleHi: 'लंबी कॉलम की तेज़ जोड़', durationEn: '6 min', durationHi: '6 मिनट' },
    ],
  },
  {
    id: 'subtraction',
    titleEn: 'Subtraction Tricks',
    titleHi: 'घटाव की तरकीबें',
    descEn: 'Learn Nikhilam Sutra for lightning-fast subtraction',
    descHi: 'निखिलम सूत्र से बिजली की तेज़ घटाव सीखें',
    icon: Minus,
    color: 'from-secondary to-accent',
    subtopics: [
      { titleEn: 'Nikhilam - All from 9, last from 10', titleHi: 'निखिलम - सब 9 से, आखिरी 10 से', durationEn: '6 min', durationHi: '6 मिनट' },
      { titleEn: 'Subtraction from base numbers', titleHi: 'आधार संख्याओं से घटाव', durationEn: '5 min', durationHi: '5 मिनट' },
      { titleEn: 'Complement method tricks', titleHi: 'पूरक विधि तरकीबें', durationEn: '7 min', durationHi: '7 मिनट' },
    ],
  },
  {
    id: 'multiplication',
    titleEn: 'Multiplication Tricks',
    titleHi: 'गुणा की तरकीबें',
    descEn: 'Urdhva Tiryagbhyam - Cross multiplication magic',
    descHi: 'ऊर्ध्व तिर्यग्भ्याम - क्रॉस गुणा का जादू',
    icon: TimesIcon,
    color: 'from-accent to-primary',
    subtopics: [
      { titleEn: 'Multiply by 11, 99, 101 instantly', titleHi: '11, 99, 101 से तुरंत गुणा', durationEn: '5 min', durationHi: '5 मिनट' },
      { titleEn: 'Urdhva Tiryagbhyam (Cross multiply)', titleHi: 'ऊर्ध्व तिर्यग्भ्याम (क्रॉस गुणा)', durationEn: '8 min', durationHi: '8 मिनट' },
      { titleEn: 'Squaring numbers near 50, 100', titleHi: '50, 100 के पास की संख्याओं का वर्ग', durationEn: '6 min', durationHi: '6 मिनट' },
      { titleEn: 'Nikhilam for multiplication', titleHi: 'गुणा के लिए निखिलम', durationEn: '7 min', durationHi: '7 मिनट' },
    ],
  },
  {
    id: 'division',
    titleEn: 'Division Tricks',
    titleHi: 'भाग की तरकीबें',
    descEn: 'Paravartya Yojayet - Transpose and apply',
    descHi: 'परावर्त्य योजयेत - स्थानांतरित करें और लागू करें',
    icon: Divide,
    color: 'from-primary to-accent',
    subtopics: [
      { titleEn: 'Division by 9 and its multiples', titleHi: '9 और उसके गुणकों से भाग', durationEn: '5 min', durationHi: '5 मिनट' },
      { titleEn: 'Paravartya Yojayet method', titleHi: 'परावर्त्य योजयेत विधि', durationEn: '8 min', durationHi: '8 मिनट' },
      { titleEn: 'Flag division for large numbers', titleHi: 'बड़ी संख्याओं के लिए ध्वज भाग', durationEn: '9 min', durationHi: '9 मिनट' },
    ],
  },
];

const VideosPage = () => {
  const { t } = useLanguage();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="font-display font-bold text-xl">{t('Vedic Math Videos', 'वैदिक गणित वीडियो')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('Learn powerful Vedic Math techniques through video lessons', 'वीडियो पाठों से शक्तिशाली वैदिक गणित तकनीकें सीखें')}
        </p>
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-sm" />
        <Brain className="w-10 h-10 mb-2 opacity-90" />
        <h3 className="font-display font-bold text-lg">{t('Ancient Wisdom, Modern Speed', 'प्राचीन ज्ञान, आधुनिक गति')}</h3>
        <p className="text-sm opacity-80 mt-1">
          {t('4 categories • 13 video lessons • Vedic Sutras explained', '4 श्रेणियां • 13 वीडियो पाठ • वैदिक सूत्र समझाए गए')}
        </p>
      </motion.div>

      {/* Video Topics */}
      <div className="space-y-3">
        {videoTopics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
          >
            {/* Topic Header */}
            <button
              onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              className="w-full flex items-center gap-3 p-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center shadow-warm flex-shrink-0`}>
                <topic.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-display font-bold text-sm">{t(topic.titleEn, topic.titleHi)}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t(topic.descEn, topic.descHi)}</p>
              </div>
              <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full flex-shrink-0">
                <BookOpen className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground">{topic.subtopics.length}</span>
              </div>
            </button>

            {/* Subtopics */}
            {expandedTopic === topic.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-border"
              >
                {topic.subtopics.map((sub, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t(sub.titleEn, sub.titleHi)}</p>
                      <p className="text-[10px] text-muted-foreground">{t(sub.durationEn, sub.durationHi)}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VideosPage;

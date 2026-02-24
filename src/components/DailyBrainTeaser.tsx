import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';

interface Teaser {
  q: string;
  options: string[];
  answer: number;
  hint: string;
  explanation: string;
  category: string;
}

const DailyBrainTeaser = () => {
  const { t } = useLanguage();
  const { addXP } = useGame();
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);

  const teaser = useMemo(() => {
    const teasers: Teaser[] = [
      {
        category: t('🧠 Reasoning', '🧠 तर्क'),
        q: t('If 111 × 111 = 12321, what is 1111 × 1111?', 'अगर 111 × 111 = 12321, तो 1111 × 1111 = ?'),
        options: ['1234321', '1234421', '1233321', '1244321'],
        answer: 0,
        hint: t('See the palindrome pattern! 1×1=1, 11×11=121, 111×111=12321...', 'पैलिंड्रोम पैटर्न देखो! 1×1=1, 11×11=121, 111×111=12321...'),
        explanation: t('The pattern creates palindromes: 1, 121, 12321, 1234321! Each adds the next digit and mirrors back.', 'पैटर्न पैलिंड्रोम बनाता है: 1, 121, 12321, 1234321! हर बार अगला अंक जुड़ता है और वापस आता है।'),
      },
      {
        category: t('🔢 Percentage', '🔢 प्रतिशत'),
        q: t('What is 25% of 25% of 400?', '400 का 25% का 25% क्या है?'),
        options: ['25', '50', '100', '75'],
        answer: 0,
        hint: t('Step by step: first find 25% of 400, then 25% of that result.', 'एक-एक कदम: पहले 400 का 25% निकालो, फिर उसका 25%।'),
        explanation: t('25% of 400 = 100. Then 25% of 100 = 25. Answer is 25!', '400 का 25% = 100। फिर 100 का 25% = 25। जवाब है 25!'),
      },
      {
        category: t('🧩 Logic', '🧩 तर्कशक्ति'),
        q: t('A number doubled is 50. What is half of that number?', 'एक संख्या को दोगुना करने पर 50 आता है। उस संख्या का आधा क्या है?'),
        options: ['12.5', '25', '50', '10'],
        answer: 0,
        hint: t('Think backwards: if doubled=50, the number is...? Then halve it!', 'उल्टा सोचो: अगर दोगुना=50, तो संख्या...? फिर आधा करो!'),
        explanation: t('Number = 50/2 = 25. Half of 25 = 12.5!', 'संख्या = 50/2 = 25। 25 का आधा = 12.5!'),
      },
      {
        category: t('♟️ Counting', '♟️ गिनती'),
        q: t('How many total squares are on a chess board?', 'शतरंज बोर्ड पर कुल कितने वर्ग हैं?'),
        options: ['64', '204', '128', '256'],
        answer: 1,
        hint: t('Count ALL sizes: 1×1, 2×2, 3×3... up to 8×8!', 'सभी आकार गिनो: 1×1, 2×2, 3×3... 8×8 तक!'),
        explanation: t('8²+7²+6²+...+1² = 64+49+36+25+16+9+4+1 = 204 squares!', '8²+7²+6²+...+1² = 64+49+36+25+16+9+4+1 = 204 वर्ग!'),
      },
      {
        category: t('🔗 Series', '🔗 श्रृंखला'),
        q: t('What comes next: 2, 6, 12, 20, 30, ?', 'अगला क्या आएगा: 2, 6, 12, 20, 30, ?'),
        options: ['40', '42', '36', '44'],
        answer: 1,
        hint: t('Check the differences: 4, 6, 8, 10... what\'s next?', 'अंतर देखो: 4, 6, 8, 10... अगला?'),
        explanation: t('Differences increase by 2: 4,6,8,10,12. So 30+12 = 42! Also n×(n+1): 1×2, 2×3, 3×4...', 'अंतर 2 से बढ़ता है: 4,6,8,10,12। तो 30+12 = 42! ये n×(n+1) भी है।'),
      },
      {
        category: t('⚡ Vedic Speed', '⚡ वैदिक स्पीड'),
        q: t('999 × 7 = ?', '999 × 7 = ?'),
        options: ['6993', '6939', '7993', '6983'],
        answer: 0,
        hint: t('Vedic trick: (1000-1) × 7 = 7000 - 7', 'वैदिक ट्रिक: (1000-1) × 7 = 7000 - 7'),
        explanation: t('(1000-1)×7 = 7000-7 = 6993! Vedic math makes it instant! ⚡', '(1000-1)×7 = 7000-7 = 6993! वैदिक गणित से सेकंड में! ⚡'),
      },
      {
        category: t('🔍 Digit Count', '🔍 अंक गिनती'),
        q: t('From 1 to 100, how many times does digit 9 appear?', '1 से 100 तक अंक 9 कितनी बार आएगा?'),
        options: ['11', '19', '20', '9'],
        answer: 2,
        hint: t('Count units place AND tens place separately!', 'इकाई और दहाई दोनों जगह अलग-अलग गिनो!'),
        explanation: t('Units: 9,19,29,...99 = 10 times. Tens: 90-99 = 10 times. Total = 20!', 'इकाई: 9,19,29,...99 = 10 बार। दहाई: 90-99 = 10 बार। कुल = 20!'),
      },
      {
        category: t('🎯 Algebra', '🎯 बीजगणित'),
        q: t('If x + y = 10 and x - y = 4, what is x × y?', 'अगर x + y = 10 और x - y = 4, तो x × y = ?'),
        options: ['24', '21', '14', '28'],
        answer: 1,
        hint: t('Add both equations to find x, then subtract to find y.', 'दोनों समीकरण जोड़ो x निकालो, फिर घटाओ y निकालो।'),
        explanation: t('x+y=10, x-y=4 → 2x=14 → x=7, y=3. So 7×3 = 21!', 'x+y=10, x-y=4 → 2x=14 → x=7, y=3। तो 7×3 = 21!'),
      },
      {
        category: t('🧮 Square Trick', '🧮 वर्ग ट्रिक'),
        q: t('What is 45² (45 squared)?', '45² (45 का वर्ग) क्या है?'),
        options: ['2025', '2015', '1925', '2125'],
        answer: 0,
        hint: t('Vedic trick for numbers ending in 5: multiply tens digit by (tens+1), then append 25!', '5 पर खत्म होने वाली संख्या का वर्ग: दहाई × (दहाई+1), फिर 25 लगाओ!'),
        explanation: t('4×5 = 20, append 25 → 2025! Works for all numbers ending in 5!', '4×5 = 20, आगे 25 लगाओ → 2025! 5 पर खत्म होने वाली हर संख्या के लिए!'),
      },
      {
        category: t('🌀 Pattern', '🌀 पैटर्न'),
        q: t('What is the missing number: 1, 1, 2, 3, 5, 8, 13, ?', 'लुप्त संख्या क्या है: 1, 1, 2, 3, 5, 8, 13, ?'),
        options: ['18', '20', '21', '16'],
        answer: 2,
        hint: t('Each number is the sum of the two before it! (Fibonacci)', 'हर संख्या पिछली दो संख्याओं का योग है! (फिबोनाची)'),
        explanation: t('Fibonacci: 8+13 = 21! This beautiful pattern appears everywhere in nature 🌻', 'फिबोनाची: 8+13 = 21! ये सुंदर पैटर्न प्रकृति में हर जगह दिखता है 🌻'),
      },
      {
        category: t('🎲 Probability', '🎲 संभावना'),
        q: t('If you flip 2 coins, what\'s the probability of getting at least 1 head?', '2 सिक्के उछालने पर कम से कम 1 चित आने की संभावना?'),
        options: ['1/2', '1/4', '3/4', '2/3'],
        answer: 2,
        hint: t('Think opposite: P(at least 1 head) = 1 - P(no heads)', 'उल्टा सोचो: P(कम से कम 1 चित) = 1 - P(कोई चित नहीं)'),
        explanation: t('Outcomes: HH, HT, TH, TT. Only TT has no heads. So 3/4!', 'परिणाम: HH, HT, TH, TT। सिर्फ TT में चित नहीं। तो 3/4!'),
      },
      {
        category: t('⏰ Time Puzzle', '⏰ समय पहेली'),
        q: t('A clock shows 3:15. What is the angle between hour and minute hand?', 'घड़ी 3:15 दिखाती है। घंटे और मिनट की सुई के बीच कोण?'),
        options: ['0°', '7.5°', '15°', '90°'],
        answer: 1,
        hint: t('At 3:15, the hour hand has moved slightly past the 3!', '3:15 पर घंटे की सुई 3 से थोड़ा आगे बढ़ चुकी है!'),
        explanation: t('Minute hand at 90°, hour hand at 90° + 7.5° = 97.5°. Angle = 7.5°!', 'मिनट सुई 90° पर, घंटा सुई 90° + 7.5° = 97.5° पर। कोण = 7.5°!'),
      },
      {
        category: t('🔢 Number Trick', '🔢 संख्या ट्रिक'),
        q: t('What is 37 × 3?', '37 × 3 = ?'),
        options: ['111', '101', '121', '131'],
        answer: 0,
        hint: t('37 × 3 gives a very special repdigit number!', '37 × 3 एक बहुत खास संख्या देता है!'),
        explanation: t('37×3=111! Also 37×6=222, 37×9=333... Magic of 37! ✨', '37×3=111! 37×6=222, 37×9=333 भी... 37 का जादू! ✨'),
      },
      {
        category: t('🧩 Age Puzzle', '🧩 उम्र पहेली'),
        q: t('A father is 3 times his son\'s age. In 12 years, he\'ll be twice. Son\'s current age?', 'पिता बेटे से 3 गुना बड़े। 12 साल बाद 2 गुना होंगे। बेटे की उम्र?'),
        options: ['10', '12', '8', '15'],
        answer: 1,
        hint: t('Let son = x. Father = 3x. After 12: 3x+12 = 2(x+12)', 'बेटा = x। पिता = 3x। 12 बाद: 3x+12 = 2(x+12)'),
        explanation: t('3x+12 = 2x+24 → x = 12. Son is 12, father is 36!', '3x+12 = 2x+24 → x = 12। बेटा 12, पिता 36!'),
      },
    ];
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return teasers[dayOfYear % teasers.length];
  }, [t]);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === teaser.answer) {
      addXP(15);
    }
  };

  const isCorrect = selected === teaser.answer;

  const handleRetry = () => {
    setSelected(null);
    setAnswered(false);
    setShowHint(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-card rounded-xl p-4 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm">{t('🧩 Daily Brain Teaser', '🧩 आज की पहेली')}</h3>
            <span className="text-[10px] text-muted-foreground font-medium">{teaser.category}</span>
          </div>
        </div>
        {answered && (
          <button onClick={handleRetry} className="text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-sm font-semibold text-foreground mb-3">{teaser.q}</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {teaser.options.map((option, i) => {
          let optionClass = 'border border-border bg-muted/50 hover:bg-muted text-foreground';
          if (answered) {
            if (i === teaser.answer) {
              optionClass = 'border-2 border-green-500 bg-green-500/10 text-green-700 dark:text-green-400';
            } else if (i === selected && !isCorrect) {
              optionClass = 'border-2 border-red-500 bg-red-500/10 text-red-700 dark:text-red-400';
            } else {
              optionClass = 'border border-border bg-muted/30 text-muted-foreground opacity-60';
            }
          }

          return (
            <motion.button
              key={i}
              whileTap={!answered ? { scale: 0.95 } : {}}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`p-3 rounded-lg text-sm font-bold transition-all ${optionClass}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-lg p-3 mb-2 ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">
                    {t('Correct! +15 XP 🎉', 'सही! +15 XP 🎉')}
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-bold text-red-700 dark:text-red-400">
                    {t('Not quite! Try again tomorrow 💪', 'गलत! कल फिर कोशिश करो 💪')}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{teaser.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!answered && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Lightbulb className="w-3 h-3" />
          {showHint ? t('Hide Hint', 'संकेत छुपाओ') : t('Show Hint', 'संकेत दिखाओ')}
        </button>
      )}

      <AnimatePresence>
        {showHint && !answered && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-muted-foreground italic mt-2 p-2 bg-muted/50 rounded-lg"
          >
            💡 {teaser.hint}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyBrainTeaser;

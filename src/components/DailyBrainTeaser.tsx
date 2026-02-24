import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
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

const useTeasers = () => {
  const { t } = useLanguage();
  return [
    { category: t('🧠 Reasoning', '🧠 तर्क'), q: t('If 111 × 111 = 12321, what is 1111 × 1111?', 'अगर 111 × 111 = 12321, तो 1111 × 1111 = ?'), options: ['1234321', '1234421', '1233321', '1244321'], answer: 0, hint: t('See the palindrome pattern!', 'पैलिंड्रोम पैटर्न देखो!'), explanation: t('Pattern: 1, 121, 12321, 1234321!', 'पैटर्न: 1, 121, 12321, 1234321!') },
    { category: t('🔢 Percentage', '🔢 प्रतिशत'), q: t('What is 25% of 25% of 400?', '400 का 25% का 25% क्या है?'), options: ['25', '50', '100', '75'], answer: 0, hint: t('Step by step: 25% of 400 first.', 'पहले 400 का 25% निकालो।'), explanation: t('25% of 400=100, 25% of 100=25!', '400 का 25%=100, 100 का 25%=25!') },
    { category: t('🧩 Logic', '🧩 तर्कशक्ति'), q: t('A number doubled is 50. What is half of that number?', 'दोगुना करने पर 50। उस संख्या का आधा?'), options: ['12.5', '25', '50', '10'], answer: 0, hint: t('Think backwards!', 'उल्टा सोचो!'), explanation: t('Number=25, half=12.5!', 'संख्या=25, आधा=12.5!') },
    { category: t('♟️ Counting', '♟️ गिनती'), q: t('How many total squares on a chess board?', 'शतरंज बोर्ड पर कुल कितने वर्ग?'), options: ['64', '204', '128', '256'], answer: 1, hint: t('Count ALL sizes: 1×1 to 8×8!', 'सभी आकार: 1×1 से 8×8!'), explanation: t('8²+7²+...+1² = 204!', '8²+7²+...+1² = 204!') },
    { category: t('🔗 Series', '🔗 श्रृंखला'), q: t('Next: 2, 6, 12, 20, 30, ?', 'अगला: 2, 6, 12, 20, 30, ?'), options: ['40', '42', '36', '44'], answer: 1, hint: t('Differences: 4,6,8,10...', 'अंतर: 4,6,8,10...'), explanation: t('30+12=42! n×(n+1) pattern.', '30+12=42! n×(n+1) पैटर्न।') },
    { category: t('⚡ Vedic Speed', '⚡ वैदिक स्पीड'), q: t('999 × 7 = ?', '999 × 7 = ?'), options: ['6993', '6939', '7993', '6983'], answer: 0, hint: t('(1000-1) × 7', '(1000-1) × 7'), explanation: t('7000-7 = 6993! ⚡', '7000-7 = 6993! ⚡') },
    { category: t('🔍 Digit Count', '🔍 अंक गिनती'), q: t('1 to 100: how many times does 9 appear?', '1-100 में 9 कितनी बार?'), options: ['11', '19', '20', '9'], answer: 2, hint: t('Units + tens separately!', 'इकाई + दहाई अलग गिनो!'), explanation: t('Units:10 + Tens:10 = 20!', 'इकाई:10 + दहाई:10 = 20!') },
    { category: t('🎯 Algebra', '🎯 बीजगणित'), q: t('x+y=10, x-y=4. x×y=?', 'x+y=10, x-y=4। x×y=?'), options: ['24', '21', '14', '28'], answer: 1, hint: t('Add equations to find x.', 'समीकरण जोड़ो।'), explanation: t('x=7, y=3. 7×3=21!', 'x=7, y=3। 7×3=21!') },
    { category: t('🧮 Square Trick', '🧮 वर्ग ट्रिक'), q: t('45² = ?', '45² = ?'), options: ['2025', '2015', '1925', '2125'], answer: 0, hint: t('Vedic: tens×(tens+1), append 25!', 'दहाई×(दहाई+1), फिर 25 लगाओ!'), explanation: t('4×5=20, append 25→2025!', '4×5=20, 25 लगाओ→2025!') },
    { category: t('🌀 Pattern', '🌀 पैटर्न'), q: t('1, 1, 2, 3, 5, 8, 13, ?', '1, 1, 2, 3, 5, 8, 13, ?'), options: ['18', '20', '21', '16'], answer: 2, hint: t('Sum of previous two! (Fibonacci)', 'पिछले दो का योग! (फिबोनाची)'), explanation: t('8+13=21! Fibonacci 🌻', '8+13=21! फिबोनाची 🌻') },
    { category: t('🎲 Probability', '🎲 संभावना'), q: t('Flip 2 coins: P(at least 1 head)?', '2 सिक्के: कम से कम 1 चित?'), options: ['1/2', '1/4', '3/4', '2/3'], answer: 2, hint: t('1 - P(no heads)', '1 - P(कोई चित नहीं)'), explanation: t('HH,HT,TH,TT → 3/4!', 'HH,HT,TH,TT → 3/4!') },
    { category: t('⏰ Time Puzzle', '⏰ समय पहेली'), q: t('Clock 3:15: angle between hands?', 'घड़ी 3:15: सुइयों का कोण?'), options: ['0°', '7.5°', '15°', '90°'], answer: 1, hint: t('Hour hand moved past 3!', 'घंटा सुई 3 से आगे!'), explanation: t('97.5° - 90° = 7.5°!', '97.5° - 90° = 7.5°!') },
    { category: t('🔢 Number Trick', '🔢 संख्या ट्रिक'), q: t('37 × 3 = ?', '37 × 3 = ?'), options: ['111', '101', '121', '131'], answer: 0, hint: t('A special repdigit!', 'एक खास संख्या!'), explanation: t('37×3=111! 37×6=222, 37×9=333 ✨', '37×3=111! 37×6=222, 37×9=333 ✨') },
    { category: t('🧩 Age Puzzle', '🧩 उम्र पहेली'), q: t('Father 3× son. In 12 yrs 2×. Son\'s age?', 'पिता 3 गुना। 12 बाद 2 गुना। बेटे की उम्र?'), options: ['10', '12', '8', '15'], answer: 1, hint: t('3x+12 = 2(x+12)', '3x+12 = 2(x+12)'), explanation: t('x=12. Son 12, Father 36!', 'x=12। बेटा 12, पिता 36!') },
    { category: t('🔢 LCM/HCF', '🔢 ल.स./म.स.'), q: t('LCM of 12 and 18?', '12 और 18 का ल.स.?'), options: ['36', '72', '24', '54'], answer: 0, hint: t('LCM = product / HCF', 'ल.स. = गुणनफल / म.स.'), explanation: t('HCF=6. 12×18/6=36!', 'म.स.=6। 12×18/6=36!') },
    { category: t('🧮 Cube Root', '🧮 घनमूल'), q: t('∛3375 = ?', '∛3375 = ?'), options: ['15', '25', '13', '17'], answer: 0, hint: t('15³ = 15×15×15', '15³ = 15×15×15'), explanation: t('15×15=225, 225×15=3375!', '15×15=225, 225×15=3375!') },
    { category: t('⚡ Speed Math', '⚡ स्पीड गणित'), q: t('48 × 52 = ?', '48 × 52 = ?'), options: ['2496', '2504', '2516', '2484'], answer: 0, hint: t('(50-2)×(50+2) = 50²-2²', '(50-2)×(50+2) = 50²-2²'), explanation: t('2500-4 = 2496! Difference of squares!', '2500-4 = 2496! वर्गों का अंतर!') },
    { category: t('🎯 Ratio', '🎯 अनुपात'), q: t('If a:b = 2:3 and b:c = 4:5, a:c = ?', 'a:b=2:3, b:c=4:5, a:c=?'), options: ['8:15', '2:5', '6:20', '4:15'], answer: 0, hint: t('Make b common: 12', 'b को समान करो: 12'), explanation: t('a:b=8:12, b:c=12:15 → a:c=8:15!', 'a:b=8:12, b:c=12:15 → a:c=8:15!') },
    { category: t('🌀 Magic Number', '🌀 जादुई संख्या'), q: t('142857 × 2 = ?', '142857 × 2 = ?'), options: ['285714', '284571', '285741', '284517'], answer: 0, hint: t('Same digits, different order!', 'वही अंक, अलग क्रम!'), explanation: t('142857 is cyclic! ×1 to ×6 all rearrange! 🤯', '142857 चक्रीय है! ×1 से ×6 सब बदलते हैं! 🤯') },
    { category: t('🧩 Profit/Loss', '🧩 लाभ/हानि'), q: t('Buy at ₹80, sell at ₹100. Profit %?', '₹80 में खरीदा, ₹100 में बेचा। लाभ%?'), options: ['20%', '25%', '80%', '30%'], answer: 1, hint: t('Profit% = (Profit/CP)×100', 'लाभ% = (लाभ/क्रय मूल्य)×100'), explanation: t('Profit=20, (20/80)×100 = 25%!', 'लाभ=20, (20/80)×100 = 25%!') },
  ] as Teaser[];
};

const DailyBrainTeaser = () => {
  const { t } = useLanguage();
  const { addXP } = useGame();
  const teasers = useTeasers();
  const usedIndices = useRef<Set<number>>(new Set());
  const [questionIndex, setQuestionIndex] = useState(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const idx = dayOfYear % teasers.length;
    usedIndices.current.add(idx);
    return idx;
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  const teaser = teasers[questionIndex];

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setSolvedCount(c => c + 1);
    if (index === teaser.answer) {
      addXP(15);
    }
  };

  const isCorrect = selected === teaser.answer;

  const nextQuestion = useCallback(() => {
    // Pick a random unused index
    const available = teasers.map((_, i) => i).filter(i => !usedIndices.current.has(i));
    if (available.length === 0) {
      usedIndices.current.clear();
      usedIndices.current.add(questionIndex);
      const all = teasers.map((_, i) => i).filter(i => i !== questionIndex);
      const next = all[Math.floor(Math.random() * all.length)];
      usedIndices.current.add(next);
      setQuestionIndex(next);
    } else {
      const next = available[Math.floor(Math.random() * available.length)];
      usedIndices.current.add(next);
      setQuestionIndex(next);
    }
    setSelected(null);
    setAnswered(false);
    setShowHint(false);
  }, [questionIndex, teasers]);

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
            <h3 className="font-display font-bold text-sm">{t('🧩 Brain Teaser', '🧩 पहेली')}</h3>
            <span className="text-[10px] text-muted-foreground font-medium">{teaser.category}</span>
          </div>
        </div>
        {solvedCount > 0 && (
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {solvedCount} {t('solved', 'हल')} ✅
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
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

          {answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
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
                      {t('Oops! See the solution 👇', 'गलत! हल देखो 👇')}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{teaser.explanation}</p>
            </motion.div>
          )}

          {answered && (
            <motion.button
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={nextQuestion}
              className="w-full mt-2 flex items-center justify-center gap-2 p-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-bold shadow-warm active:scale-95 transition-transform"
            >
              {t('Next Question', 'अगला सवाल')} <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}

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
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyBrainTeaser;

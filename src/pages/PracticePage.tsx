import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { Check, Timer, Zap, Brain, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';

type Difficulty = 'easy' | 'medium' | 'hard';
type PracticeCategory = 'vedic' | 'finger' | 'brain';

type VedicOp = '+' | '-' | '×' | '÷' | 'x²' | '√' | 'x³' | '∛' | '%' | 'alg';
type FingerOp = 'f-count' | 'f-add' | 'f-sub' | 'f-mul' | 'f-9table';
type BrainOp = 'b-visual' | 'b-speed' | 'b-pattern' | 'b-mental' | 'b-focus';
type Operation = VedicOp | FingerOp | BrainOp;

const categoryOps: Record<PracticeCategory, { ops: Operation[]; labels: Record<string, { en: string; hi: string }> }> = {
  vedic: {
    ops: ['+', '-', '×', '÷', 'x²', '√', 'x³', '∛', '%', 'alg'],
    labels: {
      '+': { en: 'Add', hi: 'जोड़' },
      '-': { en: 'Sub', hi: 'घटाव' },
      '×': { en: 'Mul', hi: 'गुणा' },
      '÷': { en: 'Div', hi: 'भाग' },
      'x²': { en: 'Square', hi: 'वर्ग' },
      '√': { en: 'Root', hi: 'मूल' },
      'x³': { en: 'Cube', hi: 'घन' },
      '∛': { en: 'CubeRt', hi: 'घनमूल' },
      '%': { en: 'Percent', hi: 'प्रतिशत' },
      'alg': { en: 'Algebra', hi: 'बीजगणित' },
    },
  },
  finger: {
    ops: ['f-count', 'f-add', 'f-sub', 'f-mul', 'f-9table'],
    labels: {
      'f-count': { en: 'Count', hi: 'गिनती' },
      'f-add': { en: 'Add', hi: 'जोड़' },
      'f-sub': { en: 'Sub', hi: 'घटाव' },
      'f-mul': { en: 'Mul', hi: 'गुणा' },
      'f-9table': { en: '9 Table', hi: '9 पहाड़ा' },
    },
  },
  brain: {
    ops: ['b-visual', 'b-speed', 'b-pattern', 'b-mental', 'b-focus'],
    labels: {
      'b-visual': { en: 'Visual', hi: 'दृश्य' },
      'b-speed': { en: 'Speed', hi: 'गति' },
      'b-pattern': { en: 'Pattern', hi: 'पैटर्न' },
      'b-mental': { en: 'Mental', hi: 'मानसिक' },
      'b-focus': { en: 'Focus', hi: 'ध्यान' },
    },
  },
};

const categoryLabels: Record<PracticeCategory, { en: string; hi: string }> = {
  vedic: { en: 'Vedic Math', hi: 'वैदिक गणित' },
  finger: { en: 'Finger Math', hi: 'उंगली गणित' },
  brain: { en: 'Brain Dev', hi: 'मस्तिष्क विकास' },
};

interface Problem {
  display: string;
  answer: number;
  hint: { en: string; hi: string };
  solution?: { en: string; hi: string };
}

const generateFingerProblem = (difficulty: Difficulty, op: FingerOp): Problem => {
  switch (op) {
    case 'f-count': {
      // "How many fingers show this number?" — show a number, answer is the number
      const n = difficulty === 'easy' ? Math.floor(Math.random() * 10) + 1 : difficulty === 'medium' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 99) + 1;
      return { display: `🖐️ Show ${n} on fingers. How many fingers up?`, answer: n, hint: { en: 'Right hand = 1-5, Left hand = 6-10. Use tens for bigger numbers!', hi: 'दायां हाथ = 1-5, बायां हाथ = 6-10। बड़ी संख्या के लिए दहाई प्रयोग करें!' } };
    }
    case 'f-add': {
      const max = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
      const a = Math.floor(Math.random() * max) + 1;
      const b = Math.floor(Math.random() * max) + 1;
      return { display: `🖐️ ${a} + ${b}`, answer: a + b, hint: { en: 'Start with bigger number on fingers, count up the smaller one', hi: 'बड़ी संख्या उंगलियों पर रखें, छोटी गिनें' } };
    }
    case 'f-sub': {
      const max = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
      const a = Math.floor(Math.random() * max) + 5;
      const b = Math.floor(Math.random() * Math.min(a, max)) + 1;
      return { display: `🖐️ ${a} - ${b}`, answer: a - b, hint: { en: 'Show the bigger number, fold down fingers for the smaller', hi: 'बड़ी संख्या दिखाएं, छोटी के लिए उंगलियां मोड़ें' } };
    }
    case 'f-mul': {
      // Finger multiplication for 6-10: hold up (n-5) fingers
      const a = Math.floor(Math.random() * 5) + 6; // 6-10
      const b = Math.floor(Math.random() * 5) + 6; // 6-10
      if (difficulty === 'easy') {
        const x = Math.floor(Math.random() * 5) + 6;
        return { display: `🖐️ ${x} × 2`, answer: x * 2, hint: { en: 'Double the number: show it twice on fingers', hi: 'संख्या को दुगुना करें: उंगलियों पर दो बार दिखाएं' } };
      }
      return { display: `🖐️ ${a} × ${b}`, answer: a * b, hint: { en: `Hold up ${a - 5} fingers on left, ${b - 5} on right. Touching = tens, remaining multiply = ones`, hi: `बाएं ${a - 5} उंगली, दाएं ${b - 5} उठाएं। छूने वाली = दहाई, बाकी गुणा = इकाई` } };
    }
    case 'f-9table': {
      const n = Math.floor(Math.random() * 10) + 1; // 1-10
      return { display: `🖐️ 9 × ${n}`, answer: 9 * n, hint: { en: `Fold finger #${n}. Left of fold = tens, right = ones. Answer: ${n - 1}${10 - n}`, hi: `उंगली #${n} मोड़ें। बाईं ओर = दहाई, दाईं = इकाई` } };
    }
    default:
      return { display: '1 + 1', answer: 2, hint: { en: '', hi: '' } };
  }
};

const generateBrainProblem = (difficulty: Difficulty, op: BrainOp): Problem => {
  switch (op) {
    case 'b-visual': {
      // Flash number — remember and type it
      const digits = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
      const n = Math.floor(Math.random() * (10 ** digits - 10 ** (digits - 1))) + 10 ** (digits - 1);
      return { display: `👁️ Remember: ${n}\nWhat was the number?`, answer: n, hint: { en: 'Visualize the number as an image in your mind', hi: 'संख्या को मन में एक चित्र के रूप में देखें' } };
    }
    case 'b-speed': {
      // Quick arithmetic chain
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 10) + 1;
      const c = Math.floor(Math.random() * 5) + 1;
      if (difficulty === 'easy') {
        return { display: `⚡ ${a} + ${b} - ${c}`, answer: a + b - c, hint: { en: 'Process left to right quickly!', hi: 'बाएं से दाएं तेजी से हल करें!' } };
      }
      const d = Math.floor(Math.random() * 3) + 2;
      return { display: `⚡ ${a} + ${b} - ${c} × ${d}`, answer: a + b - c * d, hint: { en: 'BODMAS: Multiply first, then add/subtract', hi: 'BODMAS: पहले गुणा, फिर जोड़/घटाव' } };
    }
    case 'b-pattern': {
      // Find the next number in sequence
      const start = Math.floor(Math.random() * 5) + 1;
      const step = difficulty === 'easy' ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 7) + 3;
      const isMultiply = difficulty !== 'easy' && Math.random() > 0.5;
      if (isMultiply) {
        const base = Math.floor(Math.random() * 3) + 2;
        const seq = [base, base * 2, base * 4];
        return { display: `🧩 ${seq[0]}, ${seq[1]}, ${seq[2]}, ?`, answer: base * 8, hint: { en: 'Each number doubles! Multiply by 2', hi: 'हर संख्या दुगुनी! 2 से गुणा करें' } };
      }
      const seq = [start, start + step, start + step * 2, start + step * 3];
      return { display: `🧩 ${seq[0]}, ${seq[1]}, ${seq[2]}, ${seq[3]}, ?`, answer: start + step * 4, hint: { en: `Pattern: adding ${step} each time`, hi: `पैटर्न: हर बार ${step} जोड़ रहे हैं` } };
    }
    case 'b-mental': {
      // Multi-step mental math
      const a = Math.floor(Math.random() * 30) + 10;
      const b = Math.floor(Math.random() * 20) + 5;
      if (difficulty === 'easy') {
        return { display: `🧠 (${a} + ${b}) × 2`, answer: (a + b) * 2, hint: { en: 'First add, then double the result', hi: 'पहले जोड़ें, फिर परिणाम दुगुना करें' } };
      }
      const c = Math.floor(Math.random() * 5) + 2;
      return { display: `🧠 (${a} + ${b}) × ${c}`, answer: (a + b) * c, hint: { en: 'Solve brackets first, then multiply', hi: 'पहले कोष्ठक हल करें, फिर गुणा' } };
    }
    case 'b-focus': {
      // Reverse number
      const digits = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
      const n = Math.floor(Math.random() * (10 ** digits - 10 ** (digits - 1))) + 10 ** (digits - 1);
      const reversed = parseInt(String(n).split('').reverse().join(''));
      return { display: `🎯 Reverse: ${n}`, answer: reversed, hint: { en: 'Read the digits backwards', hi: 'अंकों को उल्टा पढ़ें' } };
    }
    default:
      return { display: '1 + 1', answer: 2, hint: { en: '', hi: '' } };
  }
};

const generateVedicProblem = (difficulty: Difficulty, operation: VedicOp): Problem => {
  const range = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;

  switch (operation) {
    case '+': {
      // 50% chance of 3-number addition for medium/hard, always for easy if rand
      const useThree = Math.random() > 0.5;
      const a = Math.floor(Math.random() * range) + 1;
      const b = Math.floor(Math.random() * range) + 1;
      if (useThree) {
        const c = Math.floor(Math.random() * range) + 1;
        const step1 = a + b;
        const ans = step1 + c;
        return {
          display: `${a} + ${b} + ${c}`,
          answer: ans,
          hint: { en: 'Add left to right: first add two numbers, then add the third', hi: 'बाएं से दाएं जोड़ें: पहले दो को जोड़ें, फिर तीसरा' },
          solution: { en: `Step 1: ${a} + ${b} = ${step1}  →  Step 2: ${step1} + ${c} = ${ans}`, hi: `चरण 1: ${a} + ${b} = ${step1}  →  चरण 2: ${step1} + ${c} = ${ans}` },
        };
      }
      const ans2 = a + b;
      return {
        display: `${a} + ${b}`,
        answer: ans2,
        hint: { en: 'Use Ekadhikena: Add 1 to the previous', hi: 'एकाधिकेन: पिछले में 1 जोड़ें' },
        solution: { en: `${a} + ${b} = ${ans2}`, hi: `${a} + ${b} = ${ans2}` },
      };
    }
    case '-': {
      const useThree = Math.random() > 0.5;
      const a = Math.floor(Math.random() * range) + 10;
      const b = Math.floor(Math.random() * Math.min(a - 1, range)) + 1;
      if (useThree) {
        const maxC = a - b - 1;
        if (maxC > 1) {
          const c = Math.floor(Math.random() * Math.min(maxC, range)) + 1;
          const step1 = a - b;
          const ans = step1 - c;
          return {
            display: `${a} - ${b} - ${c}`,
            answer: ans,
            hint: { en: 'Subtract left to right: subtract first number, then the second', hi: 'बाएं से दाएं घटाएं: पहले घटाएं, फिर दूसरा' },
            solution: { en: `Step 1: ${a} - ${b} = ${step1}  →  Step 2: ${step1} - ${c} = ${ans}`, hi: `चरण 1: ${a} - ${b} = ${step1}  →  चरण 2: ${step1} - ${c} = ${ans}` },
          };
        }
      }
      const ans2 = a - b;
      return {
        display: `${a} - ${b}`,
        answer: ans2,
        hint: { en: 'Use Nikhilam: All from 9, last from 10', hi: 'निखिलम: सब 9 से, आखिरी 10 से' },
        solution: { en: `${a} - ${b} = ${ans2}`, hi: `${a} - ${b} = ${ans2}` },
      };
    }
    case '×': {
      const a = Math.floor(Math.random() * (difficulty === 'easy' ? 12 : 30)) + 2;
      const b = Math.floor(Math.random() * (difficulty === 'easy' ? 12 : 15)) + 2;
      return { display: `${a} × ${b}`, answer: a * b, hint: { en: 'Use Urdhva Tiryagbhyam: Cross multiply', hi: 'ऊर्ध्व तिर्यग्भ्याम: क्रॉस गुणा' } };
    }
    case '÷': {
      const b = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 20)) + 2;
      const ans = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 20)) + 1;
      return { display: `${b * ans} ÷ ${b}`, answer: ans, hint: { en: 'Use Paravartya: Transpose and adjust', hi: 'परावर्त्य: स्थानांतरित करें' } };
    }
    case 'x²': {
      const n = Math.floor(Math.random() * (difficulty === 'easy' ? 15 : difficulty === 'medium' ? 30 : 50)) + 2;
      return { display: `${n}²`, answer: n * n, hint: { en: 'Yavadunam: Square = base ± deviation²', hi: 'यावदूनम: वर्ग = आधार ± विचलन²' } };
    }
    case '√': {
      const roots = difficulty === 'easy' ? [2,3,4,5,6,7,8,9,10] : difficulty === 'medium' ? [4,5,6,7,8,9,10,11,12,15,16,20,25] : [9,10,11,12,13,14,15,16,20,25,30];
      const n = roots[Math.floor(Math.random() * roots.length)];
      return { display: `√${n * n}`, answer: n, hint: { en: 'Find nearest perfect square', hi: 'निकटतम पूर्ण वर्ग खोजें' } };
    }
    case 'x³': {
      const n = Math.floor(Math.random() * (difficulty === 'easy' ? 8 : 12)) + 2;
      return { display: `${n}³`, answer: n * n * n, hint: { en: 'Cube = n × n × n. Use Anurupyena for patterns', hi: 'घन = n × n × n. अनुरूप्येण प्रयोग करें' } };
    }
    case '∛': {
      const roots = difficulty === 'easy' ? [2,3,4,5] : difficulty === 'medium' ? [2,3,4,5,6,7,8] : [3,4,5,6,7,8,9,10];
      const n = roots[Math.floor(Math.random() * roots.length)];
      return { display: `∛${n * n * n}`, answer: n, hint: { en: 'Last digit of cube root depends on last digit of number', hi: 'घनमूल का अंतिम अंक संख्या के अंतिम अंक पर निर्भर' } };
    }
    case '%': {
      const percents = [10, 15, 20, 25, 30, 50, 75];
      const p = percents[Math.floor(Math.random() * percents.length)];
      const base = (difficulty === 'easy' ? [50, 100, 200] : difficulty === 'medium' ? [120, 250, 400, 500] : [360, 480, 750, 840])[Math.floor(Math.random() * 3)];
      return { display: `${p}% of ${base}`, answer: (p * base) / 100, hint: { en: '10% = move decimal. 50% = half. Build from these!', hi: '10% = दशमलव हटाएं। 50% = आधा। इनसे बनाएं!' } };
    }
    case 'alg': {
      const a = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 20)) + 1;
      const b = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 20)) + 1;
      const answer = a + b;
      return { display: `x + ${b} = ${answer}`, answer: a, hint: { en: 'Transpose: x = answer - b. Use Paravartya!', hi: 'स्थानांतरित करें: x = उत्तर - b। परावर्त्य प्रयोग करें!' } };
    }
    default:
      return { display: '1 + 1', answer: 2, hint: { en: '', hi: '' } };
  }
};

const generateProblem = (difficulty: Difficulty, operation: Operation): Problem => {
  if (operation.startsWith('f-')) return generateFingerProblem(difficulty, operation as FingerOp);
  if (operation.startsWith('b-')) return generateBrainProblem(difficulty, operation as BrainOp);
  return generateVedicProblem(difficulty, operation as VedicOp);
};

const topicToCategory = (topic: string | null): PracticeCategory => {
  if (!topic) return 'vedic';
  if (topic.startsWith('f-')) return 'finger';
  if (topic.startsWith('b-')) return 'brain';
  return 'vedic';
};

const topicToOp = (topic: string | null, category: PracticeCategory): Operation => {
  if (!topic) return categoryOps[category].ops[0];
  // Map vedic topic ids to operations
  const vedicMap: Record<string, VedicOp> = { add: '+', sub: '-', mul: '×', div: '÷', sq: 'x²', sqrt: '√', dec: '+', pct: '%', alg: 'alg' };
  if (category === 'vedic' && vedicMap[topic]) return vedicMap[topic];
  // For finger/brain, the topic id matches the op
  if (categoryOps[category].ops.includes(topic as Operation)) return topic as Operation;
  return categoryOps[category].ops[0];
};

const PracticePage = () => {
  const { t } = useLanguage();
  const { addXP, updateAccuracy, student } = useGame();
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get('topic');

  // Auto-set difficulty based on class grade
  const getDefaultDifficulty = (): Difficulty => {
    if (student.classGrade <= 3) return 'easy';
    if (student.classGrade <= 6) return 'medium';
    return 'hard';
  };

  const initialCategory = topicToCategory(topicParam);
  const [category, setCategory] = useState<PracticeCategory>(initialCategory);
  const [difficulty, setDifficulty] = useState<Difficulty>(getDefaultDifficulty());
  const [operation, setOperation] = useState<Operation>(topicToOp(topicParam, initialCategory));
  const [problem, setProblem] = useState<Problem>(generateProblem(getDefaultDifficulty(), topicToOp(topicParam, initialCategory)));
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showVedicHint, setShowVedicHint] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0 || timerPaused) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, timerPaused]);

  useEffect(() => {
    if (timeLeft <= 0 && isPlaying) {
      setIsPlaying(false);
      addXP(score);
    }
  }, [timeLeft, addXP, isPlaying, score]);

  const handleCategoryChange = (cat: PracticeCategory) => {
    setCategory(cat);
    const firstOp = categoryOps[cat].ops[0];
    setOperation(firstOp);
    setProblem(generateProblem(difficulty, firstOp));
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setTotalAnswered(0);
    setCorrectCount(0);
    setProblem(generateProblem(difficulty, operation));
    setUserAnswer('');
    setResult(null);
    setTimerPaused(false);
    setShowSolution(false);
  };

  const checkAnswer = useCallback(() => {
    if (!userAnswer) return;
    const isCorrect = parseInt(userAnswer) === problem.answer;
    setResult(isCorrect ? 'correct' : 'wrong');
    setTotalAnswered(p => p + 1);
    updateAccuracy(isCorrect);

    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 35;
      setScore(s => s + points + streak * 2);
      setStreak(s => s + 1);
      setCorrectCount(c => c + 1);
      setTimeout(() => {
        setResult(null);
        setUserAnswer('');
        setProblem(generateProblem(difficulty, operation));
        setShowVedicHint(false);
        setShowSolution(false);
      }, 800);
    } else {
      setStreak(0);
      setTimerPaused(true);
      setShowSolution(true);
      setTimeout(() => {
        setResult(null);
        setUserAnswer('');
        setProblem(generateProblem(difficulty, operation));
        setShowVedicHint(false);
        setShowSolution(false);
        setTimerPaused(false);
      }, 3500);
    }
  }, [userAnswer, problem, difficulty, operation, streak, updateAccuracy]);

  const handleKeyPad = (key: string) => {
    if (key === 'del') setUserAnswer(prev => prev.slice(0, -1));
    else if (key === 'go') checkAnswer();
    else setUserAnswer(prev => prev + key);
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
  const categories: PracticeCategory[] = ['vedic', 'finger', 'brain'];

  if (!isPlaying) {
    return (
      <div className="px-4 py-4 md:py-8 space-y-5 max-w-7xl mx-auto">
        <div>
          <h2 className="font-display font-bold text-xl">{t('Practice Mode', 'अभ्यास मोड')}</h2>
          <p className="text-sm text-muted-foreground">{t('Train your mental math skills', 'अपने गणित कौशल को प्रशिक्षित करें')}</p>
        </div>

        {totalAnswered > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="gradient-hero rounded-2xl p-6 text-primary-foreground text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h3 className="font-display font-bold text-2xl">{t('Great Job!', 'शानदार!')}</h3>
            <p className="text-3xl font-bold mt-2">{score} XP</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div><p className="opacity-70">{t('Correct', 'सही')}</p><p className="font-bold text-lg">{correctCount}/{totalAnswered}</p></div>
              <div><p className="opacity-70">{t('Accuracy', 'सटीकता')}</p><p className="font-bold text-lg">{totalAnswered ? Math.round(correctCount / totalAnswered * 100) : 0}%</p></div>
            </div>
          </motion.div>
        )}

        {/* Category Tabs */}
        <div>
          <h3 className="font-display font-bold text-sm mb-2">{t('Category', 'श्रेणी')}</h3>
          <div className="flex gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${category === cat ? 'gradient-primary text-primary-foreground shadow-warm' : 'bg-card border border-border text-foreground'}`}
              >
                {t(categoryLabels[cat].en, categoryLabels[cat].hi)}
              </button>
            ))}
          </div>
        </div>

        {/* Operation Select */}
        <div>
          <h3 className="font-display font-bold text-sm mb-2">{t('Operation', 'संक्रिया')}</h3>
          <div className="grid grid-cols-5 gap-2">
            {categoryOps[category].ops.map(op => (
              <button key={op} onClick={() => { setOperation(op); setProblem(generateProblem(difficulty, op)); }}
                className={`py-2.5 rounded-xl font-display font-bold text-xs transition-all ${operation === op ? 'gradient-primary text-primary-foreground shadow-warm' : 'bg-card border border-border text-foreground'}`}
              >
                <div className="text-[10px] font-semibold opacity-90">{t(categoryOps[category].labels[op].en, categoryOps[category].labels[op].hi)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Select */}
        <div>
          <h3 className="font-display font-bold text-sm mb-2">{t('Difficulty', 'कठिनाई')}</h3>
          <div className="flex gap-2">
            {difficulties.map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${difficulty === d ? 'gradient-warm text-primary-foreground shadow-warm' : 'bg-card border border-border text-foreground'}`}
              >{d}</button>
            ))}
          </div>
        </div>

        <Button onClick={startGame} className="w-full h-14 gradient-primary text-primary-foreground font-display font-bold text-lg rounded-xl shadow-warm hover:shadow-glow transition-shadow border-0">
          <Zap className="w-5 h-5 mr-2" /> {t('Start Practice', 'अभ्यास शुरू करें')}
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 md:py-8 space-y-4 h-full flex flex-col max-w-7xl mx-auto w-full">
      {/* Timer & Score Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-card rounded-full px-3 py-1.5 shadow-card">
          <Timer className={`w-4 h-4 ${timerPaused ? 'text-secondary animate-pulse' : timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          <span className={`font-display font-bold text-sm ${timerPaused ? 'text-secondary' : timeLeft <= 10 ? 'text-destructive' : ''}`}>{timerPaused ? '⏸' : `${timeLeft}s`}</span>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 3 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-accent/20 px-2 py-1 rounded-full">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-accent">{streak}x</span>
            </motion.div>
          )}
          <div className="bg-card rounded-full px-3 py-1.5 shadow-card">
            <span className="font-display font-bold text-sm">{score} XP</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full gradient-primary rounded-full" style={{ width: `${(timeLeft / 30) * 100}%` }} />
      </div>

      {/* Problem Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.display}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`w-full max-w-xs rounded-2xl p-8 text-center shadow-elevated border-2 transition-colors ${result === 'correct' ? 'bg-level/10 border-level' : result === 'wrong' ? 'bg-destructive/10 border-destructive' : 'bg-card border-border'}`}
          >
            <p className="font-display font-bold text-2xl text-foreground whitespace-pre-line">{problem.display}</p>
            <p className="text-lg mt-2 font-display font-bold text-muted-foreground">= ?</p>

            <button onClick={() => setShowVedicHint(!showVedicHint)} className="mt-3 text-xs text-secondary font-semibold flex items-center gap-1 mx-auto">
              <Brain className="w-3 h-3" /> {t('Hint', 'संकेत')}
            </button>
            {showVedicHint && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-secondary mt-2 bg-secondary/10 rounded-lg p-2">
                {t(problem.hint.en, problem.hint.hi)}
              </motion.p>
            )}

            {showSolution && result === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-left"
              >
                <p className="text-xs font-bold text-destructive mb-1">{t('Correct Answer:', 'सही उत्तर:')}</p>
                <p className="text-xl font-display font-bold text-foreground">{problem.answer}</p>
                {problem.solution && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground mt-2 mb-0.5">{t('Solution:', 'हल:')}</p>
                    <p className="text-xs text-foreground font-medium">{t(problem.solution.en, problem.solution.hi)}</p>
                  </>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">{t('Next question in 3 seconds…', '3 सेकंड में अगला सवाल…')}</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 w-full max-w-xs">
          <div className="bg-card rounded-xl border-2 border-border p-3 text-center min-h-[52px] flex items-center justify-center">
            <span className={`font-display font-bold text-2xl ${userAnswer ? 'text-foreground' : 'text-muted-foreground/30'}`}>
              {userAnswer || '?'}
            </span>
          </div>
        </div>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full pb-2">
        {['1','2','3','4','5','6','7','8','9','del','0','go'].map(key => (
          <button key={key} onClick={() => handleKeyPad(key)}
            className={`h-12 rounded-xl font-display font-bold text-lg transition-all active:scale-95 ${key === 'go' ? 'gradient-primary text-primary-foreground shadow-warm' : key === 'del' ? 'bg-muted text-muted-foreground' : 'bg-card border border-border text-foreground shadow-card'}`}
          >
            {key === 'del' ? '⌫' : key === 'go' ? <Check className="w-5 h-5 mx-auto" /> : key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PracticePage;

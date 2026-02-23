import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { Check, X, Timer, Zap, Brain, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Difficulty = 'easy' | 'medium' | 'hard';
type Operation = '+' | '-' | '×' | '÷';

const generateProblem = (difficulty: Difficulty, operation: Operation) => {
  let a: number, b: number, answer: number;
  const range = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 100 : 999;

  switch (operation) {
    case '+':
      a = Math.floor(Math.random() * range) + 1;
      b = Math.floor(Math.random() * range) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * range) + 1;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * (difficulty === 'easy' ? 12 : 50)) + 1;
      b = Math.floor(Math.random() * (difficulty === 'easy' ? 12 : 20)) + 1;
      answer = a * b;
      break;
    case '÷':
      b = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 25)) + 1;
      answer = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : 25)) + 1;
      a = b * answer;
      break;
    default:
      a = 1; b = 1; answer = 2;
  }
  return { a, b, answer, operation };
};

const PracticePage = () => {
  const { t } = useLanguage();
  const { addXP, updateAccuracy } = useGame();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [operation, setOperation] = useState<Operation>('+');
  const [problem, setProblem] = useState(generateProblem('easy', '+'));
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showVedicHint, setShowVedicHint] = useState(false);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && isPlaying) {
      setIsPlaying(false);
      addXP(score);
    }
  }, [timeLeft]);

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
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setResult(null);
      setUserAnswer('');
      setProblem(generateProblem(difficulty, operation));
      setShowVedicHint(false);
    }, 800);
  }, [userAnswer, problem, difficulty, operation, streak]);

  const handleKeyPad = (key: string) => {
    if (key === 'del') setUserAnswer(prev => prev.slice(0, -1));
    else if (key === 'go') checkAnswer();
    else setUserAnswer(prev => prev + key);
  };

  const operations: Operation[] = ['+', '-', '×', '÷'];
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  if (!isPlaying) {
    return (
      <div className="px-4 py-4 space-y-5">
        <div>
          <h2 className="font-display font-bold text-xl">{t('Practice Mode', 'अभ्यास मोड')}</h2>
          <p className="text-sm text-muted-foreground">{t('Train your mental math skills', 'अपने गणित कौशल को प्रशिक्षित करें')}</p>
        </div>

        {/* Results if game ended */}
        {totalAnswered > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="gradient-hero rounded-2xl p-6 text-primary-foreground text-center">
            <Trophy className="w-12 h-12 mx-auto mb-2" />
            <h3 className="font-display font-bold text-2xl">{t('Great Job!', 'शानदार!')}</h3>
            <p className="text-3xl font-bold mt-2">{score} XP</p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div><p className="opacity-70">{t('Correct', 'सही')}</p><p className="font-bold text-lg">{correctCount}/{totalAnswered}</p></div>
              <div><p className="opacity-70">{t('Accuracy', 'सटीकता')}</p><p className="font-bold text-lg">{totalAnswered ? Math.round(correctCount/totalAnswered*100) : 0}%</p></div>
            </div>
          </motion.div>
        )}

        {/* Operation Select */}
        <div>
          <h3 className="font-display font-bold text-sm mb-2">{t('Operation', 'संक्रिया')}</h3>
          <div className="flex gap-2">
            {operations.map(op => (
              <button key={op} onClick={() => setOperation(op)}
                className={`flex-1 py-3 rounded-xl font-display font-bold text-lg transition-all ${operation === op ? 'gradient-primary text-primary-foreground shadow-warm' : 'bg-card border border-border text-foreground'}`}
              >{op}</button>
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
    <div className="px-4 py-4 space-y-4 h-full flex flex-col">
      {/* Timer & Score Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-card rounded-full px-3 py-1.5 shadow-card">
          <Timer className={`w-4 h-4 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
          <span className={`font-display font-bold text-sm ${timeLeft <= 10 ? 'text-destructive' : ''}`}>{timeLeft}s</span>
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
            key={`${problem.a}-${problem.b}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`w-full max-w-xs rounded-2xl p-8 text-center shadow-elevated border-2 transition-colors ${
              result === 'correct' ? 'bg-level/10 border-level' : result === 'wrong' ? 'bg-destructive/10 border-destructive' : 'bg-card border-border'
            }`}
          >
            <p className="font-display font-bold text-4xl text-foreground">
              {problem.a} {problem.operation} {problem.b}
            </p>
            <p className="text-lg mt-2 font-display font-bold text-muted-foreground">= ?</p>

            {/* Vedic Hint */}
            <button onClick={() => setShowVedicHint(!showVedicHint)} className="mt-3 text-xs text-secondary font-semibold flex items-center gap-1 mx-auto">
              <Brain className="w-3 h-3" /> {t('Vedic Hint', 'वैदिक संकेत')}
            </button>
            {showVedicHint && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-secondary mt-2 bg-secondary/10 rounded-lg p-2">
                {problem.operation === '+' ? t('Use Ekadhikena: Add 1 to the previous', 'एकाधिकेन: पिछले में 1 जोड़ें') :
                 problem.operation === '-' ? t('Use Nikhilam: Subtract from base', 'निखिलम: आधार से घटाएं') :
                 problem.operation === '×' ? t('Use Urdhva Tiryagbhyam: Cross multiply', 'ऊर्ध्व तिर्यग्भ्याम: क्रॉस गुणा') :
                 t('Use Paravartya: Transpose and adjust', 'परावर्त्य: स्थानांतरित करें और समायोजित करें')}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Answer Display */}
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
          <button
            key={key}
            onClick={() => handleKeyPad(key)}
            className={`h-12 rounded-xl font-display font-bold text-lg transition-all active:scale-95 ${
              key === 'go' ? 'gradient-primary text-primary-foreground shadow-warm' :
              key === 'del' ? 'bg-muted text-muted-foreground' :
              'bg-card border border-border text-foreground shadow-card'
            }`}
          >
            {key === 'del' ? '⌫' : key === 'go' ? <Check className="w-5 h-5 mx-auto" /> : key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PracticePage;

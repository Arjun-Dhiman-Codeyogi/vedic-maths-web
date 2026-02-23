import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, ChevronDown, ChevronUp, Sparkles, Calculator } from 'lucide-react';

type Sutra = {
  id: number;
  nameEn: string;
  nameHi: string;
  meaningEn: string;
  meaningHi: string;
  descEn: string;
  descHi: string;
  exampleProblem: string;
  exampleSteps: { en: string; hi: string }[];
  formulaHighlight: string;
};

const sutras: Sutra[] = [
  {
    id: 1, nameEn: 'Ekadhikena Purvena', nameHi: 'एकाधिकेन पूर्वेण',
    meaningEn: 'By one more than the previous one', meaningHi: 'पिछले से एक अधिक द्वारा',
    descEn: 'Used for squaring numbers ending in 5, and for specific division problems. Multiply the preceding digit by one more than itself, then append 25.',
    descHi: '5 से समाप्त होने वाली संख्याओं के वर्ग और विशेष भाग की समस्याओं के लिए उपयोग किया जाता है। पिछले अंक को उसमें एक जोड़कर गुणा करें, फिर 25 जोड़ दें।',
    exampleProblem: '35² = ?',
    exampleSteps: [
      { en: 'Take 3 (digit before 5)', hi: '3 लें (5 से पहले का अंक)' },
      { en: '3 × (3+1) = 3 × 4 = 12', hi: '3 × (3+1) = 3 × 4 = 12' },
      { en: 'Append 25 → 1225', hi: '25 जोड़ें → 1225' },
      { en: 'Answer: 35² = 1225', hi: 'उत्तर: 35² = 1225' },
    ],
    formulaHighlight: 'n5² = n×(n+1) | 25',
  },
  {
    id: 2, nameEn: 'Nikhilam Navatashcaramam Dashatah', nameHi: 'निखिलम् नवतश्चरमं दशतः',
    meaningEn: 'All from 9 and the last from 10', meaningHi: 'सब 9 से और अंतिम 10 से',
    descEn: 'Used for multiplication of numbers close to a base (10, 100, 1000). Subtract each number from the base, cross-subtract, and multiply the remainders.',
    descHi: 'आधार (10, 100, 1000) के करीब संख्याओं के गुणन के लिए। प्रत्येक संख्या को आधार से घटाएं, क्रॉस-घटाव करें, और शेषफलों को गुणा करें।',
    exampleProblem: '97 × 96 = ?',
    exampleSteps: [
      { en: 'Base = 100. Deficiency: 97→-3, 96→-4', hi: 'आधार = 100. कमी: 97→-3, 96→-4' },
      { en: 'Cross: 97-4 = 93 (or 96-3 = 93)', hi: 'क्रॉस: 97-4 = 93 (या 96-3 = 93)' },
      { en: 'Multiply deficiencies: 3×4 = 12', hi: 'कमियों को गुणा: 3×4 = 12' },
      { en: 'Answer: 9312', hi: 'उत्तर: 9312' },
    ],
    formulaHighlight: '(Base-a)(Base-b) = (a-b̃)|ab̃',
  },
  {
    id: 3, nameEn: 'Urdhva Tiryagbhyam', nameHi: 'ऊर्ध्व तिर्यग्भ्याम्',
    meaningEn: 'Vertically and crosswise', meaningHi: 'ऊर्ध्वाधर और तिरछा',
    descEn: 'The most powerful general multiplication sutra. Works for any multiplication by combining vertical and crosswise products.',
    descHi: 'सबसे शक्तिशाली सामान्य गुणन सूत्र। किसी भी गुणन के लिए ऊर्ध्वाधर और तिरछे गुणनफलों को मिलाकर काम करता है।',
    exampleProblem: '23 × 14 = ?',
    exampleSteps: [
      { en: 'Vertical right: 3×4 = 12, write 2 carry 1', hi: 'दाएं ऊर्ध्वाधर: 3×4 = 12, 2 लिखो 1 हाथ' },
      { en: 'Cross: (2×4)+(3×1) = 8+3 = 11, +1 = 12, write 2 carry 1', hi: 'तिरछा: (2×4)+(3×1) = 8+3 = 11, +1 = 12, 2 लिखो 1 हाथ' },
      { en: 'Vertical left: 2×1 = 2, +1 = 3', hi: 'बाएं ऊर्ध्वाधर: 2×1 = 2, +1 = 3' },
      { en: 'Answer: 322', hi: 'उत्तर: 322' },
    ],
    formulaHighlight: 'ab × cd = a·c | (a·d+b·c) | b·d',
  },
  {
    id: 4, nameEn: 'Paravartya Yojayet', nameHi: 'परावर्त्य योजयेत्',
    meaningEn: 'Transpose and adjust', meaningHi: 'स्थानांतरित करें और समायोजित करें',
    descEn: 'Used for division by numbers slightly greater than a power of 10. Also useful for solving linear equations.',
    descHi: '10 की घात से थोड़ी बड़ी संख्याओं से भाग के लिए। रैखिक समीकरणों को हल करने के लिए भी उपयोगी।',
    exampleProblem: '1234 ÷ 12 = ?',
    exampleSteps: [
      { en: 'Divisor 12, flag = -2', hi: 'भाजक 12, फ्लैग = -2' },
      { en: 'Bring down 1. 1×(-2)=-2, 2+(-2)=0', hi: '1 नीचे लाएं। 1×(-2)=-2, 2+(-2)=0' },
      { en: '0×(-2)=0, 3+0=3. 3×(-2)=-6, 4+(-6)=-2→adjust', hi: '0×(-2)=0, 3+0=3। 3×(-2)=-6, 4+(-6)=-2→समायोजन' },
      { en: 'Answer: 102 remainder 10', hi: 'उत्तर: 102 शेषफल 10' },
    ],
    formulaHighlight: 'Flag = -(divisor - base)',
  },
  {
    id: 5, nameEn: 'Shunyam Saamyasamuccaye', nameHi: 'शून्यम् साम्यसमुच्चये',
    meaningEn: 'When the sum is the same, that sum is zero', meaningHi: 'जब योग समान हो, तो वह योग शून्य है',
    descEn: 'If the sum of numerator and denominator on both sides of an equation are equal, then that sum equals zero. Useful for solving certain types of equations quickly.',
    descHi: 'यदि किसी समीकरण के दोनों पक्षों में अंश और हर का योग बराबर हो, तो वह योग शून्य है। कुछ प्रकार के समीकरणों को शीघ्र हल करने के लिए उपयोगी।',
    exampleProblem: '(x+3)(x+4) = (x+1)(x+12)',
    exampleSteps: [
      { en: 'Sum of constants left: 3+4 = 7', hi: 'बाईं ओर स्थिरांकों का योग: 3+4 = 7' },
      { en: 'Sum of constants right: 1+12 = 13', hi: 'दाईं ओर स्थिरांकों का योग: 1+12 = 13' },
      { en: 'Since sums differ, expand and solve normally', hi: 'चूँकि योग अलग हैं, विस्तार करके हल करें' },
      { en: 'x² + 7x + 12 = x² + 13x + 12 → x = 0', hi: 'x² + 7x + 12 = x² + 13x + 12 → x = 0' },
    ],
    formulaHighlight: 'If Σ(LHS) = Σ(RHS) → Σ = 0',
  },
  {
    id: 6, nameEn: 'Anurupye Shunyamanyat', nameHi: 'आनुरूप्ये शून्यमन्यत्',
    meaningEn: 'If one is in ratio, the other is zero', meaningHi: 'यदि एक अनुपात में है, तो दूसरा शून्य है',
    descEn: 'Used in simultaneous equations. If one variable\'s coefficients are in the same ratio, the other variable is zero.',
    descHi: 'युगपत समीकरणों में उपयोग होता है। यदि एक चर के गुणांक समान अनुपात में हों, तो दूसरा चर शून्य है।',
    exampleProblem: '3x + 7y = 2, 4x + 21y = 6',
    exampleSteps: [
      { en: 'Constants ratio: 2:6 = 1:3', hi: 'स्थिरांक अनुपात: 2:6 = 1:3' },
      { en: 'y coefficients ratio: 7:21 = 1:3 (same!)', hi: 'y गुणांक अनुपात: 7:21 = 1:3 (समान!)' },
      { en: 'Since ratios match, x = 0', hi: 'चूँकि अनुपात मिलते हैं, x = 0' },
      { en: 'Substitute: 7y = 2, y = 2/7', hi: 'प्रतिस्थापन: 7y = 2, y = 2/7' },
    ],
    formulaHighlight: 'Ratio match → other var = 0',
  },
  {
    id: 7, nameEn: 'Sankalana-vyavakalanabhyam', nameHi: 'संकलन-व्यवकलनाभ्याम्',
    meaningEn: 'By addition and subtraction', meaningHi: 'जोड़ और घटाव द्वारा',
    descEn: 'Solve simultaneous equations by adding or subtracting them to eliminate one variable directly.',
    descHi: 'युगपत समीकरणों को जोड़कर या घटाकर एक चर को सीधे हटाकर हल करें।',
    exampleProblem: 'x+y=10, x-y=4',
    exampleSteps: [
      { en: 'Add both: 2x = 14, x = 7', hi: 'दोनों जोड़ें: 2x = 14, x = 7' },
      { en: 'Subtract: 2y = 6, y = 3', hi: 'घटाएं: 2y = 6, y = 3' },
      { en: 'Answer: x=7, y=3', hi: 'उत्तर: x=7, y=3' },
    ],
    formulaHighlight: 'Add/Subtract → Eliminate',
  },
  {
    id: 8, nameEn: 'Puranapuranabhyam', nameHi: 'पूरणापूरणाभ्याम्',
    meaningEn: 'By completion or non-completion', meaningHi: 'पूरा करने या न करने द्वारा',
    descEn: 'Complete the expression to a known form (like completing the square) to simplify calculations.',
    descHi: 'गणना को सरल बनाने के लिए व्यंजक को एक ज्ञात रूप में पूरा करें (जैसे वर्ग पूरा करना)।',
    exampleProblem: 'x² + 6x = 7',
    exampleSteps: [
      { en: 'Complete the square: add (6/2)²=9 both sides', hi: 'वर्ग पूरा करें: दोनों तरफ (6/2)²=9 जोड़ें' },
      { en: 'x² + 6x + 9 = 16', hi: 'x² + 6x + 9 = 16' },
      { en: '(x+3)² = 16 → x+3 = ±4', hi: '(x+3)² = 16 → x+3 = ±4' },
      { en: 'x = 1 or x = -7', hi: 'x = 1 या x = -7' },
    ],
    formulaHighlight: 'x²+bx → (x+b/2)²',
  },
  {
    id: 9, nameEn: 'Chalana-Kalanabhyam', nameHi: 'चलन-कलनाभ्याम्',
    meaningEn: 'Differences and similarities', meaningHi: 'अंतर और समानताएं',
    descEn: 'Used for finding roots of quadratic equations by observing differences and ratios in coefficients.',
    descHi: 'गुणांकों में अंतर और अनुपात देखकर द्विघात समीकरणों के मूल ज्ञात करने के लिए।',
    exampleProblem: 'x² - 7x + 12 = 0',
    exampleSteps: [
      { en: 'Find two numbers: product=12, sum=7', hi: 'दो संख्याएँ ज्ञात करें: गुणनफल=12, योग=7' },
      { en: 'Numbers: 3 and 4 (3×4=12, 3+4=7)', hi: 'संख्याएँ: 3 और 4 (3×4=12, 3+4=7)' },
      { en: '(x-3)(x-4) = 0', hi: '(x-3)(x-4) = 0' },
      { en: 'x = 3 or x = 4', hi: 'x = 3 या x = 4' },
    ],
    formulaHighlight: 'Sum & Product → Factors',
  },
  {
    id: 10, nameEn: 'Yavadunam', nameHi: 'यावदूनम्',
    meaningEn: 'Whatever the extent of its deficiency', meaningHi: 'जितनी भी कमी हो',
    descEn: 'For squaring numbers near a base. Square the deficiency and add/subtract from base adjustments.',
    descHi: 'किसी आधार के पास की संख्याओं के वर्ग के लिए। कमी का वर्ग करें और आधार समायोजन से जोड़ें/घटाएं।',
    exampleProblem: '98² = ?',
    exampleSteps: [
      { en: 'Base = 100, deficiency = 2', hi: 'आधार = 100, कमी = 2' },
      { en: '98 - 2 = 96 (first part)', hi: '98 - 2 = 96 (पहला भाग)' },
      { en: '2² = 04 (second part)', hi: '2² = 04 (दूसरा भाग)' },
      { en: 'Answer: 9604', hi: 'उत्तर: 9604' },
    ],
    formulaHighlight: 'n² = (n-d)(Base) + d²',
  },
  {
    id: 11, nameEn: 'Vyashtisamanstih', nameHi: 'व्यष्टिसमष्टिः',
    meaningEn: 'Part and whole', meaningHi: 'भाग और संपूर्ण',
    descEn: 'Problems involving averages and sums where individual parts relate to the whole systematically.',
    descHi: 'औसत और योग से जुड़ी समस्याएं जहां व्यक्तिगत भाग व्यवस्थित रूप से संपूर्ण से संबंधित हैं।',
    exampleProblem: 'Avg of 5 numbers is 20. One removed, avg is 18. Find removed number.',
    exampleSteps: [
      { en: 'Total = 5×20 = 100', hi: 'कुल = 5×20 = 100' },
      { en: 'New total = 4×18 = 72', hi: 'नया कुल = 4×18 = 72' },
      { en: 'Removed = 100-72 = 28', hi: 'हटाई गई = 100-72 = 28' },
    ],
    formulaHighlight: 'Whole - Remaining = Part',
  },
  {
    id: 12, nameEn: 'Shesanyankena Charamena', nameHi: 'शेषाण्यङ्केन चरमेण',
    meaningEn: 'The remainders by the last digit', meaningHi: 'शेष अंतिम अंक द्वारा',
    descEn: 'Express fractions as decimals using the last digit pattern. Particularly useful for fractions with denominators ending in 9.',
    descHi: 'अंतिम अंक पैटर्न का उपयोग करके भिन्नों को दशमलव के रूप में व्यक्त करें। 9 से समाप्त होने वाले हर वाले भिन्नों के लिए विशेष रूप से उपयोगी।',
    exampleProblem: '1/19 = ?',
    exampleSteps: [
      { en: 'Last digit of 19 is 9. Use Ekadhikena with 2', hi: '19 का अंतिम अंक 9 है। एकाधिकेन 2 के साथ उपयोग करें' },
      { en: 'Start: 1, ×2=2, ×2=4, ×2=8, ×2=16(carry)...', hi: 'शुरू: 1, ×2=2, ×2=4, ×2=8, ×2=16(हाथ)...' },
      { en: '1/19 = 0.052631578947368421 (repeating)', hi: '1/19 = 0.052631578947368421 (दोहराव)' },
    ],
    formulaHighlight: '1/x9 → multiply by (x+1)',
  },
  {
    id: 13, nameEn: 'Sopantyadvayamantyam', nameHi: 'सोपान्त्यद्वयमन्त्यम्',
    meaningEn: 'The ultimate and twice the penultimate', meaningHi: 'अंतिम और उपांत्य का दोगुना',
    descEn: 'Used in specific fraction addition patterns where terms have a systematic relationship.',
    descHi: 'विशिष्ट भिन्न जोड़ पैटर्न में उपयोग होता है जहां पदों का व्यवस्थित संबंध हो।',
    exampleProblem: '1/(2×3) + 1/(3×4) + 1/(4×5)',
    exampleSteps: [
      { en: 'Each term = 1/n - 1/(n+1) (telescoping)', hi: 'प्रत्येक पद = 1/n - 1/(n+1) (टेलीस्कोपिंग)' },
      { en: '= 1/2 - 1/3 + 1/3 - 1/4 + 1/4 - 1/5', hi: '= 1/2 - 1/3 + 1/3 - 1/4 + 1/4 - 1/5' },
      { en: '= 1/2 - 1/5 = 3/10', hi: '= 1/2 - 1/5 = 3/10' },
    ],
    formulaHighlight: 'Telescoping: first - last',
  },
  {
    id: 14, nameEn: 'Ekanyunena Purvena', nameHi: 'एकन्यूनेन पूर्वेण',
    meaningEn: 'By one less than the previous one', meaningHi: 'पिछले से एक कम द्वारा',
    descEn: 'For multiplication where one number consists entirely of 9s. Multiply by (10ⁿ-1) pattern.',
    descHi: 'जब एक संख्या पूरी तरह 9 से बनी हो तब गुणन के लिए। (10ⁿ-1) पैटर्न से गुणा करें।',
    exampleProblem: '76 × 99 = ?',
    exampleSteps: [
      { en: '76 - 1 = 75 (first part)', hi: '76 - 1 = 75 (पहला भाग)' },
      { en: '100 - 76 = 24 (second part)', hi: '100 - 76 = 24 (दूसरा भाग)' },
      { en: 'Answer: 7524', hi: 'उत्तर: 7524' },
    ],
    formulaHighlight: 'n × 99 = (n-1) | (100-n)',
  },
  {
    id: 15, nameEn: 'Gunitasamuchyah', nameHi: 'गुणितसमुच्चयः',
    meaningEn: 'The product of the sum is equal to the sum of the product', meaningHi: 'योग का गुणनफल, गुणनफल के योग के बराबर है',
    descEn: 'Used to verify multiplication results. The product of digit sums should equal the digit sum of the product.',
    descHi: 'गुणन परिणामों की जांच के लिए। अंकों के योग का गुणनफल, गुणनफल के अंकों के योग के बराबर होना चाहिए।',
    exampleProblem: 'Verify: 23 × 14 = 322',
    exampleSteps: [
      { en: 'Digit sum of 23: 2+3 = 5', hi: '23 का अंक योग: 2+3 = 5' },
      { en: 'Digit sum of 14: 1+4 = 5', hi: '14 का अंक योग: 1+4 = 5' },
      { en: '5 × 5 = 25 → digit sum = 7', hi: '5 × 5 = 25 → अंक योग = 7' },
      { en: 'Digit sum of 322: 3+2+2 = 7 ✓ Verified!', hi: '322 का अंक योग: 3+2+2 = 7 ✓ सत्यापित!' },
    ],
    formulaHighlight: 'DigitSum(a×b) = DigitSum(DigitSum(a)×DigitSum(b))',
  },
  {
    id: 16, nameEn: 'Gunakasamuchyah', nameHi: 'गुणकसमुच्चयः',
    meaningEn: 'The factors of the sum is equal to the sum of the factors', meaningHi: 'योग के गुणनखंड, गुणनखंडों के योग के बराबर हैं',
    descEn: 'Verification sutra for factorization. The sum of coefficients of factors equals the value when x=1.',
    descHi: 'गुणनखंडन के सत्यापन सूत्र। गुणनखंडों के गुणांकों का योग x=1 पर मान के बराबर होता है।',
    exampleProblem: 'Verify: x²+5x+6 = (x+2)(x+3)',
    exampleSteps: [
      { en: 'Put x=1 in LHS: 1+5+6 = 12', hi: 'LHS में x=1 रखें: 1+5+6 = 12' },
      { en: 'Put x=1 in RHS: (1+2)(1+3) = 3×4 = 12', hi: 'RHS में x=1 रखें: (1+2)(1+3) = 3×4 = 12' },
      { en: '12 = 12 ✓ Factorization verified!', hi: '12 = 12 ✓ गुणनखंडन सत्यापित!' },
    ],
    formulaHighlight: 'f(1) = product of factor(1)s',
  },
];

const SutrasPage = () => {
  const { t, lang } = useLanguage();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="gradient-hero rounded-2xl p-6 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -left-8 -bottom-8 w-20 h-20 rounded-full bg-white/10" />
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-90" />
          <h1 className="font-display font-bold text-2xl mb-1">{t('Vedic Math Sutras', 'वैदिक गणित सूत्र')}</h1>
          <p className="text-sm opacity-80">{t(`All ${sutras.length} Sutras with examples & explanations`, `सभी ${sutras.length} सूत्र उदाहरण और व्याख्या के साथ`)}</p>
        </div>
      </motion.div>

      {/* Sutras List */}
      <div className="space-y-3">
        {sutras.map((sutra, index) => {
          const isOpen = expanded === sutra.id;
          return (
            <motion.div
              key={sutra.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
            >
              {/* Sutra Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : sutra.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground font-display font-bold text-xs">{sutra.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm truncate">
                    {lang === 'en' ? sutra.nameEn : sutra.nameHi}
                  </h3>
                  <p className="text-[10px] text-muted-foreground italic truncate">
                    {lang === 'en' ? `"${sutra.meaningEn}"` : `"${sutra.meaningHi}"`}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {lang === 'en' ? sutra.descEn : sutra.descHi}
                      </p>

                      {/* Formula Highlight */}
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase">{t('Formula', 'सूत्र')}</span>
                        </div>
                        <p className="font-mono text-sm font-bold text-primary">{sutra.formulaHighlight}</p>
                      </div>

                      {/* Example */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Calculator className="w-3.5 h-3.5 text-secondary" />
                          <span className="text-xs font-bold">{t('Example', 'उदाहरण')}: {sutra.exampleProblem}</span>
                        </div>
                        <div className="space-y-1.5">
                          {sutra.exampleSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] bg-secondary/20 text-secondary rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                              <p className="text-xs text-foreground">{lang === 'en' ? step.en : step.hi}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SutrasPage;

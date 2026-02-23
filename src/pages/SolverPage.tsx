import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Upload, Image as ImageIcon, Wand2, ArrowRight, Clock, Sparkles, X } from 'lucide-react';

const SolverPage = () => {
  const { t } = useLanguage();
  const [showDemo, setShowDemo] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const demoSolution = {
    problem: '47 × 53',
    traditional: {
      steps: ['47 × 53', '47 × 3 = 141', '47 × 50 = 2350', '141 + 2350 = 2491'],
      time: '45 seconds',
    },
    vedic: {
      method: 'Nikhilam Sutra (Base 50)',
      steps: ['Base = 50', '47 - 50 = -3', '53 - 50 = +3', '50² = 2500', '(-3)(+3) = -9', '2500 - 9 = 2491'],
      time: '12 seconds',
    },
  };

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-xl">{t('AI Photo Solver', 'AI फोटो सॉल्वर')}</h2>
        <p className="text-sm text-muted-foreground">{t('Upload a math problem & get dual solutions', 'गणित का सवाल अपलोड करें और दो तरीके से हल पाएं')}</p>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageCapture}
      />

      {/* Captured Image Preview */}
      {capturedImage ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden border-2 border-primary/30 bg-card"
        >
          <button
            onClick={() => setCapturedImage(null)}
            className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
          <img src={capturedImage} alt="Captured math problem" className="w-full max-h-64 object-contain" />
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">{t('Image captured! AI solving coming soon...', 'फोटो ली गई! AI हल जल्द आ रहा है...')}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="gradient-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-warm"
              >
                <Camera className="w-4 h-4" /> {t('Retake', 'दोबारा लें')}
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="bg-card border border-border text-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-card"
              >
                <Upload className="w-4 h-4" /> {t('Choose Another', 'दूसरी चुनें')}
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Upload Area */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center bg-primary/5"
        >
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="font-display font-bold text-base mb-1">{t('Capture or Upload', 'कैप्चर या अपलोड करें')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('Take a photo of any math problem', 'किसी भी गणित के सवाल की फोटो लें')}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-warm"
            >
              <Camera className="w-4 h-4" /> {t('Camera', 'कैमरा')}
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="bg-card border border-border text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-card"
            >
              <Upload className="w-4 h-4" /> {t('Gallery', 'गैलरी')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Demo Button */}
      <button
        onClick={() => setShowDemo(!showDemo)}
        className="w-full bg-card border border-border rounded-xl p-4 shadow-card text-left flex items-center gap-3 transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 gradient-warm rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-sm">{t('See Demo Solution', 'डेमो हल देखें')}</h3>
          <p className="text-xs text-muted-foreground">{t('Compare Traditional vs Vedic methods', 'पारंपरिक बनाम वैदिक विधियों की तुलना करें')}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Demo Solution */}
      {showDemo && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="gradient-hero rounded-xl p-4 text-center text-primary-foreground">
            <p className="text-sm opacity-80">{t('Problem', 'सवाल')}</p>
            <p className="font-display font-bold text-3xl mt-1">{demoSolution.problem}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-4 shadow-card border border-border">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs font-bold text-muted-foreground">{t('TRADITIONAL', 'पारंपरिक')}</span>
              </div>
              {demoSolution.traditional.steps.map((step, i) => (
                <p key={i} className="text-xs text-foreground font-mono py-0.5">{step}</p>
              ))}
              <div className="flex items-center gap-1 mt-3 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-bold">{demoSolution.traditional.time}</span>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 shadow-card border-2 border-primary/30">
              <div className="flex items-center gap-1 mb-2">
                <Wand2 className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold text-primary">{t('VEDIC', 'वैदिक')}</span>
              </div>
              <p className="text-[10px] text-secondary font-semibold italic mb-1">{demoSolution.vedic.method}</p>
              {demoSolution.vedic.steps.map((step, i) => (
                <p key={i} className="text-xs text-foreground font-mono py-0.5">{step}</p>
              ))}
              <div className="flex items-center gap-1 mt-3 text-level">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-bold">{demoSolution.vedic.time} ⚡</span>
              </div>
            </div>
          </div>

          <div className="bg-level/10 rounded-xl p-4 text-center border border-level/20">
            <p className="text-sm font-bold text-level">🚀 {t('Vedic method is 3.75x faster!', 'वैदिक विधि 3.75 गुना तेज है!')}</p>
          </div>
        </motion.div>
      )}

      {/* Features */}
      <div className="space-y-2">
        <h3 className="font-display font-bold text-sm">{t('Features', 'विशेषताएं')}</h3>
        {[
          { icon: '📸', text: t('OCR Math Recognition', 'OCR गणित पहचान') },
          { icon: '✌️', text: t('Dual Solution Output', 'दोहरा समाधान आउटपुट') },
          { icon: '⏱️', text: t('Time Comparison', 'समय तुलना') },
          { icon: '📊', text: t('Difficulty Rating', 'कठिनाई रेटिंग') },
        ].map(f => (
          <div key={f.text} className="flex items-center gap-3 bg-card rounded-lg p-3 shadow-card border border-border">
            <span className="text-lg">{f.icon}</span>
            <span className="text-sm font-medium">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolverPage;

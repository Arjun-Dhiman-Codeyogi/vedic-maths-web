import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCcw, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

const RODS = 5;
const BEADS_TOP = 1;
const BEADS_BOTTOM = 4;

type BeadState = { top: boolean[]; bottom: boolean[][] };

const initBeads = (): BeadState => ({
  top: Array(RODS).fill(false),
  bottom: Array(RODS).fill(null).map(() => Array(BEADS_BOTTOM).fill(false)),
});

const AbacusPage = () => {
  const { t } = useLanguage();
  const [beads, setBeads] = useState<BeadState>(initBeads());
  const [level, setLevel] = useState(1);

  const getValue = () => {
    let value = 0;
    for (let r = 0; r < RODS; r++) {
      const placeValue = Math.pow(10, RODS - 1 - r);
      if (beads.top[r]) value += 5 * placeValue;
      for (let b = 0; b < BEADS_BOTTOM; b++) {
        if (beads.bottom[r][b]) value += placeValue;
      }
    }
    return value;
  };

  const toggleTop = (rod: number) => {
    setBeads(prev => {
      const newTop = [...prev.top];
      newTop[rod] = !newTop[rod];
      return { ...prev, top: newTop };
    });
  };

  const toggleBottom = (rod: number, bead: number) => {
    setBeads(prev => {
      const newBottom = prev.bottom.map(r => [...r]);
      // Toggle all beads from this one up
      for (let b = bead; b < BEADS_BOTTOM; b++) {
        newBottom[rod][b] = !prev.bottom[rod][bead];
      }
      return { ...prev, bottom: newBottom };
    });
  };

  const reset = () => setBeads(initBeads());

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl">{t('Virtual Abacus', 'वर्चुअल अबेकस')}</h2>
          <p className="text-sm text-muted-foreground">{t('Learn bead manipulation', 'मोतियों का हेरफेर सीखें')}</p>
        </div>
        <button onClick={reset} className="p-2 bg-muted rounded-lg">
          <RotateCcw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Value Display */}
      <motion.div
        key={getValue()}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="gradient-hero rounded-2xl p-6 text-center text-primary-foreground"
      >
        <p className="text-sm opacity-80 font-medium">{t('Current Value', 'वर्तमान मान')}</p>
        <p className="text-5xl font-display font-bold mt-1">{getValue().toLocaleString()}</p>
      </motion.div>

      {/* Abacus Frame */}
      <div className="bg-card rounded-2xl shadow-elevated border border-border p-4 overflow-hidden">
        <div className="relative">
          {/* Rods */}
          <div className="flex justify-around">
            {Array(RODS).fill(0).map((_, rod) => (
              <div key={rod} className="flex flex-col items-center gap-1" style={{ width: '16%' }}>
                {/* Place label */}
                <span className="text-[10px] font-bold text-muted-foreground mb-1">
                  {Math.pow(10, RODS - 1 - rod).toLocaleString()}
                </span>

                {/* Top bead (5-value) */}
                <div className="relative h-16 flex flex-col justify-end items-center">
                  <div className="absolute inset-x-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                  <motion.button
                    onClick={() => toggleTop(rod)}
                    animate={{ y: beads.top[rod] ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`relative z-10 w-10 h-6 rounded-full shadow-md border-2 transition-colors ${
                      beads.top[rod]
                        ? 'gradient-primary border-primary/50'
                        : 'bg-muted border-border'
                    }`}
                  />
                </div>

                {/* Divider bar */}
                <div className="w-full h-1 gradient-primary rounded-full my-1" />

                {/* Bottom beads (1-value each) */}
                <div className="relative h-32 flex flex-col justify-start items-center gap-1">
                  <div className="absolute inset-x-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                  {Array(BEADS_BOTTOM).fill(0).map((_, bead) => (
                    <motion.button
                      key={bead}
                      onClick={() => toggleBottom(rod, BEADS_BOTTOM - 1 - bead)}
                      animate={{ y: beads.bottom[rod][BEADS_BOTTOM - 1 - bead] ? -20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`relative z-10 w-10 h-6 rounded-full shadow-md border-2 transition-colors ${
                        beads.bottom[rod][BEADS_BOTTOM - 1 - bead]
                          ? 'gradient-warm border-secondary/50'
                          : 'bg-muted border-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Speed Drill */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-sm">{t('Speed Drill', 'स्पीड ड्रिल')}</h3>
            <p className="text-xs text-muted-foreground">{t('Level', 'स्तर')} {level}</p>
          </div>
          <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-1 shadow-warm">
            <Play className="w-4 h-4" /> {t('Start', 'शुरू')}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted rounded-xl p-4">
        <h3 className="font-display font-bold text-sm mb-2">{t('How to Use', 'कैसे उपयोग करें')}</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p>• {t('Top bead = 5, Bottom beads = 1 each', 'ऊपर का मोती = 5, नीचे के मोती = 1 प्रत्येक')}</p>
          <p>• {t('Tap beads to move them toward the bar', 'मोतियों को बार की ओर ले जाने के लिए टैप करें')}</p>
          <p>• {t('Each rod represents a place value', 'प्रत्येक रॉड एक स्थान मान दर्शाती है')}</p>
        </div>
      </div>
    </div>
  );
};

export default AbacusPage;

import { useLanguage } from '@/contexts/LanguageContext';
import { useGame } from '@/contexts/GameContext';
import { Globe, Flame } from 'lucide-react';

const TopBar = () => {
  const { lang, toggleLang } = useLanguage();
  const { student } = useGame();

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">M</span>
          </div>
          <h1 className="font-display font-bold text-base gradient-text">MathGenius</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
            <Flame className="w-4 h-4 text-streak animate-fire-flicker" />
            <span className="text-xs font-bold text-foreground">{student.streak}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
            <span className="text-xs">⚡</span>
            <span className="text-xs font-bold text-foreground">{student.xp} XP</span>
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full transition-colors hover:bg-accent/20"
          >
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-foreground">{lang === 'en' ? 'हि' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

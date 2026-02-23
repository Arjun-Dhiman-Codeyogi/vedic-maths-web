import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Brain, Calculator, User, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, labelEn: 'Home', labelHi: 'होम' },
  { path: '/learn', icon: BookOpen, labelEn: 'Learn', labelHi: 'सीखें' },
  { path: '/practice', icon: Brain, labelEn: 'Practice', labelHi: 'अभ्यास' },
  { path: '/abacus', icon: Calculator, labelEn: 'Abacus', labelHi: 'अबेकस' },
  { path: '/solver', icon: Camera, labelEn: 'Solver', labelHi: 'सॉल्वर' },
  { path: '/profile', icon: User, labelEn: 'Profile', labelHi: 'प्रोफाइल' },
];

const BottomNav = () => {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)] h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-0.5 w-8 h-1 rounded-full gradient-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <span
                className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {t(item.labelEn, item.labelHi)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

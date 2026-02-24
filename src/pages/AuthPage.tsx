import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [classGrade, setClassGrade] = useState('6');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: t('Welcome back!', 'वापस स्वागत है!') });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName, class_grade: parseInt(classGrade) },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: t('Account created! Logging in...', 'अकाउंट बन गया! लॉगिन हो रहा है...') });
        navigate('/');
      }
    } catch (error) {
      toast({ title: t('Error', 'त्रुटि'), description: error instanceof Error ? error.message : 'An error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-warm">
            <span className="text-primary-foreground font-display font-bold text-2xl">M</span>
          </div>
          <h1 className="font-display font-bold text-2xl gradient-text">MathGenius</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('Master Vedic Mathematics', 'वैदिक गणित में महारत हासिल करें')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border">
          {/* Tab Switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold transition-all ${isLogin ? 'gradient-primary text-primary-foreground shadow-warm' : 'text-muted-foreground'}`}
            >
              {t('Login', 'लॉगिन')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-display font-bold transition-all ${!isLogin ? 'gradient-primary text-primary-foreground shadow-warm' : 'text-muted-foreground'}`}
            >
              {t('Sign Up', 'साइन अप')}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm font-display font-semibold">{t('Name', 'नाम')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t('Your name', 'आपका नाम')}
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm font-display font-semibold">{t('Class / Grade', 'कक्षा')}</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    className="w-full pl-10 h-12 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(g => (
                      <option key={g} value={g}>{t(`Class ${g}`, `कक्षा ${g}`)}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-display font-semibold">{t('Email', 'ईमेल')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-display font-semibold">{t('Password', 'पासवर्ड')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 h-12 rounded-xl"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-primary-foreground font-display font-bold text-base rounded-xl shadow-warm border-0"
            >
              {loading ? (
                <span className="animate-spin">⏳</span>
              ) : isLogin ? (
                <><LogIn className="w-5 h-5 mr-2" /> {t('Login', 'लॉगिन')}</>
              ) : (
                <><UserPlus className="w-5 h-5 mr-2" /> {t('Sign Up', 'साइन अप')}</>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

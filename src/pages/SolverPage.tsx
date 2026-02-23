import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Upload, Wand2, Clock, X, Volume2, VolumeX, Send, Loader2, Sparkles, MessageCircle, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

type SolutionData = {
  problem: string;
  traditional: { steps: string[]; time: string; explanation_hi: string; explanation_en: string };
  vedic: { method: string; steps: string[]; time: string; explanation_hi: string; explanation_en: string };
  speedup: string;
  difficulty: string;
};

type ChatMsg = { role: 'user' | 'assistant'; content: string };

const SolverPage = () => {
  const { t, lang } = useLanguage();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [solving, setSolving] = useState(false);
  const [error, setError] = useState('');
  const [solutionLang, setSolutionLang] = useState<'en' | 'hi'>(lang as 'en' | 'hi');

  // TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraOnlyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => { synthRef.current.cancel(); };
  }, []);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setCapturedImage(base64);
        solveProblem(base64, null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextSolve = () => {
    if (!textInput.trim()) return;
    solveProblem(null, textInput.trim());
  };

  const solveProblem = async (imageBase64: string | null, textProblem: string | null) => {
    setSolving(true);
    setError('');
    setSolution(null);
    setChatMessages([]);
    synthRef.current.cancel();
    setIsSpeaking(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('math-solver', {
        body: { imageBase64, textProblem },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setSolution(data as SolutionData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSolving(false);
    }
  };

  const toggleSpeak = () => {
    if (!solution) return;
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const isHindi = lang === 'hi';
    const trad = isHindi ? solution.traditional.explanation_hi : solution.traditional.explanation_en;
    const ved = isHindi ? solution.vedic.explanation_hi : solution.vedic.explanation_en;

    const fullText = isHindi
      ? `सवाल है: ${solution.problem}। पहले पारंपरिक तरीके से: ${trad}। अब वैदिक गणित से: ${solution.vedic.method} सूत्र का उपयोग करके: ${ved}। वैदिक विधि ${solution.speedup} तेज है!`
      : `The problem is: ${solution.problem}. First, the traditional method: ${trad}. Now the Vedic Math way, using ${solution.vedic.method}: ${ved}. The Vedic method is ${solution.speedup} faster!`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: 'user', content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    let assistantSoFar = '';
    const problemContext = solution
      ? `Problem: ${solution.problem}\nTraditional: ${solution.traditional.steps.join(' → ')}\nVedic (${solution.vedic.method}): ${solution.vedic.steps.join(' → ')}`
      : '';

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solver-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages, problemContext }),
      });

      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { /* partial JSON, skip */ }
        }
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `❌ ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 md:py-8 space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-xl">{t('AI Photo Solver', 'AI फोटो सॉल्वर')}</h2>
        <p className="text-sm text-muted-foreground">{t('Upload a math problem & get dual solutions', 'गणित का सवाल अपलोड करें और दो तरीके से हल पाएं')}</p>
      </div>

      {/* Hidden file inputs */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageCapture} />
      {/* Camera-only input for mobile */}
      <input ref={cameraOnlyRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleImageCapture} />

      {/* Upload / Capture Area */}
      {!solution && !solving && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center bg-primary/5">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-display font-bold text-base mb-1">{t('Capture or Upload', 'कैप्चर या अपलोड करें')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('Take a photo of any math problem', 'किसी भी गणित के सवाल की फोटो लें')}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => cameraInputRef.current?.click()} className="gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-warm hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" /> {t('Camera', 'कैमरा')}
              </button>
              <button onClick={() => galleryInputRef.current?.click()} className="bg-card border border-border text-foreground px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-card hover:scale-105 transition-transform">
                <Upload className="w-4 h-4" /> {t('Gallery', 'गैलरी')}
              </button>
            </div>
          </div>

          {/* Text input */}
          <div className="flex gap-2">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTextSolve()}
              placeholder={t('Or type a problem: 47 × 53', 'या सवाल टाइप करें: 47 × 53')}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={handleTextSolve} className="gradient-primary text-primary-foreground px-4 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-warm">
              <Wand2 className="w-4 h-4" /> {t('Solve', 'हल करो')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Solving loader */}
      {solving && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-4">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="font-display font-bold text-base">{t('AI is solving...', 'AI हल कर रहा है...')}</p>
          <p className="text-sm text-muted-foreground">{t('Analyzing with Traditional & Vedic methods', 'पारंपरिक और वैदिक दोनों तरीके से')}</p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <button onClick={() => { setError(''); setCapturedImage(null); }} className="mt-2 text-xs text-primary underline">{t('Try again', 'दोबारा कोशिश करें')}</button>
        </div>
      )}

      {/* Solution Display */}
      {solution && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header with problem + controls */}
          <div className="gradient-hero rounded-xl p-4 text-primary-foreground flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">{t('Problem', 'सवाल')}</p>
              <p className="font-display font-bold text-2xl">{solution.problem}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] bg-primary-foreground/20 px-2 py-0.5 rounded-full">{solution.difficulty}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleSpeak} className={`p-3 rounded-xl transition-all ${isSpeaking ? 'bg-primary-foreground text-primary' : 'bg-primary-foreground/20 text-primary-foreground'}`}>
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button onClick={() => { setSolution(null); setCapturedImage(null); setTextInput(''); setChatMessages([]); synthRef.current.cancel(); setIsSpeaking(false); }} className="p-3 rounded-xl bg-primary-foreground/20 text-primary-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Solution Language Toggle */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 bg-card border border-border rounded-full p-1">
              <button
                onClick={() => setSolutionLang('en')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all ${solutionLang === 'en' ? 'gradient-primary text-primary-foreground shadow-warm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Globe className="w-3 h-3" /> English
              </button>
              <button
                onClick={() => setSolutionLang('hi')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all ${solutionLang === 'hi' ? 'gradient-primary text-primary-foreground shadow-warm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Globe className="w-3 h-3" /> हिंदी
              </button>
            </div>
          </div>

          {/* Explanation in selected language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3 border border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{solutionLang === 'en' ? 'Traditional Explanation' : 'पारंपरिक व्याख्या'}</p>
              <p className="text-xs text-foreground leading-relaxed">{solutionLang === 'en' ? solution.traditional.explanation_en : solution.traditional.explanation_hi}</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
              <p className="text-[10px] font-bold text-primary uppercase mb-1">{solutionLang === 'en' ? 'Vedic Explanation' : 'वैदिक व्याख्या'}</p>
              <p className="text-xs text-foreground leading-relaxed">{solutionLang === 'en' ? solution.vedic.explanation_en : solution.vedic.explanation_hi}</p>
            </div>
          </div>

          {/* Dual Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Traditional */}
            <div className="bg-card rounded-xl p-4 shadow-card border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase">{t('Traditional Method', 'पारंपरिक तरीका')}</span>
              </div>
              <div className="space-y-1.5">
                {solution.traditional.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <p className="text-sm text-foreground font-mono">{step}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-3 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{solution.traditional.time}</span>
              </div>
            </div>

            {/* Vedic */}
            <div className="bg-card rounded-xl p-4 shadow-card border-2 border-primary/30">
              <div className="flex items-center gap-2 mb-1">
                <Wand2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase">{t('Vedic Math', 'वैदिक गणित')}</span>
              </div>
              <p className="text-[10px] text-secondary font-semibold italic mb-2">{solution.vedic.method}</p>
              <div className="space-y-1.5">
                {solution.vedic.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <p className="text-sm text-foreground font-mono">{step}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-3 text-primary">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{solution.vedic.time} ⚡</span>
              </div>
            </div>
          </div>

          {/* Time Comparison Bars */}
          {(() => {
            const parseTime = (t: string) => parseFloat(t.replace(/[^0-9.]/g, '')) || 1;
            const tradTime = parseTime(solution.traditional.time);
            const vedTime = parseTime(solution.vedic.time);
            const maxTime = Math.max(tradTime, vedTime);
            const tradPercent = (tradTime / maxTime) * 100;
            const vedPercent = (vedTime / maxTime) * 100;
            return (
              <div className="bg-card rounded-xl p-4 shadow-card border border-border space-y-3">
                <h4 className="font-display font-bold text-sm text-center">{t('⏱ Time Comparison', '⏱ समय तुलना')}</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-destructive">{t('Traditional', 'पारंपरिक')}</span>
                      <span className="font-bold text-destructive">{solution.traditional.time}</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${tradPercent}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-destructive/70 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-green-600 dark:text-green-400">{t('Vedic Math', 'वैदिक गणित')} ⚡</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{solution.vedic.time}</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${vedPercent}%` }} transition={{ duration: 0.8, delay: 0.4 }} className="h-full bg-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs font-bold text-green-600 dark:text-green-400">🚀 {t(`Vedic method is ${solution.speedup} faster!`, `वैदिक विधि ${solution.speedup} तेज है!`)}</p>
              </div>
            );
          })()}

          {/* Image preview if used */}
          {capturedImage && (
            <div className="rounded-xl overflow-hidden border border-border max-h-40">
              <img src={capturedImage} alt="Problem" className="w-full object-contain max-h-40" />
            </div>
          )}

          {/* Chat Section */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-sm">{t('Ask AI about this problem', 'इस सवाल के बारे में AI से पूछें')}</span>
            </div>

            {/* Chat messages */}
            <div className="max-h-64 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t('Ask anything about the solution! e.g. "Explain the Vedic method in detail"', 'हल के बारे में कुछ भी पूछें! जैसे "वैदिक तरीका विस्तार से समझाओ"')}
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'gradient-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && chatMessages[chatMessages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="flex gap-2 p-3 border-t border-border">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder={t('Type your question...', 'अपना सवाल लिखें...')}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="gradient-primary text-primary-foreground p-2 rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Solve another */}
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => cameraInputRef.current?.click()} className="bg-card border border-border text-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-card">
              <Camera className="w-4 h-4" /> {t('New Photo', 'नई फोटो')}
            </button>
            <button onClick={() => { setSolution(null); setCapturedImage(null); setChatMessages([]); synthRef.current.cancel(); setIsSpeaking(false); }} className="bg-card border border-border text-foreground px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-card">
              <Wand2 className="w-4 h-4" /> {t('Type Problem', 'सवाल लिखें')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SolverPage;

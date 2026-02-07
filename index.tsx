
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from '@google/genai';

// --- Types & Constants ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const COURSES = [
  { id: 'python', title: 'Python Mastery', icon: 'fab fa-python', color: '#3776AB', desc: 'Complete automation & data structures.' },
  { id: 'sql', title: 'SQL Specialist', icon: 'fas fa-database', color: '#F29111', desc: 'Complex joins & performance tuning.' },
  { id: 'ml', title: 'Machine Learning', icon: 'fas fa-brain', color: '#FF6B6B', desc: 'Supervised & Unsupervised modeling.' },
  { id: 'genai', title: 'Generative AI', icon: 'fas fa-robot', color: '#8B5CF6', desc: 'LLMs, RAG & Vector Databases.' },
  { id: 'de', title: 'Data Engineering', icon: 'fas fa-server', color: '#10B981', desc: 'ETL Pipelines & Warehousing.' },
  { id: 'nlp', title: 'NLP Expert', icon: 'fas fa-language', color: '#EC4899', desc: 'Transformers & Sentiment Analysis.' },
  { id: 'cv', title: 'Computer Vision', icon: 'fas fa-eye', color: '#3B82F6', desc: 'Object detection & OpenCV.' },
  { id: 'mlops', title: 'MLOps Pro', icon: 'fas fa-infinity', color: '#F59E0B', desc: 'CI/CD for Machine Learning.' },
  { id: 'stats', title: 'Stats for DS', icon: 'fas fa-chart-line', color: '#6366F1', desc: 'Probability & Hypothesis Testing.' },
  { id: 'bigdata', title: 'Big Data Stack', icon: 'fas fa-cubes', color: '#06B6D4', desc: 'Apache Spark & Distributed Compute.' }
];

// --- Audio Utilities ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Voice Hooks ---
const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        setTranscript(event.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return { isListening, transcript, startListening, setTranscript };
};

const App = () => {
  // Config
  const [isMuted, setIsMuted] = useState(false);
  
  // Interview States
  const [currentQuestion, setCurrentQuestion] = useState("Click 'Generate' to start your AI session.");
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  // Mentor States
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorInput, setMentorInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Sanjay's AI Mentor. How can I help you today?" }
  ]);

  // Voice Hooks
  const interviewSpeech = useSpeechToText();
  const mentorSpeech = useSpeechToText();

  // TTS Helper
  const speakText = async (text: string) => {
    if (isMuted) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text.substring(0, 500) }] }], // Limit to 500 chars for speed
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      }
    } catch (e) {
      console.error("TTS Error:", e);
    }
  };

  // Listen to Interview voice
  useEffect(() => {
    if (interviewSpeech.transcript) {
      setUserAnswer(prev => prev + (prev ? ' ' : '') + interviewSpeech.transcript);
      interviewSpeech.setTranscript('');
    }
  }, [interviewSpeech.transcript]);

  // Listen to Mentor voice
  useEffect(() => {
    if (mentorSpeech.transcript) {
      setMentorInput(prev => prev + (prev ? ' ' : '') + mentorSpeech.transcript);
      mentorSpeech.setTranscript('');
    }
  }, [mentorSpeech.transcript]);

  // Interview Logic
  const generateQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate one unique, advanced technical interview question for a senior data scientist. Be concise.",
        config: { systemInstruction: "You are a lead technical recruiter." }
      });
      const q = response.text || "Question generation failed.";
      setCurrentQuestion(q);
      setUserAnswer('');
      speakText("Next question: " + q);
    } catch (e) {
      setCurrentQuestion("Error generating question. Try again.");
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Question: ${currentQuestion}\nAnswer: ${userAnswer}`,
        config: { systemInstruction: "Grade the answer on a scale of 0-100. Provide format 'SCORE: X/100' and brief technical feedback." }
      });
      const resText = response.text || "No feedback.";
      setFeedback(resText);
      const scoreMatch = resText.match(/SCORE:\s*(\d+)/i);
      if (scoreMatch) setScore(parseInt(scoreMatch[1]));
      speakText(resText);
    } catch (e) {
      setFeedback("Evaluation failed.");
    } finally { setLoading(false); }
  };

  const handleMentorChat = async () => {
    if (!mentorInput.trim()) return;
    const userMsg = { role: 'user' as const, content: mentorInput };
    setChatHistory(prev => [...prev, userMsg]);
    setMentorInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: mentorInput,
        config: { systemInstruction: "You are a career mentor. Provide short, encouraging, and technically sound advice." }
      });
      const resText = response.text || "No response.";
      setChatHistory(prev => [...prev, { role: 'assistant', content: resText }]);
      speakText(resText);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Connection failed." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* Navigation */}
      <nav className="glass sticky top-0 z-[100] px-6 py-4 mb-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <i className="fas fa-brain text-white"></i>
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">SANJAY<span className="text-blue-500">.AI</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-3 rounded-xl border transition-all ${isMuted ? 'border-red-500/30 text-red-500' : 'border-blue-500/30 text-blue-500'}`}
              title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
            >
              <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
            </button>
            <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
              <a href="#courses" className="hover:text-blue-500 transition-colors">Courses</a>
              <a href="#interview" className="hover:text-blue-500 transition-colors">Interview</a>
              <a href="#mentor" className="hover:text-blue-500 transition-colors">Career</a>
            </div>
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
              Join Pro
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 mt-16">
        
        {/* Ad Container */}
        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center min-h-[140px] glow-blue mb-20">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Sponsored Advertisement</p>
          <div id="container-60628026e53845544ac4a88c563c9750"></div>
        </div>

        {/* Hero */}
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-8">
            AI That Speaks <br /> <span className="gradient-text">Your Language.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg leading-relaxed font-medium">
            The world's first voice-powered Data Science academy. Interview, chat, and learn 
            using natural language processing powered by Gemini 2.5.
          </p>
        </div>

        {/* Courses Section */}
        <section id="courses" className="mb-32">
          <h3 className="text-3xl font-black mb-12 tracking-tight">Technical Curriculum</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {COURSES.map(c => (
              <div key={c.id} className="glass p-8 rounded-[2rem] skill-card group relative transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: c.color }}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl" style={{ backgroundColor: `${c.color}15` }}>
                  <i className={`${c.icon} text-2xl`} style={{ color: c.color }}></i>
                </div>
                <h4 className="text-lg font-black mb-2">{c.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mb-8">{c.desc}</p>
                <button className="w-full py-3 bg-white/5 group-hover:bg-blue-600 transition-colors rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Interview Engine */}
        <section id="interview" className="grid lg:grid-cols-3 gap-10 mb-32 items-start">
          <div className="lg:col-span-2">
            <div className="glass rounded-[3rem] p-12 border-l-[12px] border-blue-600 glow-blue">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-float">
                  <i className="fas fa-headset text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight uppercase italic">Voice Mock Interview</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Two-Way Voice Protocol Enabled</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-[2.5rem] p-10 mb-10 border border-white/5 min-h-[160px] flex items-center shadow-inner italic font-medium text-xl leading-relaxed text-gray-100 relative group">
                {loading && !feedback ? "Analyzing trends..." : `"${currentQuestion}"`}
                <button onClick={() => speakText(currentQuestion)} className="absolute right-4 bottom-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-volume-up"></i>
                </button>
              </div>

              <div className="space-y-6 relative">
                <textarea 
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Speak your technical solution..."
                  className="w-full h-64 bg-black/60 border border-white/10 rounded-[2.5rem] p-10 text-xl text-gray-200 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all resize-none shadow-2xl font-mono"
                ></textarea>

                <button 
                  onClick={interviewSpeech.startListening}
                  className={`absolute bottom-8 right-8 w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl ${interviewSpeech.isListening ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  <i className={`fas ${interviewSpeech.isListening ? 'fa-microphone' : 'fa-microphone-alt'} text-white text-2xl`}></i>
                  {interviewSpeech.isListening && <span className="absolute -top-12 bg-red-600 text-[10px] px-2 py-1 rounded">Listening...</span>}
                </button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={generateQuestion} className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-2xl font-black border border-white/10 uppercase text-xs">New Scenario</button>
                  <button onClick={submitAnswer} className="flex-[2] py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-2xl transition-all uppercase text-xs">
                    {loading ? 'Evaluating...' : 'Submit & Hear Feedback'}
                  </button>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="mt-10 glass rounded-[3rem] p-12 animate-in slide-in-from-bottom-10 border-blue-500/20 relative group">
                <div className="flex items-center gap-3 text-blue-400 font-black mb-6 uppercase tracking-widest text-xs">
                  <i className="fas fa-check-circle"></i> Technical Evaluation (Spoken)
                </div>
                <div className="text-gray-300 leading-relaxed font-bold text-lg whitespace-pre-wrap">{feedback}</div>
                <button onClick={() => speakText(feedback)} className="absolute right-8 top-8 w-12 h-12 bg-blue-600/10 rounded-full hover:bg-blue-600/20 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                   <i className="fas fa-redo"></i>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="glass rounded-[3rem] p-10 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent group-hover:scale-x-150 transition-transform duration-1000"></div>
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Mastery Ranking</h4>
              <div className="text-8xl font-black gradient-text mb-6">{score}</div>
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${score}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Global Top 1% Active</p>
            </div>
          </div>
        </section>
      </main>

      {/* Career Mentor with Voice Responses */}
      <div className={`fixed bottom-10 right-10 z-[300] transition-all duration-500 transform ${mentorOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-75 pointer-events-none'}`}>
        <div className="glass w-[420px] h-[640px] rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden border-blue-600/30">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white flex justify-between items-center relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <i className="fas fa-robot text-xl"></i>
              </div>
              <div>
                <h4 className="font-black tracking-tight leading-none">Voice AI Mentor</h4>
                <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Speech protocol: Kore</span>
              </div>
            </div>
            <button onClick={() => setMentorOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#0a0d14]/80">
            {chatHistory.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-medium ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-xl' : 'glass text-gray-200 rounded-tl-none border-white/5'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-blue-500 text-xs italic animate-pulse flex items-center gap-2 font-black uppercase tracking-widest"><i className="fas fa-wave-square animate-pulse"></i> Generating Audio...</div>}
          </div>

          <div className="p-6 bg-black/60 border-t border-white/5 flex flex-col gap-3">
            <div className="flex gap-3">
              <input 
                value={mentorInput} 
                onChange={(e) => setMentorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleMentorChat()}
                placeholder="Ask for advice..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={mentorSpeech.startListening} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${mentorSpeech.isListening ? 'bg-red-600' : 'bg-white/5 text-gray-400'}`}>
                <i className="fas fa-microphone"></i>
              </button>
              <button onClick={handleMentorChat} className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg"><i className="fas fa-paper-plane text-white"></i></button>
            </div>
            {mentorSpeech.isListening && <p className="text-[10px] text-red-400 font-bold uppercase text-center animate-pulse">Mic Listening...</p>}
          </div>
        </div>
      </div>

      <button onClick={() => setMentorOpen(!mentorOpen)} className="fixed bottom-10 right-10 w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-3xl shadow-2xl flex items-center justify-center z-[310] transition-all transform hover:scale-110 active:scale-95 group">
        <i className={`fas ${mentorOpen ? 'fa-times' : 'fa-headset'} text-white text-3xl transition-transform duration-500 ${mentorOpen ? 'rotate-90' : 'rotate-0'}`}></i>
      </button>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-40 py-20 border-t border-white/5 text-center">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2025 SANJAY.AI ACADEMY. VOICE-FIRST INTERFACE.</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

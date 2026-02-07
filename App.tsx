
import React, { useState } from 'react';
import Header from './components/Header';
import AdContainer from './components/AdContainer';
import InterviewPanel from './components/InterviewPanel';
import SkillModal from './components/SkillModal';
import { SKILLS_DATABASE } from './constants';
import { Skill } from './types';

const App: React.FC = () => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <div className="min-h-screen pb-20">
      <Header />
      
      {/* Top Ad */}
      <AdContainer />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-24 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
          Master Data Science & <br className="hidden md:block" /> Generative AI
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-gray-400 mb-10">
          A world-class skill-based learning platform featuring real-world examples, 
          code implementations, and AI-powered mock interviews to accelerate your career.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          {[
            { n: '10+', l: 'Technologies' },
            { n: '100+', l: 'Chapters' },
            { n: '500+', l: 'Real Examples' },
            { n: '24/7', l: 'AI Assistant' }
          ].map((s, i) => (
            <div key={i} className="px-8 py-4 bg-[#111827] border border-white/5 rounded-2xl">
              <div className="text-2xl font-bold text-blue-400">{s.n}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Grid */}
      <section id="skills" className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SKILLS_DATABASE.map((skill) => (
            <div 
              key={skill.id}
              onClick={() => setSelectedSkill(skill)}
              className="group bg-[#111827] border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-[#151c2c] transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: skill.color }}></div>
              <div className="text-3xl mb-4" style={{ color: skill.color }}>
                <i className={skill.icon}></i>
              </div>
              <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{skill.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {skill.topics.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-white/5 px-2 py-1 rounded-full uppercase tracking-tighter text-gray-400">
                    {t}
                  </span>
                ))}
              </div>
              
              <button className="w-full py-2 bg-white/5 group-hover:bg-blue-600 transition-colors rounded-lg text-sm font-semibold">
                Learn Now
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Mock Interview Area */}
      <InterviewPanel />

      {/* Footer / Contact */}
      <footer className="max-w-7xl mx-auto px-4 mt-20 pt-10 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          &copy; 2024 Sanjay's AI Education. Powered by DeepSeek R1 & Gemini.
        </p>
      </footer>

      {/* Skill Detail Modal */}
      {selectedSkill && (
        <SkillModal 
          skill={selectedSkill} 
          onClose={() => setSelectedSkill(null)} 
        />
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <button className="w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110">
          <i className="fas fa-robot text-xl"></i>
        </button>
        <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110">
          <i className="fas fa-graduation-cap text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default App;

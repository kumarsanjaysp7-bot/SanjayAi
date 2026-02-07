
import React from 'react';
import { Skill, Chapter } from '../types';

interface SkillModalProps {
  skill: Skill;
  onClose: () => void;
}

const SkillModal: React.FC<SkillModalProps> = ({ skill, onClose }) => {
  const [selectedChapter, setSelectedChapter] = React.useState<Chapter | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <i className={`${skill.icon}`} style={{ color: skill.color }}></i>
            {skill.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-400 mb-8">{skill.description}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {!selectedChapter ? (
              skill.chapters.map((chapter, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedChapter(chapter)}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 cursor-pointer transition-all group"
                >
                  <h3 className="text-lg font-semibold text-blue-400 mb-2 group-hover:text-blue-300">
                    {chapter.title}
                  </h3>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {chapter.topics.map((t, idx) => <li key={idx}>• {t}</li>)}
                  </ul>
                </div>
              ))
            ) : (
              <div className="col-span-2 animate-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setSelectedChapter(null)}
                  className="mb-4 text-sm text-blue-400 hover:underline flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i> Back to Chapters
                </button>
                <div className="space-y-6">
                  <section>
                    <h4 className="text-lg font-semibold text-white mb-2">Theory</h4>
                    <p className="text-gray-400 leading-relaxed">{selectedChapter.theory}</p>
                  </section>
                  <section>
                    <h4 className="text-lg font-semibold text-white mb-2">Code Example</h4>
                    <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto text-sm text-blue-300 font-mono">
                      {selectedChapter.codeExample}
                    </pre>
                  </section>
                  <section className="bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-lg font-semibold text-green-400 mb-1">Real-World Case</h4>
                    <p className="text-gray-400">{selectedChapter.realWorldExample}</p>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillModal;


import React, { useState } from 'react';
import { getAICompletion } from '../services/aiService';
import { InterviewState } from '../types';

const InterviewPanel: React.FC = () => {
  const [state, setState] = useState<InterviewState>({
    score: 75,
    questionsAnswered: 0,
    totalQuestions: 10,
    currentQuestion: "Click 'Generate' to start your session.",
    history: []
  });
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const generateQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const q = await getAICompletion([
        { role: 'system', content: 'You are a technical interviewer for Data Science. Generate one concise, challenging interview question.' },
        { role: 'user', content: 'Generate a new question.' }
      ]);
      setState(prev => ({ ...prev, currentQuestion: q }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const prompt = `Question: ${state.currentQuestion}\nCandidate Answer: ${answer}\nEvaluate the answer accurately on a scale of 0-100. Provide concise technical feedback and a score.`;
      const result = await getAICompletion([
        { role: 'system', content: 'You are an AI Interviewer. Provide a score out of 100 and brief feedback.' },
        { role: 'user', content: prompt }
      ]);
      
      setFeedback(result);
      
      // Update local state
      const scoreMatch = result.match(/(\d+)\/100/);
      const newScoreValue = scoreMatch ? parseInt(scoreMatch[1]) : 70;
      
      setState(prev => ({
        ...prev,
        score: Math.round((prev.score + newScoreValue) / 2),
        questionsAnswered: prev.questionsAnswered + 1,
      }));
      setAnswer('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="interview" className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
              <h2 className="text-xl font-bold">AI Mock Interview</h2>
              <div className="flex gap-3 text-xs text-gray-500 uppercase tracking-widest">
                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Data Science</span>
                <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20">Hard</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-6 mb-8 border-l-4 border-blue-500 min-h-[100px]">
              {loading && !state.currentQuestion ? (
                <div className="flex items-center gap-3 text-blue-400">
                  <i className="fas fa-circle-notch animate-spin"></i> Initializing...
                </div>
              ) : (
                <p className="text-lg text-gray-200 leading-relaxed italic">
                  "{state.currentQuestion}"
                </p>
              )}
            </div>

            <div className="space-y-4">
              <textarea 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your technical answer here..."
                className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              ></textarea>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={generateQuestion}
                  disabled={loading}
                  className="flex-1 min-w-[150px] bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <i className="fas fa-magic"></i> Generate Question
                </button>
                <button 
                  onClick={evaluateAnswer}
                  disabled={loading || !answer.trim()}
                  className="flex-1 min-w-[150px] bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <i className="fas fa-paper-plane"></i> Submit & AI Evaluate
                </button>
              </div>
            </div>
          </div>

          {feedback && (
            <div className="bg-[#111827] border border-orange-500/30 rounded-2xl p-6 animate-in slide-in-from-bottom-4">
              <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-robot"></i> AI Assessment
              </h3>
              <div className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">
                {feedback}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6">Progress</h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase font-bold">
                <span>Progress</span>
                <span>{state.questionsAnswered}/{state.totalQuestions}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${(state.questionsAnswered/state.totalQuestions)*100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center p-6 bg-black/20 rounded-xl border border-white/5">
              <span className="text-xs text-gray-500 uppercase block mb-1">Current Skill Score</span>
              <div className="text-5xl font-black text-blue-400">{state.score}</div>
              <span className="text-xs text-gray-500 block mt-1">Global Percentile: Top 15%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-lightbulb text-yellow-400"></i>
              Interview Pro Tips
            </h3>
            <ul className="text-sm text-gray-400 space-y-3">
              <li className="flex gap-2">
                <i className="fas fa-check text-green-500 mt-1"></i>
                Be specific with Python libraries like NumPy/Pandas.
              </li>
              <li className="flex gap-2">
                <i className="fas fa-check text-green-500 mt-1"></i>
                Mention Big-O complexity for algorithm questions.
              </li>
              <li className="flex gap-2">
                <i className="fas fa-check text-green-500 mt-1"></i>
                For SQL, explain your logic step-by-step.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPanel;

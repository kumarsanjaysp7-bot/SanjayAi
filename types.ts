
export interface Chapter {
  title: string;
  topics: string[];
  theory: string;
  codeExample: string;
  realWorldExample: string;
  interviewQuestions: string[];
}

export interface Skill {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  topics: string[];
  chapters: Chapter[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface InterviewState {
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  currentQuestion: string | null;
  history: { question: string; answer: string; feedback: string }[];
}

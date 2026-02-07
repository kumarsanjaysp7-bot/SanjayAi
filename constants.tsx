
import { Skill } from './types';

export const SKILLS_DATABASE: Skill[] = [
  {
    id: 'python',
    title: 'Python',
    icon: 'fab fa-python',
    color: '#3776AB',
    description: 'Complete Python programming for data science with advanced concepts and libraries.',
    topics: ['Basics', 'OOP', 'Data Structs', 'Advanced'],
    chapters: [
      {
        title: "Python Basics & Data Structures",
        topics: ["Variables", "Lists", "Tuples", "Dictionaries", "Functions"],
        theory: "Python is a high-level, interpreted language known for its simplicity. It's the core language for modern data science.",
        codeExample: "def calculate_stats(data):\n    return {\n        'mean': sum(data)/len(data),\n        'max': max(data)\n    }",
        realWorldExample: "Building automated data processing pipelines for CSV/Excel ingestion.",
        interviewQuestions: ["What's the difference between lists and tuples?", "How does Python manage memory?"]
      }
    ]
  },
  {
    id: 'sql',
    title: 'SQL',
    icon: 'fas fa-database',
    color: '#F29111',
    description: 'Database management, complex queries, and optimization techniques.',
    topics: ['Queries', 'Joins', 'Optimization', 'Windows'],
    chapters: [
      {
        title: "Window Functions",
        topics: ["RANK", "DENSE_RANK", "OVER", "PARTITION BY"],
        theory: "Window functions perform calculations across sets of rows related to the current row.",
        codeExample: "SELECT \n    emp_id, \n    salary, \n    RANK() OVER(ORDER BY salary DESC) as rank\nFROM employees;",
        realWorldExample: "Ranking sales reps by performance within each region.",
        interviewQuestions: ["Explain RANK vs DENSE_RANK.", "When should you use a CTE?"]
      }
    ]
  },
  {
    id: 'ml',
    title: 'Machine Learning',
    icon: 'fas fa-brain',
    color: '#FF6B6B',
    description: 'Algorithms, training, evaluation, and real-world deployment.',
    topics: ['Supervised', 'Unsupervised', 'Deep Learning', 'NLP'],
    chapters: [
      {
        title: "Random Forests",
        topics: ["Ensemble", "Bagging", "Feature Importance"],
        theory: "Random Forest is an ensemble learning method that builds multiple decision trees.",
        codeExample: "from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)",
        realWorldExample: "Predicting bank loan defaults based on credit history.",
        interviewQuestions: ["How does bagging reduce variance?", "Explain feature importance."]
      }
    ]
  },
  {
    id: 'genai',
    title: 'Generative AI',
    icon: 'fas fa-robot',
    color: '#8B5CF6',
    description: 'LLMs, prompt engineering, RAG, and practical AI applications.',
    topics: ['LLMs', 'Prompt Eng', 'Fine-tuning', 'RAG'],
    chapters: [
      {
        title: "Prompt Engineering",
        topics: ["Few-Shot", "CoT", "System Prompts"],
        theory: "Techniques for guiding LLMs to produce better, more consistent outputs.",
        codeExample: "System: You are an expert Python dev.\nUser: Review this code for security vulnerabilities.",
        realWorldExample: "Building AI customer support agents with specific personas.",
        interviewQuestions: ["What is Chain-of-Thought prompting?", "Define Zero-shot vs Few-shot."]
      }
    ]
  }
];

export const OPENROUTER_API_KEY = "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";
export const DEFAULT_MODEL = "deepseek/deepseek-r1-0528:free";


import React from 'react';

const Header: React.FC = () => {
  return (
    <nav className="sticky top-0 bg-[#0a0d14]/90 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-brain text-2xl text-blue-500"></i>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            AI Platform
          </span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#interview" className="hover:text-white transition-colors">Interview</a>
          <a href="#community" className="hover:text-white transition-colors">Community</a>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;

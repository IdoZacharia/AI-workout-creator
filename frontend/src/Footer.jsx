import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-slate-900 bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          Designed & Developed by 
          <span className="text-blue-500 font-bold ml-1">Ido Zacharia</span>
        </p>
        <div className="flex gap-4">
          {/* Add your GitHub or LinkedIn here later */}
          <span className="text-[10px] text-slate-700 uppercase font-black">© 2026 AI Workout Creator</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
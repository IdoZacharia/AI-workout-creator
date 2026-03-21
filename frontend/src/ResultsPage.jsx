import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // This "catches" the workout data we sent via the navigate state
  const workoutPlan = location.state?.workoutPlan;

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (!workoutPlan) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <h2 className="text-white text-xl font-bold mb-4">No workout plan found!</h2>
        <button 
          onClick={() => navigate('/')} 
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 transition-colors"
        >
          Go Back to Settings
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4">
      {/* 1. Navigation Header */}
      <div className="max-w-3xl mx-auto mb-12">
        <button 
          onClick={() => navigate('/')} 
          className="text-slate-500 hover:text-blue-400 flex items-center gap-2 transition-colors font-medium"
        >
          ← Change My Settings
        </button>
      </div>

      {/* 2. Main Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">
          {workoutPlan.split_name}
        </h2>
        <p className="text-blue-500 font-mono text-xs tracking-[0.4em] mt-3 uppercase">
          Personalized Training Protocol
        </p>
      </div>

      {/* 3. The Vertical Stack (The UI Logic) */}
      <div className="flex flex-col gap-12 max-w-3xl mx-auto">
        {workoutPlan.weekly_routine.map((day, index) => (
          <div 
            key={index} 
            className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl"
          >
            {/* Day Header */}
            <div className="flex items-center gap-6 mb-10 pb-6 border-b border-slate-800/50">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xl font-black w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg shadow-blue-500/20">
                {index + 1}
              </div>
              <div>
                <p className="text-blue-500 text-[10px] uppercase font-black tracking-[0.2em]">Scheduled Session</p>
                <h3 className="text-2xl font-bold text-white">{day.day_name}</h3>
              </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-10">
              {day.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {ex.name}
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700">
                        {ex.sets} SETS
                      </span>
                      <span className="bg-blue-600/10 text-blue-400 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-blue-500/20">
                        {ex.reps} REPS
                      </span>
                        <span className="bg-slate-800 text-slate-300 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700">
                        {ex.recovery_time} REST
                      </span>
                      
                    </div>
                  </div>

                  {/* Weight and Coaching Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Recommended Load</p>
                      <p className="text-xs text-emerald-400 font-semibold">
                        {ex.recommended_weight || "Adjust based on your feel"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Coach's Advice</p>
                      <p className="text-xs text-slate-400 italic leading-relaxed">
                        "{ex.coaching_tip || "Prioritize form over weight."}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;
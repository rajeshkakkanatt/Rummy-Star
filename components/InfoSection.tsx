import React from 'react';

interface InfoSectionProps {
  version: string;
  outLimit: number;
  compelPoint: number;
}

const InfoSection: React.FC<InfoSectionProps> = ({ version, outLimit, compelPoint }) => {
  return (
    <div className="p-8 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-[2.5rem] shadow-3xl border border-white/5 w-full max-w-2xl">
      <h2 className="text-4xl font-black text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-500 uppercase tracking-tighter">
        System Protocol
      </h2>

      {/* About this Program Section */}
      <div className="p-8 bg-gray-950/60 rounded-3xl shadow-inner border border-white/5 mb-8">
        <h3 className="text-2xl font-black text-teal-400 mb-6 border-b border-white/5 pb-4 text-center uppercase tracking-tighter">
          Rummy Star v2.0 Platform
        </h3>
        <p className="text-gray-400 mb-8 leading-relaxed text-center italic text-sm">
          <span className="font-black text-white">Rummy Star</span> is a professional-grade tournament orchestration tool, engineered to handle the intense mathematics of competitive Rummy with zero latency and high precision.
        </p>
        
        <h4 className="text-xs font-black text-gray-500 mb-6 flex items-center uppercase tracking-[0.3em]">
          <span className="mr-3 text-teal-500">◆</span> Core Tournament Features
        </h4>
        <ul className="space-y-6 text-gray-300">
          <li className="flex gap-4">
            <span className="text-teal-500 font-black text-lg">01</span>
            <div>
              <span className="font-black text-white block uppercase text-xs tracking-widest mb-1">Tactical Survival Metrics</span>
              Real-time calculation of "GAP to Out" and "Plays Left" using the P+C (Plays + Compel) strategy logic for professional play.
            </div>
          </li>
          <li className="flex gap-4">
            <span className="text-teal-500 font-black text-lg">02</span>
            <div>
              <span className="font-black text-white block uppercase text-xs tracking-widest mb-1">Pro WhatsApp Standings</span>
              Export monospaced, table-formatted standings directly to your tournament group with custom field selection and rank tracking.
            </div>
          </li>
          <li className="flex gap-4">
            <span className="text-teal-500 font-black text-lg">03</span>
            <div>
              <span className="font-black text-white block uppercase text-xs tracking-widest mb-1">Intelligent Logic Engine</span>
              Automated winner detection (0-score) and re-entry prohibition based on Compel Point thresholds to ensure mathematical fairness.
            </div>
          </li>
          <li className="flex gap-4">
            <span className="text-teal-500 font-black text-lg">04</span>
            <div>
              <span className="font-black text-white block uppercase text-xs tracking-widest mb-1">Session Data Resilience</span>
              Complete JSON export/import system for cross-device migration, paired with persistent local storage and manual undo capabilities.
            </div>
          </li>
          <li className="flex gap-4">
            <span className="text-teal-500 font-black text-lg">05</span>
            <div>
              <span className="font-black text-white block uppercase text-xs tracking-widest mb-1">Glassmorphic Dashboard</span>
              A modern, high-contrast UI designed for low-light environments (poker rooms/game nights) with split-view support for tablets.
            </div>
          </li>
        </ul>
      </div>

      {/* Technical Specs Section */}
      <div className="p-8 bg-gray-950/40 rounded-3xl shadow-inner border border-white/5">
        <h3 className="text-xl font-black text-gray-400 mb-6 border-b border-white/5 pb-4 text-center uppercase tracking-widest">
          Technical Manifest
        </h3>
        <ul className="text-gray-400 space-y-3 font-mono text-xs">
          <li className="flex justify-between items-center py-2 border-b border-white/[0.02]">
            <span className="font-bold text-gray-600 uppercase">Architecture:</span>
            <span className="text-teal-400 font-black uppercase">React Engine {version}</span>
          </li>
          <li className="flex justify-between items-center py-2 border-b border-white/[0.02]">
            <span className="font-bold text-gray-600 uppercase">Core Developer:</span>
            <div className="flex flex-col items-end">
              <span className="text-white font-black">Rajesh Kakkanatt</span>
              <a href="mailto:rajesh.kakkanatt@gmail.com" className="text-[9px] text-teal-600 hover:text-teal-400 transition-colors">rajesh.kakkanatt@gmail.com</a>
            </div>
          </li>
          <li className="flex justify-between items-center py-2 border-b border-white/[0.02]">
            <span className="font-bold text-gray-600 uppercase">Build Identity:</span>
            <span className="text-white font-black">{version} Production</span>
          </li>
          <li className="flex justify-between items-start py-2">
            <span className="font-bold text-gray-600 uppercase">Ruleset:</span>
            <span className="text-teal-500 font-black text-right uppercase">LIMIT:{outLimit} | COMPEL:{compelPoint}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default InfoSection;
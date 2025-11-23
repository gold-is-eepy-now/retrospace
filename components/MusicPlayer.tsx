import React, { useState } from 'react';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full bg-black border-2 border-gray-600 p-2 mb-4 text-xs font-mono text-green-500">
      <div className="flex justify-between items-center mb-1">
        <span>WinAmp v2.8</span>
        <button className="text-[10px] text-gray-400 hover:text-white">X</button>
      </div>
      <div className="bg-[#222] border border-gray-700 p-1 mb-2 text-center overflow-hidden">
        <div className={isPlaying ? "animate-marquee" : ""}>
          {isPlaying ? "Panic! At The Disco - I Write Sins Not Tragedies (3:07) ***" : "Ready to play..."}
        </div>
      </div>
      <div className="flex gap-1 justify-center">
        <button 
          onClick={() => setIsPlaying(false)}
          className="bg-gray-800 text-white px-2 border border-gray-600 hover:bg-gray-700 text-[10px]"
        >
          PREV
        </button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-gray-800 text-white px-2 border border-gray-600 hover:bg-gray-700 text-[10px]"
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button 
          onClick={() => setIsPlaying(false)}
          className="bg-gray-800 text-white px-2 border border-gray-600 hover:bg-gray-700 text-[10px]"
        >
          NEXT
        </button>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>128kbps</span>
        <span>Stereo</span>
      </div>
    </div>
  );
};
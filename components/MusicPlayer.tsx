import React, { useState, useEffect } from 'react';

interface MusicPlayerProps {
  url?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ url }) => {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setVideoId(null);
      return;
    }
    // Extract ID from common youtube formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      setVideoId(match[2]);
    } else {
      setVideoId(null);
    }
  }, [url]);

  return (
    <div className="w-full bg-black border-2 border-gray-600 p-2 mb-4 text-xs font-mono text-green-500 shadow-md">
      <div className="flex justify-between items-center mb-1 select-none">
        <span className="font-bold text-[#aaa]">WinAmp v2.8</span>
        <div className="flex gap-1">
            <button className="text-[10px] text-gray-400 hover:text-white px-1 border border-gray-700 bg-gray-900">-</button>
            <button className="text-[10px] text-gray-400 hover:text-white px-1 border border-gray-700 bg-gray-900">X</button>
        </div>
      </div>
      
      {/* SCREEN / VISUALIZER */}
      <div className="bg-[#222] border-2 border-inset border-gray-700 mb-2 h-[60px] relative overflow-hidden">
        {videoId ? (
           <iframe 
             width="100%" 
             height="100%" 
             src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&modestbranding=1`} 
             title="YouTube video player" 
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
             allowFullScreen
             className="absolute inset-0"
           ></iframe>
        ) : (
          <div className="p-1 text-center h-full flex items-center justify-center flex-col">
            <div className="animate-pulse text-green-400 font-bold tracking-wider">NO DISC</div>
            <div className="text-[9px] text-gray-500 mt-1">Add YouTube URL in Edit Profile</div>
          </div>
        )}
      </div>

      {/* CONTROLS (Visual only) */}
      <div className="flex justify-between items-center mb-1">
         <div className="text-[9px] text-orange-400">128kbps</div>
         <div className="text-[9px] text-orange-400">44khz</div>
      </div>
      
      <div className="flex gap-1 justify-center">
        <button className="bg-gradient-to-b from-gray-700 to-gray-900 text-gray-300 px-2 border border-gray-600 hover:text-white text-[9px] rounded-sm active:border-gray-800">PREV</button>
        <button className="bg-gradient-to-b from-gray-700 to-gray-900 text-gray-300 px-3 border border-gray-600 hover:text-white text-[9px] rounded-sm active:border-gray-800 font-bold">PLAY</button>
        <button className="bg-gradient-to-b from-gray-700 to-gray-900 text-gray-300 px-3 border border-gray-600 hover:text-white text-[9px] rounded-sm active:border-gray-800 font-bold">PAUSE</button>
        <button className="bg-gradient-to-b from-gray-700 to-gray-900 text-gray-300 px-3 border border-gray-600 hover:text-white text-[9px] rounded-sm active:border-gray-800 font-bold">STOP</button>
        <button className="bg-gradient-to-b from-gray-700 to-gray-900 text-gray-300 px-2 border border-gray-600 hover:text-white text-[9px] rounded-sm active:border-gray-800">NEXT</button>
      </div>
    </div>
  );
};
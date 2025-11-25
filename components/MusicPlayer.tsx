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
    
    let id: string | null = null;
    
    try {
        // 1. Check if it's an HTML iframe string
        if (url.includes('<iframe') && url.includes('src="')) {
            const srcMatch = url.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) {
                const srcUrl = srcMatch[1];
                // Extract ID from the src URL found in the iframe
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = srcUrl.match(regExp);
                if (match && match[2].length === 11) {
                    id = match[2];
                }
            }
        } 
        // 2. Check standard URL formats
        else {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                id = match[2];
            } else if (url.length === 11) {
                // 3. Handle raw 11-char ID
                id = url;
            }
        }
    } catch (e) {
        console.error("Error parsing YouTube URL", e);
    }

    setVideoId(id);
  }, [url]);

  return (
    <div className="w-full bg-[#222] border-2 border-gray-600 p-2 mb-4 text-xs font-mono text-green-500 shadow-md relative rounded-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-1 select-none border-b border-gray-700 pb-1">
        <span className="font-bold text-[#ddd] italic tracking-tighter">WinAmp</span>
        <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-600 border border-gray-400 text-[8px] flex items-center justify-center text-black font-bold cursor-pointer hover:bg-gray-500">_</div>
            <div className="w-3 h-3 bg-gray-600 border border-gray-400 text-[8px] flex items-center justify-center text-black font-bold cursor-pointer hover:bg-red-500">x</div>
        </div>
      </div>
      
      {/* MAIN DISPLAY AREA */}
      <div className="bg-black border-2 border-inset border-gray-600 mb-2 relative overflow-hidden group">
        {videoId ? (
           <div className="relative w-full aspect-video"> 
               {/* Aspect Ratio container ensures controls are visible */}
               <iframe 
                 src={`https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&modestbranding=1&rel=0`} 
                 title="YouTube video player" 
                 frameBorder="0" 
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
                 className="absolute inset-0 w-full h-full"
               ></iframe>
           </div>
        ) : (
          <div className="h-[60px] p-1 text-center flex items-center justify-center flex-col bg-[#111]">
             <div className="text-[10px] text-green-600 animate-pulse font-bold">INSERT TAPE</div>
             <div className="text-[8px] text-gray-600 mt-1">Paste YouTube Link or Embed Code</div>
          </div>
        )}
      </div>

      {/* BITRATE / SAMPLE RATE FAKE INDICATORS */}
      {videoId && (
        <div className="flex justify-between items-center mb-1 px-1">
           <div className="text-[9px] text-green-400">192 kbps</div>
           <div className="text-[9px] text-green-400">44 kHz</div>
           <div className="text-[9px] text-green-400 animate-pulse">STEREO</div>
        </div>
      )}
      
      {/* PLAYBACK CONTROLS (Decorative, user uses iframe controls) */}
      <div className="flex gap-1 justify-center mt-1">
        {['PREV', 'PLAY', 'PAUSE', 'STOP', 'NEXT'].map(btn => (
            <button key={btn} className="bg-gradient-to-b from-gray-300 to-gray-500 text-black px-2 py-[1px] border border-gray-600 hover:brightness-110 text-[9px] rounded-[2px] active:translate-y-[1px] font-bold min-w-[30px]">
                {btn}
            </button>
        ))}
      </div>
    </div>
  );
};
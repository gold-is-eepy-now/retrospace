import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
export const MusicPlayer = ({ url }) => {
    const [videoId, setVideoId] = useState(null);
    useEffect(() => {
        if (!url) {
            setVideoId(null);
            return;
        }
        let id = null;
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
                }
                else if (url.length === 11) {
                    // 3. Handle raw 11-char ID
                    id = url;
                }
            }
        }
        catch (e) {
            console.error("Error parsing YouTube URL", e);
        }
        setVideoId(id);
    }, [url]);
    return (_jsxs("div", { className: "w-full bg-[#222] border-2 border-gray-600 p-2 mb-4 text-xs font-mono text-green-500 shadow-md relative rounded-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-1 select-none border-b border-gray-700 pb-1", children: [_jsx("span", { className: "font-bold text-[#ddd] italic tracking-tighter", children: "WinAmp" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-3 h-3 bg-gray-600 border border-gray-400 text-[8px] flex items-center justify-center text-black font-bold cursor-pointer hover:bg-gray-500", children: "_" }), _jsx("div", { className: "w-3 h-3 bg-gray-600 border border-gray-400 text-[8px] flex items-center justify-center text-black font-bold cursor-pointer hover:bg-red-500", children: "x" })] })] }), _jsx("div", { className: "bg-black border-2 border-inset border-gray-600 mb-2 relative overflow-hidden group", children: videoId ? (_jsx("div", { className: "relative w-full aspect-video", children: _jsx("iframe", { src: `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&modestbranding=1&rel=0`, title: "YouTube video player", frameBorder: "0", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, className: "absolute inset-0 w-full h-full" }) })) : (_jsxs("div", { className: "h-[60px] p-1 text-center flex items-center justify-center flex-col bg-[#111]", children: [_jsx("div", { className: "text-[10px] text-green-600 animate-pulse font-bold", children: "INSERT TAPE" }), _jsx("div", { className: "text-[8px] text-gray-600 mt-1", children: "Paste YouTube Link or Embed Code" })] })) }), videoId && (_jsxs("div", { className: "flex justify-between items-center mb-1 px-1", children: [_jsx("div", { className: "text-[9px] text-green-400", children: "192 kbps" }), _jsx("div", { className: "text-[9px] text-green-400", children: "44 kHz" }), _jsx("div", { className: "text-[9px] text-green-400 animate-pulse", children: "STEREO" })] })), _jsx("div", { className: "flex gap-1 justify-center mt-1", children: ['PREV', 'PLAY', 'PAUSE', 'STOP', 'NEXT'].map(btn => (_jsx("button", { className: "bg-gradient-to-b from-gray-300 to-gray-500 text-black px-2 py-[1px] border border-gray-600 hover:brightness-110 text-[9px] rounded-[2px] active:translate-y-[1px] font-bold min-w-[30px]", children: btn }, btn))) })] }));
};

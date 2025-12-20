'use client';

import { useEffect, useState } from 'react';

const SARCASTIC_MESSAGES = [
    "Loading your genius... or whatever this is",
    "Pretending to work really hard right now",
    "Organizing your chaos, one pixel at a time",
    "Fetching your notes from the void",
    "Please wait while we judge your life choices",
    "Loading... because instant gratification is overrated",
    "Summoning your digital hoarding collection",
    "Waking up the hamsters that power this app",
    "Convincing the server you're worth it",
    "Loading your organized mess",
    "Retrieving your procrastination logs",
    "Gathering your scattered thoughts",
    "Please hold while we find where you left off",
    "Loading... just like your motivation",
    "Assembling your digital sticky notes",
];

export default function Loader() {
    const [message, setMessage] = useState(SARCASTIC_MESSAGES[0]);

    useEffect(() => {
        // Rotate messages every 2.5 seconds
        const interval = setInterval(() => {
            setMessage(SARCASTIC_MESSAGES[Math.floor(Math.random() * SARCASTIC_MESSAGES.length)]);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#fffef0] flex flex-col items-center justify-center z-[9999]">
            {/* Animated Note */}
            <div className="note-loader">
                <div className="line line-1"></div>
                <div className="line line-2"></div>
                <div className="line line-3"></div>
            </div>

            {/* Sarcastic Message */}
            <p className="mt-8 text-sm text-[#666] font-medium text-center px-6 max-w-md animate-fade-in">
                {message}
            </p>

            <style jsx>{`
        .note-loader {
          width: 90px;
          height: 120px;
          background: #ffd700;
          border: 2px solid #111;
          border-radius: 12px;
          padding: 14px 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .line {
          height: 5px;
          border-radius: 999px;
          background: #111;
          opacity: 0;
          animation: write 2.4s infinite;
        }

        .line-1 {
          width: 100%;
          animation-delay: 0s;
        }

        .line-2 {
          width: 78%;
          animation-delay: 0.5s;
        }

        .line-3 {
          width: 52%;
          animation-delay: 1s;
        }

        @keyframes write {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 0.6;
          }
          65% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}

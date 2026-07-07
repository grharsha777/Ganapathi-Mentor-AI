'use client';

import { useState } from 'react';

export default function CliTokenDisplay({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-sm break-all text-emerald-400 max-h-32 overflow-y-auto">
        {token}
      </div>
      
      <button 
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
      >
        {copied ? (
          <>
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Token
          </>
        )}
      </button>

      <p className="text-xs text-center text-zinc-500 mt-4">
        Do not share this token with anyone. It provides full access to your Ganapathi Mentor AI account.
      </p>
    </div>
  );
}

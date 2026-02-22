'use client';

import { useState } from 'react';

export default function ExecuteTestPage() {
    const [code, setCode] = useState('console.log("Hello Judge0 from Ganapathi-Mentor-AI!");');
    const [lang, setLang] = useState(63); // 63 = JS, 71 = Python
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleExecute = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, lang })
            });

            const data = await res.json();
            setResult(data);
        } catch (error: any) {
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto font-sans">
            <h1 className="text-3xl font-bold mb-6 text-white">Judge0 Integration Test (Auto-Poll)</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                <select
                    className="bg-gray-800 text-white border border-gray-600 rounded p-2"
                    value={lang}
                    onChange={(e) => setLang(Number(e.target.value))}
                >
                    <option value={63}>JavaScript (Node.js)</option>
                    <option value={71}>Python (3.8.1)</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Source Code</label>
                <textarea
                    className="w-full h-48 bg-gray-900 text-green-400 p-4 font-mono rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
            </div>

            <button
                onClick={handleExecute}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded transition"
            >
                {loading ? 'Executing & Polling...' : 'Execute Code'}
            </button>

            {result && (
                <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700 text-gray-200">
                    <h2 className={`text-xl font-bold mb-4 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        Status: {result.status || (result.error ? 'Error' : 'Unknown')}
                    </h2>

                    {result.error && (
                        <div className="mb-4 p-4 bg-red-900/50 rounded border border-red-700 text-red-200">
                            <span className="font-semibold block mb-1">Error:</span>
                            <pre className="whitespace-pre-wrap">{result.error}</pre>
                        </div>
                    )}

                    {result.stdout !== undefined && (
                        <div className="mb-4">
                            <span className="text-sm font-semibold text-gray-400">Standard Output (stdout):</span>
                            <pre className="mt-1 p-3 bg-gray-900 rounded font-mono text-sm min-h-[40px] whitespace-pre-wrap">{result.stdout}</pre>
                        </div>
                    )}

                    {result.stderr !== undefined && result.stderr !== '' && (
                        <div className="mb-4">
                            <span className="text-sm font-semibold text-gray-400">Standard Error (stderr):</span>
                            <pre className="mt-1 p-3 bg-red-900/20 text-red-400 rounded font-mono text-sm min-h-[40px] whitespace-pre-wrap">{result.stderr}</pre>
                        </div>
                    )}

                    <div className="flex gap-6 mt-4 text-sm text-gray-400">
                        {result.time !== undefined && (
                            <div><span className="font-semibold text-gray-300">Time:</span> {result.time}s</div>
                        )}
                        {result.memory !== undefined && (
                            <div><span className="font-semibold text-gray-300">Memory:</span> {result.memory} KB</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

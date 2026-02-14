'use client';
import { useState } from 'react';

export default function DebugPage() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/debug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input, isMaster: true })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            setResult({ error: 'Failed to run test' });
        }
        setLoading(false);
    };

    return (
        <div className="p-10 bg-zinc-900 min-h-screen text-white font-mono">
            <h1 className="text-2xl font-bold mb-6">AI Diagnostic Channel</h1>
            <div className="flex gap-4 mb-10">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded"
                    placeholder="Enter test query (e.g. 台積電, 台北天氣)"
                />
                <button
                    onClick={runTest}
                    className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-500"
                    disabled={loading}
                >
                    {loading ? 'Testing...' : 'Run Analysis'}
                </button>
            </div>

            {result && (
                <div className="space-y-6">
                    <section>
                        <h2 className="text-blue-400 border-b border-zinc-700 mb-2">1. Intent Interceptor</h2>
                        <pre className="bg-black p-4 rounded">{JSON.stringify(result.intercepted, null, 2)}</pre>
                    </section>
                    <section>
                        <h2 className="text-green-400 border-b border-zinc-700 mb-2">2. Direct Service Result</h2>
                        <pre className="bg-black p-4 rounded">{JSON.stringify(result.serviceResult, null, 2)}</pre>
                    </section>
                    <section>
                        <h2 className="text-amber-400 border-b border-zinc-700 mb-2">3. OpenAI Choice (Tool Calls)</h2>
                        <pre className="bg-black p-4 rounded">{JSON.stringify(result.openAIResponse, null, 2)}</pre>
                    </section>
                </div>
            )}
        </div>
    );
}

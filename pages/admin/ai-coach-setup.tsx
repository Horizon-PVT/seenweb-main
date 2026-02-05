// Admin page for AI Coach RAG setup
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AICoachAdmin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [results, setResults] = useState<{ step: string; result: any }[]>([]);

    const adminEmail = 'phamanhtung.jp@gmail.com';

    if (status === 'loading') {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    }

    if (!session || session.user?.email !== adminEmail) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl mb-4">⛔ Admin Only</h1>
                    <p>You need admin access to view this page.</p>
                </div>
            </div>
        );
    }

    const runStep = async (step: string, endpoint: string) => {
        setLoading(step);
        try {
            const res = await fetch(endpoint, { method: 'POST' });
            const data = await res.json();
            setResults(prev => [...prev, { step, result: data }]);
        } catch (error: any) {
            setResults(prev => [...prev, { step, result: { error: error.message } }]);
        } finally {
            setLoading(null);
        }
    };

    const runAllSteps = async () => {
        setResults([]);
        await runStep('Create Index', '/api/ai-coach/create-index');
        await runStep('Seed Knowledge', '/api/ai-coach/seed-knowledge');
    };

    return (
        <>
            <Head>
                <title>AI Coach Admin | SeenYT</title>
            </Head>
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">🧠 AI Coach RAG Admin</h1>

                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Setup Knowledge Base</h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => runStep('Create Index', '/api/ai-coach/create-index')}
                                    disabled={loading !== null}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition"
                                >
                                    {loading === 'Create Index' ? '⏳ Creating...' : '1️⃣ Create Pinecone Index'}
                                </button>
                                <span className="text-gray-400 text-sm">Tạo index trên Pinecone</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => runStep('Seed Knowledge', '/api/ai-coach/seed-knowledge')}
                                    disabled={loading !== null}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg transition"
                                >
                                    {loading === 'Seed Knowledge' ? '⏳ Seeding...' : '2️⃣ Seed Knowledge Base'}
                                </button>
                                <span className="text-gray-400 text-sm">Nạp 50 documents vào Pinecone</span>
                            </div>

                            <hr className="border-gray-700" />

                            <button
                                onClick={runAllSteps}
                                disabled={loading !== null}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition"
                            >
                                {loading ? '⏳ Running...' : '🚀 Run All Steps'}
                            </button>
                        </div>
                    </div>

                    {results.length > 0 && (
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Results</h2>
                            <div className="space-y-4">
                                {results.map((r, i) => (
                                    <div key={i} className="bg-gray-900 rounded p-4">
                                        <div className="font-semibold text-blue-400 mb-2">{r.step}</div>
                                        <pre className="text-sm text-gray-300 overflow-auto">
                                            {JSON.stringify(r.result, null, 2)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.push('/dashboard/ai-coach')}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            ← Back to AI Coach
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

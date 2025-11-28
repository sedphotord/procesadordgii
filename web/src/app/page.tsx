'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ResultCard } from '@/components/ResultCard';
import type { RncRecord } from '@/lib/dataLoader';

export default function Home() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<RncRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error('Search failed', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center space-y-4 pt-12 md:pt-20">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Consulta RNC
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                        Búsqueda rápida de contribuyentes en República Dominicana
                    </p>
                </div>

                <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar por nombre, RNC o razón social..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Buscar'}
                    </button>
                </form>

                <div className="space-y-4">
                    {searched && results.length === 0 && !loading && (
                        <div className="text-center py-12 text-zinc-500">
                            No se encontraron resultados para "{query}"
                        </div>
                    )}

                    {results.map((item) => (
                        <ResultCard key={item.rnc} data={item} />
                    ))}
                </div>
            </div>
        </main>
    );
}

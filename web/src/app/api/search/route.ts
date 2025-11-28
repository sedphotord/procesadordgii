import { search } from '@/lib/dataLoader';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    try {
        const results = await search(query, limit);
        return NextResponse.json({ total: results.length, results });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
    }
}

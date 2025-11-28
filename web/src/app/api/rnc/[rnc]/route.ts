import { findByRnc } from '@/lib/dataLoader';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ rnc: string }> }) {
    const { rnc } = await params;
    try {
        const found = await findByRnc(rnc);
        if (!found) return NextResponse.json({ error: 'RNC no encontrado' }, { status: 404 });
        return NextResponse.json(found);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Error de servidor' }, { status: 500 });
    }
}

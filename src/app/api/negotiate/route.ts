import { NextResponse } from 'next/server';
import { getNegotiationGuidance } from '@/lib/negotiator';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const result = await getNegotiationGuidance(data);
        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

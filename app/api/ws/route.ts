import { NextResponse } from 'next/server';
export const GET = () => new NextResponse('WebSocket endpoint', { status: 426 });

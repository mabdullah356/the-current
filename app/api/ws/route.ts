import { NextResponse } from 'next/server';
export const GET = () => new NextResponse('WebSocket endpoint removed - using webhooks', { status: 426 });

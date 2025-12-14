import { NextResponse } from 'next/server';

const BRIA_ENDPOINT = 'https://engine.prod.bria-api.com/v2/image/generate';
const API_KEY = process.env.NEXT_PUBLIC_BRIA_API_KEY || '8930cfebb7254cab813b493436be36b7'; // Provided by user

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Forward request to Bria
        const response = await fetch(BRIA_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api_token': API_KEY
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

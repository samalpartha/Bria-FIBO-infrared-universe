
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_BRIA_API_KEY || '8930cfebb7254cab813b493436be36b7';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status_url = searchParams.get('url');

        if (!status_url) {
            return NextResponse.json({ error: 'Missing status_url param' }, { status: 400 });
        }

        const response = await fetch(status_url, {
            headers: {
                'api_token': API_KEY
            }
        });

        if (!response.ok) {
            const error = await response.text();
            return NextResponse.json({ error }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Poll Proxy Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

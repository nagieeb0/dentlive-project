import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const apiKey = request.headers.get('x-n8n-api-key');
    if (apiKey !== process.env.N8N_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized - Invalid API Key' }, { status: 401 });
    }

    try {
        const { slug, html } = await request.json(); 

        if (!slug || !html) {
            return NextResponse.json({ error: 'Slug and HTML are required.' }, { status: 400 });
        }

        const blob = await put(`doctors/${slug}.html`, html, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });

        return NextResponse.json({ message: 'Upload successful!', url: blob.url }, { status: 200 });

    } catch (error: unknown) { // <--- التعديل هنا: غيرنا any لـ unknown
        console.error("API upload error:", error);
        // بنعمل فحص بسيط عشان نرجع رسالة أوضح لو قدرنا
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred.';
        return NextResponse.json({ error: 'Failed to process request.', details: errorMessage }, { status: 500 });
    }
}

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // --- 🔒 خطوة الأمان: اتأكد إن اللي بيكلمك هو n8n ---
    const apiKey = request.headers.get('x-n8n-api-key');
    if (apiKey !== process.env.N8N_API_KEY) {
        // لو كلمة السر غلط، منرجعش ونقوله ممنوع
        return NextResponse.json({ error: 'Unauthorized - Invalid API Key' }, { status: 401 });
    }
    // ----------------------------------------------------

    try {
        // بنقرأ البيانات اللي جاية من n8n (slug و html)
        const { slug, html } = await request.json();

        // نتأكد إن البيانات موجودة
        if (!slug || !html) {
            return NextResponse.json({ error: 'Slug and HTML are required.' }, { status: 400 });
        }

        // --- 🚀 بنرفع الملف على Vercel Blob ---
        const blob = await put(
            `doctors/${slug}.html`, // ده المسار والاسم اللي هيتخزن بيه
            html,                    // ده محتوى الـ HTML نفسه
            {
                access: 'public', // مهم عشان الناس تقدر تشوف الصفحة
                token: process.env.BLOB_READ_WRITE_TOKEN // التوكن السري بتاع Blob
            }
        );
        // -----------------------------------------

        // بنرجع رد ناجح ومعاه لينك الملف كـتأكيد
        return NextResponse.json({ message: 'Upload successful!', url: blob.url }, { status: 200 });

    } catch (error: any) { // بنمسك أي خطأ ممكن يحصل
        console.error("API upload error:", error);
        return NextResponse.json({ error: 'Failed to process request.', details: error.message }, { status: 500 });
    }
}
import { get } from '@vercel/blob'; // هنرجع نستخدم get وهنعدل دالتها
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

// --- تعديل دالة getDoctorHtml ---
async function getDoctorHtml(slug: string): Promise<string | null> {
    try {
        // بنستخدم get تاني بس بنتأكد إننا بنتعامل مع الخطأ صح
        const blobResponse = await get(`doctors/${slug}.html`, {
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        return await blobResponse.text();
    } catch (error: unknown) { // <--- التعديل هنا: unknown
        // بنفحص لو الخطأ نوعه "not_found"
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'not_found') {
            console.warn(`Blob not found for slug: ${slug}`);
        } else {
            console.error('Error fetching page from Blob:', slug, error);
        }
        return null;
    }
}
// -----------------------------------------


type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata // <--- التعديل هنا: ضفنا "_" قبل parent
): Promise<Metadata> {
    const slug = params.slug;
    const htmlContent = await getDoctorHtml(slug);

    if (!htmlContent) {
        return { title: 'Page Not Found' };
    }

    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1] : `Dr. ${slug}`;

    const descriptionMatch = htmlContent.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    const description = descriptionMatch ? descriptionMatch[1] : `Landing page for Dr. ${slug}`;

    const imageMatch = htmlContent.match(/<meta\s+property="og:image"\s+content="(.*?)"/i);
    const imageUrl = imageMatch ? imageMatch[1] : undefined;

    return {
        title: pageTitle,
        description: description,
        openGraph: {
          title: pageTitle,
          description: description,
          images: imageUrl ? [imageUrl] : [],
        },
    };
}

export default async function DoctorPage({ params }: Props) {
    const { slug } = params;
    const htmlContent = await getDoctorHtml(slug);

    if (!htmlContent) {
        notFound();
    }

    return (
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    );
}

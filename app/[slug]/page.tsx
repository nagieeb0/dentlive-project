import { notFound } from 'next/navigation';
import type { Metadata } from 'next'; // <--- السطر ده بس اللي اتغير

// -- دالة عشان تجيب الـ HTML من Vercel Blob باستخدام fetch --
async function getDoctorHtml(slug: string): Promise<string | null> {
    const storeId = process.env.BLOB_STORE_ID;
    if (!storeId) {
        console.error("BLOB_STORE_ID environment variable is not set.");
        return null;
    }
    const blobUrl = `https://${storeId}.public.blob.vercel-storage.com/doctors/${slug}.html`;
    try {
        const response = await fetch(blobUrl, { next: { revalidate: 60 } }); 
        if (!response.ok) {
            console.warn(`Failed to fetch blob for slug: ${slug}, Status: ${response.status}`);
            return null;
        }
        return await response.text();
    } catch (error: unknown) {
        console.error('Error fetching page from Blob URL:', slug, error);
        return null;
    }
}
// -----------------------------------------

// -- (اختياري بس مهم للـ SEO) دالة عشان تولد العنوان والوصف --
type Props = {
  params: { slug: string }
}

// شيلنا _parent من هنا
export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
// -------------------------------------------------------------

// -- دي الصفحة اللي بتتعرض فعلًا --
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
// ------------------------------------

import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';

// -- دالة عشان تجيب الـ HTML من Vercel Blob --
async function getDoctorHtml(slug: string): Promise<string | null> {
    // بنبني الـ URL بتاع الملف مباشرة
    // لازم تتأكد إن الـ Store ID بتاعك صح (هتلاقيه في الداش بورد بتاعت Vercel Storage)
    // أو الأفضل تجيبه من Environment Variable
    const blobUrl = `https://<YOUR_STORE_ID>.public.blob.vercel-storage.com/doctors/${slug}.html`;

    try {
        // بنستخدم fetch العادية عشان نجيب محتوى الملف
        const response = await fetch(blobUrl);

        // لو الـ Response مش OK (زي 404)، بنرجع null
        if (!response.ok) {
            console.warn(`Failed to fetch blob for slug: ${slug}, Status: ${response.status}`);
            return null;
        }

        return await response.text(); // بنرجع محتوى الـ HTML كنص
    } catch (error: any) {
        console.error('Error fetching page from Blob URL:', slug, error);
        return null;
    }
}
// -----------------------------------------

// -- (اختياري بس مهم للـ SEO) دالة عشان تولد العنوان والوصف --
type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
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
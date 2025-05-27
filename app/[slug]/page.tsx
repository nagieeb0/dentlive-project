import { notFound } from 'next/navigation';

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

// -- بنعرف النوع هنا مباشرة وبشكل أبسط --
type DoctorPageProps = {
  params: { slug: string };
};

// -- دي الصفحة اللي بتتعرض فعلًا (من غير Metadata) --
export default async function DoctorPage({ params }: DoctorPageProps) {
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

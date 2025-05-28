export async function onRequest(context) {
  // 'HTML_BUCKET' ده الاسم اللي هنربط بيه الـ R2 Bucket كمان شوية
  const R2_BUCKET = context.env.HTML_BUCKET;

  // بنجيب الـ Slug من اللينك
  let slug = context.params.path ? context.params.path.join('/') : null;

  // لو مفيش slug، بنعرض رسالة
  if (!slug) {
    return new Response("Homepage - Please specify a doctor slug in the path.", { status: 200 });
  }

  // بنجهز اسم الملف في R2
  const objectKey = `doctors/${slug}.html`;

  try {
    // بنروح نجيب الملف من R2
    const object = await R2_BUCKET.get(objectKey);

    if (object === null) {
      return new Response(`Doctor page not found for: ${slug}`, { status: 404 });
    }

    // بنجهز الـ Headers عشان نقول للمتصفح إن ده HTML
    const headers = new Headers();
    object.writeHttpMetadata(headers); // بينسخ الـ Metadata (زي Content-Type)
    headers.set('etag', object.httpEtag);
    headers.set('Content-Type', 'text/html;charset=UTF-8'); // بنتأكد إنها HTML

    // بنرجع محتوى الملف
    return new Response(object.body, { headers });

  } catch (error) {
    console.error(`Error fetching ${objectKey}:`, error);
    return new Response('An error occurred while fetching the page.', { status: 500 });
  }
}
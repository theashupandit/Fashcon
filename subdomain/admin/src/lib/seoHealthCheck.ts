// SEO Health Check scoring algorithm
// Returns a score out of 100 with individual check results

interface SEOCheckResult {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  points: number;
  maxPoints: number;
}

interface SEOHealthReport {
  score: number;
  checks: SEOCheckResult[];
}

export function calculateSEOHealth(data: {
  title: string;
  slug: string;
  metaDescription: string;
  keywords: string[];
  content: string; // HTML content
  excerpt: string;
  coverImage: string;
  focusKeyword?: string;
}): SEOHealthReport {
  const checks: SEOCheckResult[] = [];
  const focusKw = data.focusKeyword || (data.keywords.length > 0 ? data.keywords[0] : '');
  const plainContent = data.content.replace(/<[^>]*>/g, '').trim();
  const wordCount = plainContent.split(/\s+/).filter(Boolean).length;

  // 1. Title check (15 pts)
  if (!data.title) {
    checks.push({ id: 'title', label: 'Title', status: 'fail', message: 'Title is missing', points: 0, maxPoints: 15 });
  } else if (data.title.length < 20) {
    checks.push({ id: 'title', label: 'Title', status: 'warning', message: 'Title is too short (< 20 chars)', points: 7, maxPoints: 15 });
  } else if (data.title.length > 70) {
    checks.push({ id: 'title', label: 'Title', status: 'warning', message: 'Title is too long (> 70 chars)', points: 10, maxPoints: 15 });
  } else {
    checks.push({ id: 'title', label: 'Title', status: 'pass', message: 'Title length is optimal', points: 15, maxPoints: 15 });
  }

  // 2. Meta description (15 pts)
  if (!data.metaDescription) {
    checks.push({ id: 'meta', label: 'Meta Description', status: 'fail', message: 'Meta description is missing', points: 0, maxPoints: 15 });
  } else if (data.metaDescription.length < 50) {
    checks.push({ id: 'meta', label: 'Meta Description', status: 'warning', message: 'Meta description is too short (< 50 chars)', points: 7, maxPoints: 15 });
  } else if (data.metaDescription.length > 160) {
    checks.push({ id: 'meta', label: 'Meta Description', status: 'fail', message: 'Meta description exceeds 160 chars', points: 3, maxPoints: 15 });
  } else {
    checks.push({ id: 'meta', label: 'Meta Description', status: 'pass', message: 'Meta description length is optimal', points: 15, maxPoints: 15 });
  }

  // 3. Focus keyword in title (10 pts)
  if (!focusKw) {
    checks.push({ id: 'kw-title', label: 'Keyword in Title', status: 'warning', message: 'No focus keyword set', points: 0, maxPoints: 10 });
  } else if (data.title.toLowerCase().includes(focusKw.toLowerCase())) {
    checks.push({ id: 'kw-title', label: 'Keyword in Title', status: 'pass', message: `"${focusKw}" found in title`, points: 10, maxPoints: 10 });
  } else {
    checks.push({ id: 'kw-title', label: 'Keyword in Title', status: 'fail', message: `"${focusKw}" not found in title`, points: 0, maxPoints: 10 });
  }

  // 4. Focus keyword in meta (10 pts)
  if (!focusKw) {
    checks.push({ id: 'kw-meta', label: 'Keyword in Meta', status: 'warning', message: 'No focus keyword set', points: 0, maxPoints: 10 });
  } else if (data.metaDescription.toLowerCase().includes(focusKw.toLowerCase())) {
    checks.push({ id: 'kw-meta', label: 'Keyword in Meta', status: 'pass', message: `"${focusKw}" found in meta description`, points: 10, maxPoints: 10 });
  } else {
    checks.push({ id: 'kw-meta', label: 'Keyword in Meta', status: 'fail', message: `"${focusKw}" not in meta description`, points: 0, maxPoints: 10 });
  }

  // 5. Slug check (10 pts)
  if (!data.slug) {
    checks.push({ id: 'slug', label: 'Slug', status: 'fail', message: 'Slug is missing', points: 0, maxPoints: 10 });
  } else if (data.slug.length > 75) {
    checks.push({ id: 'slug', label: 'Slug', status: 'warning', message: 'Slug is too long (> 75 chars)', points: 5, maxPoints: 10 });
  } else if (focusKw && data.slug.toLowerCase().includes(focusKw.toLowerCase().replace(/\s+/g, '-'))) {
    checks.push({ id: 'slug', label: 'Slug', status: 'pass', message: 'Slug contains focus keyword', points: 10, maxPoints: 10 });
  } else {
    checks.push({ id: 'slug', label: 'Slug', status: 'pass', message: 'Slug length is acceptable', points: 7, maxPoints: 10 });
  }

  // 6. Content length (15 pts)
  if (wordCount === 0) {
    checks.push({ id: 'content', label: 'Content Length', status: 'fail', message: 'No content written', points: 0, maxPoints: 15 });
  } else if (wordCount < 300) {
    checks.push({ id: 'content', label: 'Content Length', status: 'warning', message: `Only ${wordCount} words (aim for 300+)`, points: 5, maxPoints: 15 });
  } else if (wordCount < 600) {
    checks.push({ id: 'content', label: 'Content Length', status: 'pass', message: `${wordCount} words — good`, points: 10, maxPoints: 15 });
  } else {
    checks.push({ id: 'content', label: 'Content Length', status: 'pass', message: `${wordCount} words — excellent`, points: 15, maxPoints: 15 });
  }

  // 7. Image alt text (10 pts)
  const imgTags = data.content.match(/<img[^>]*>/gi) || [];
  const imgsWithoutAlt = imgTags.filter(tag => !tag.includes('alt=') || /alt=["']\s*["']/.test(tag));
  if (imgTags.length === 0 && !data.coverImage) {
    checks.push({ id: 'img-alt', label: 'Image Alt Text', status: 'warning', message: 'No images found in content', points: 5, maxPoints: 10 });
  } else if (imgsWithoutAlt.length > 0) {
    checks.push({ id: 'img-alt', label: 'Image Alt Text', status: 'fail', message: `${imgsWithoutAlt.length} image(s) missing alt text`, points: 3, maxPoints: 10 });
  } else {
    checks.push({ id: 'img-alt', label: 'Image Alt Text', status: 'pass', message: 'All images have alt text', points: 10, maxPoints: 10 });
  }

  // 8. Heading structure (5 pts)
  const hasH2 = /<h2/i.test(data.content);
  const hasH3 = /<h3/i.test(data.content);
  if (hasH2 && hasH3) {
    checks.push({ id: 'headings', label: 'Heading Structure', status: 'pass', message: 'Good heading hierarchy (H2 + H3)', points: 5, maxPoints: 5 });
  } else if (hasH2 || hasH3) {
    checks.push({ id: 'headings', label: 'Heading Structure', status: 'warning', message: 'Consider adding more heading levels', points: 3, maxPoints: 5 });
  } else if (wordCount > 100) {
    checks.push({ id: 'headings', label: 'Heading Structure', status: 'fail', message: 'No headings found in content', points: 0, maxPoints: 5 });
  } else {
    checks.push({ id: 'headings', label: 'Heading Structure', status: 'warning', message: 'Content too short for headings', points: 3, maxPoints: 5 });
  }

  // 9. Keywords (5 pts)
  if (data.keywords.length === 0) {
    checks.push({ id: 'keywords', label: 'Tags/Keywords', status: 'fail', message: 'No keywords added', points: 0, maxPoints: 5 });
  } else if (data.keywords.length < 3) {
    checks.push({ id: 'keywords', label: 'Tags/Keywords', status: 'warning', message: `Only ${data.keywords.length} keyword(s) — aim for 3+`, points: 3, maxPoints: 5 });
  } else {
    checks.push({ id: 'keywords', label: 'Tags/Keywords', status: 'pass', message: `${data.keywords.length} keywords set`, points: 5, maxPoints: 5 });
  }

  // 10. Excerpt (5 pts)
  if (!data.excerpt) {
    checks.push({ id: 'excerpt', label: 'Excerpt', status: 'fail', message: 'Excerpt is missing', points: 0, maxPoints: 5 });
  } else if (data.excerpt.length < 30) {
    checks.push({ id: 'excerpt', label: 'Excerpt', status: 'warning', message: 'Excerpt is too short', points: 3, maxPoints: 5 });
  } else {
    checks.push({ id: 'excerpt', label: 'Excerpt', status: 'pass', message: 'Excerpt is set', points: 5, maxPoints: 5 });
  }

  const totalPoints = checks.reduce((acc, c) => acc + c.points, 0);
  const maxPoints = checks.reduce((acc, c) => acc + c.maxPoints, 0);
  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  return { score, checks };
}

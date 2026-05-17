import BlogRail from '@/components/BlogRail';

export default function BlogHighlights({ blogs }: { blogs: any[] }) {
  return <BlogRail posts={blogs} />;
}

export type PublicCategory = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  heroImage?: string;
  bannerImage?: string;
  color: string;
  type?: string;
  count?: number;
  parentCategory?: string;
};

type RawCategory = {
  _id?: string;
  name: string;
  slug: string;
  type?: string;
  count?: number;
  image?: string;
  heroImage?: string;
  bannerImage?: string;
  color?: string;
  parentCategory?: string;
};

const DEFAULT_CATEGORY_VISUALS: Record<string, { image: string; color: string }> = {
  dresses: {
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    color: '#ff2d64',
  },
  jewelry: {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
    color: '#d15e7a',
  },
  accessories: {
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
    color: '#f7c5c5',
  },
  shoes: {
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop',
    color: '#fbe4e4',
  },
  bags: {
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
    color: '#ff2d64',
  },
  beauty: {
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=1000&auto=format&fit=crop',
    color: '#d15e7a',
  },
  fashion: {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
    color: '#ff2d64',
  },
};

const DEFAULT_CATEGORY_ENTRIES: RawCategory[] = [
  { name: 'Dresses', slug: 'dresses', type: 'product' },
  { name: 'Jewelry', slug: 'jewelry', type: 'product' },
  { name: 'Accessories', slug: 'accessories', type: 'product' },
  { name: 'Shoes', slug: 'shoes', type: 'product' },
  { name: 'Bags', slug: 'bags', type: 'product' },
];

const FALLBACK_VISUALS = Object.values(DEFAULT_CATEGORY_VISUALS);

export function toPublicCategories(categories: RawCategory[] = []): PublicCategory[] {
  // If we have categories in DB, use them. Otherwise use defaults.
  let source = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORY_ENTRIES;

  if (!source || source.length === 0) return [];

  // Map categories
  return source.map((category, index) => {
    const slug = (category.slug || category.name || '').toLowerCase().trim().replace(/\s+/g, '-');
    const visuals = DEFAULT_CATEGORY_VISUALS[slug] || FALLBACK_VISUALS[index % FALLBACK_VISUALS.length];

    return {
      _id: String(category._id || category.slug || `${slug}-${index}`),
      name: category.name || 'Uncategorized',
      slug: category.slug || slug,
      image: category.bannerImage || category.heroImage || category.image || visuals.image,
      heroImage: category.heroImage,
      bannerImage: category.bannerImage,
      color: category.color || visuals.color,
      type: category.type,
      count: category.count ?? 0,
      parentCategory: category.parentCategory || '',
    };
  });
}

export function buildSearchSuggestions(input: {
  products?: Array<{ title?: string; tags?: string[]; category?: string; subCategory?: string }>;
  blogs?: Array<{ title?: string; tags?: string[]; category?: string }>;
  categories?: Array<{ name?: string }>;
  extras?: string[];
} = {}): string[] {
  const suggestions = new Set<string>();

  // Add category and subcategory names first (high priority)
  if (input.categories) {
    input.categories.forEach(cat => {
      if (cat.name) suggestions.add(cat.name);
    });
  }

  if (input.products) {
    input.products.forEach(p => {
      if (p.title) suggestions.add(p.title);
      if (p.category) suggestions.add(p.category);
      if (p.subCategory) suggestions.add(p.subCategory);
      if (p.tags) p.tags.forEach(t => suggestions.add(t));
    });
  }

  if (input.blogs) {
    input.blogs.forEach(b => {
      if (b.title) suggestions.add(b.title);
      if (b.category) suggestions.add(b.category);
      if (b.tags) b.tags.forEach(t => suggestions.add(t));
    });
  }

  if (input.extras) {
    input.extras.forEach(e => suggestions.add(e));
  }

  // Filter out very short strings and normalize
  return Array.from(suggestions)
    .filter(s => s && s.length > 2)
    .map(s => s.trim())
    .filter((s, i, self) => self.indexOf(s) === i);
}

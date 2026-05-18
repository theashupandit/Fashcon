export interface Product {
  id: string;
  title: string;
  price?: string;
  merchantName?: string;
  buttonText?: string;
  promoCode?: string;
  image: string;
  affiliateLink: string;
  category: string;
  featured?: boolean;
}

export interface Section {
  title: string;
  description: string;
  summary: string;
  image: string;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaStore?: string;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  cardInfo?: string;
  content?: string;
  image: string;
  date: string;
  category: string;
  featured?: boolean;
  sections?: Section[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  color?: string;
}

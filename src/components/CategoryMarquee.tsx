'use client';

import Link from 'next/link';
import {
  FaGem,
  FaShirt,
  FaShoePrints,
  FaHatWizard,
  FaBagShopping,
  FaStar,
  FaSprayCan,
  FaHeart,
  FaLeaf,
  FaFire,
  FaGlasses,
  FaRing,
  FaCrown,
  FaMitten,
  FaChild,
} from 'react-icons/fa6';
import { FaShoppingBag } from 'react-icons/fa';

interface CategoryMarqueeProps {
  items: string[];
  links: string[];
}

// Maps category keywords → icon component
const CATEGORY_ICON_MAP: { keywords: string[]; Icon: React.ElementType }[] = [
  { keywords: ['jewelry', 'jewel', 'jewellery'], Icon: FaGem },
  { keywords: ['dress', 'dresses', 'gown', 'kurta', 'kurti'], Icon: FaShirt },
  { keywords: ['shoes', 'shoe', 'footwear', 'heels', 'sandal', 'boots', 'sneaker'], Icon: FaShoePrints },
  { keywords: ['hat', 'cap', 'beanie', 'headwear'], Icon: FaHatWizard },
  { keywords: ['bag', 'bags', 'purse', 'handbag', 'clutch', 'tote'], Icon: FaShoppingBag },
  { keywords: ['accessories', 'accessory'], Icon: FaBagShopping },
  { keywords: ['skincare', 'skin', 'beauty', 'cosmetic', 'makeup'], Icon: FaSprayCan },
  { keywords: ['top', 'tops', 'blouse', 'shirt', 'tshirt', 't-shirt', 'men', 'women', 'outfit', 'clothing', 'wear', 'fashion'], Icon: FaShirt },
  { keywords: ['kids', 'baby', 'children', 'child'], Icon: FaChild },
  { keywords: ['sunglasses', 'glasses', 'eyewear', 'spectacles'], Icon: FaGlasses },
  { keywords: ['ring', 'rings', 'bracelet', 'bangle', 'necklace', 'earring', 'pendant'], Icon: FaRing },
  { keywords: ['gloves', 'mitten', 'mittens'], Icon: FaMitten },
  { keywords: ['premium', 'luxury', 'royal', 'queen', 'king'], Icon: FaCrown },
  { keywords: ['trending', 'trend', 'hot', 'viral'], Icon: FaFire },
  { keywords: ['sale', 'offer', 'discount'], Icon: FaHeart },
  { keywords: ['eco', 'organic', 'natural', 'sustainable'], Icon: FaLeaf },
];

function getCategoryIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const { keywords, Icon } of CATEGORY_ICON_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return Icon;
  }
  return FaStar; // fallback
}

export default function CategoryMarquee({ items, links }: CategoryMarqueeProps) {
  if (!items?.length) return null;

  return (
    <div className="relative w-full overflow-hidden bg-[var(--glass)] backdrop-blur-md py-3.5 mb-12 border-y border-[var(--foreground)]/5 shadow-[0_12px_35px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-300">
      {/* Premium Left Side Fade Out */}
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/75 to-transparent pointer-events-none z-10" />

      {/* Premium Right Side Fade Out */}
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-28 bg-gradient-to-l from-[var(--background)] via-[var(--background)]/75 to-transparent pointer-events-none z-10" />

      <div className="marquee-track flex whitespace-nowrap w-max">
        {[...Array(10)].flatMap((_, repeatIndex) => items.map((item, index) => {
          const Icon = getCategoryIcon(item);
          return (
            <Link
              key={`${item}-${repeatIndex}-${index}`}
              href={links[index] || '#'}
              className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[var(--foreground)] px-5 italic flex items-center gap-2.5 shrink-0 hover:text-[var(--primary)] transition-colors duration-200"
            >
              <Icon
                className="text-[var(--primary)] not-italic shrink-0"
                style={{ fontSize: '12px' }}
              />
              {item}
              <span className="text-[var(--primary)]/40 not-italic ml-2 text-[8px]">✦</span>
            </Link>
          );
        }))}
      </div>

      <style jsx>{`
        .marquee-track {
          display: flex;
          gap: 0;
          width: max-content;
          min-width: 100%;
          animation: marquee 8s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-10%); }
        }
      `}</style>
    </div>
  );
}

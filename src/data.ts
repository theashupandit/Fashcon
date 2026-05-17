import { Product, Post, Category } from './types';

export const categories: Category[] = [
  { id: '1', name: 'Fashion', slug: 'fashion', image: '/placeholder.png', color: '#fbe4e4' },
  { id: '2', name: 'Nails', slug: 'nails', image: '/placeholder.png', color: '#f7c5c5' },
  { id: '3', name: 'Beauty', slug: 'beauty', image: '/placeholder.png', color: '#d15e7a' },
  { id: '4', name: 'Self-Care', slug: 'self-care', image: '/placeholder.png', color: '#fbe4e4' },
  { id: '5', name: 'Holidays', slug: 'holidays', image: '/placeholder.png', color: '#ff2d64' },
  { id: '6', name: 'Food', slug: 'food', image: '/placeholder.png', color: '#fbe4e4' },
  { id: '7', name: 'Lifestyle', slug: 'lifestyle', image: '/placeholder.png', color: '#fbe4e4' },
  { id: '8', name: 'Jewelry', slug: 'jewelry', image: '/placeholder.png', color: '#fbe4e4' },
];

export const products: Product[] = [
  {
    id: 'p1',
    title: 'Floral Summer Maxi Dress',
    price: 'Starting at $45',
    merchantName: 'Myntra',
    buttonText: 'Shop on Myntra',
    promoCode: 'SUMMER10',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'dresses',
    featured: true,
  },
  {
    id: 'p2',
    title: 'Gold Layered Necklace',
    price: 'From $22',
    merchantName: 'Nordstrom',
    buttonText: 'Get the Look',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'accessories',
    featured: true,
  },
  {
    id: 'p3',
    title: 'Minimalist Ceramic Vase',
    price: 'Check site for latest price',
    merchantName: 'Boutique Home',
    buttonText: 'Shop Decor',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'home-decor',
    featured: false,
  },
  {
    id: 'p4',
    title: 'Boho Chic Straw Bag',
    price: undefined,
    merchantName: 'Zara',
    buttonText: 'Shop Zara',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'accessories',
    featured: false,
  },
  {
    id: 'p5',
    title: 'Silk Slip Nightwear',
    price: '$55',
    merchantName: 'Boutique Name',
    buttonText: 'Buy from Boutique',
    promoCode: 'NIGHT15',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'dresses',
    featured: true,
  },
  {
    id: 'p6',
    title: 'Hydrating Face Serum',
    price: 'Sale price $18',
    merchantName: 'Sephora',
    buttonText: 'Shop Skincare',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'beauty',
    featured: false,
  },
  {
    id: 'p7',
    title: 'Velvet Soft Cushion',
    price: undefined,
    merchantName: 'Wayfair',
    buttonText: 'Shop Home',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'home-decor',
    featured: false,
  },
  {
    id: 'p8',
    title: 'Elegant Pearl Earrings',
    price: 'From $25',
    merchantName: 'Etsy',
    buttonText: 'Shop Etsy',
    promoCode: 'PEARL20',
    image: '/placeholder.png',
    affiliateLink: '#',
    category: 'accessories',
    featured: true,
  },
];

export const posts: Post[] = [
  {
    id: '1',
    title: '14 Fashion Trends For 2026 You’ll Want To Try Before Everyone Else',
    excerpt: 'A polished, easy-to-shop edit of the silhouettes, colors, and details dominating this year.',
    image: '/placeholder.png',
    date: 'April 20, 2026',
    category: 'Fashion',
    featured: true,
    sections: [
      {
        title: "The Revival of Drop-Waist Silhouettes",
        description: "The high-waisted grip on the fashion industry is finally loosening. In 2026, the drop-waist is making an undeniable comeback, bringing a relaxed, elongated torso aesthetic that feels incredibly elegant. Whether it's a flowing midi skirt or a structured evening gown, the drop-waist instantly provides a languid, 1920s-meets-2020s energy.",
        summary: "Precision tailoring turns a basic look into a power move.",
        image: "/placeholder.png",
        ctaLabel: "Shop the Basics",
        ctaUrl: "#",
        ctaStore: "Nordstrom"
      },
      {
        title: "Sheer Layering as Daywear",
        description: "Transparency is no longer reserved exclusively for the evening. We are seeing sheer fabrics—organza, fine mesh, and delicate chiffon—layered over structured daywear. Think a sheer turtleneck under an oversized blazer, or a transparent skirt layered over tailored trousers.",
        summary: "Contrast smooth surfaces with architectural, tactile knits.",
        image: "/placeholder.png",
        ctaLabel: "View Texture Guide",
        ctaUrl: "#",
        ctaStore: "SSENSE"
      },
      {
        title: "Cyber-Botanicals",
        description: "Florals for spring? Actually groundbreaking this time. Instead of traditional romantic blooms, 2026 introduces 'cyber-botanicals'—floral prints that look digitally rendered, glitchy, or glowing with neon, bioluminescent hues. It’s nature viewed through the lens of artificial intelligence.",
        summary: "One bold statement piece is worth more than ten subtle ones.",
        image: "/placeholder.png",
        ctaLabel: "Shop Accessories",
        ctaUrl: "#",
        ctaStore: "Farfetch"
      },
      {
        title: "Architectural Footwear",
        description: "Say goodbye to basic block heels and standard stilettos. The most coveted shoes of the year feature architectural, sculptural heels. From curved wedges to heels shaped like geometric art pieces, your footwear is now the focal point of the outfit.",
        summary: "One bold statement piece is worth more than ten subtle ones.",
        image: "/placeholder.png",
        ctaLabel: "Find Your Fit",
        ctaUrl: "#",
        ctaStore: "Matches Fashion"
      }
    ]
  },
  {
    id: '2',
    title: 'The 9 Hottest Nail Trends 2026 Taking Over Pinterest This Year',
    excerpt: 'Pretty, wearable nail looks with enough edge to feel fresh without losing that soft-girl charm.',
    image: '/placeholder.png',
    date: 'April 18, 2026',
    category: 'Nails',
    featured: false,
    sections: [
      {
        title: "Chrome Pearl Finish",
        description: "The 'Glazed Donut' trend has evolved into something more ethereal. Chrome Pearl finishes offer a soft, iridescent glow that looks like liquid silk on your nails. It's the perfect balance between high-fashion and everyday wearability.",
        summary: "Iridescence is the new neutral for 2026.",
        image: "/placeholder.png",
        ctaLabel: "Shop Polish",
        ctaUrl: "#",
        ctaStore: "Sephora"
      },
      {
        title: "Micro-French Tips",
        description: "Standard French manicures are out; Micro-French is in. This trend involves an ultra-thin line at the very tip of the nail, often in unexpected colors like neon green, deep burgundy, or even chrome silver.",
        summary: "Less is more when it comes to the perfect tip.",
        image: "/placeholder.png",
        ctaLabel: "Get the Kit",
        ctaUrl: "#",
        ctaStore: "Ulta Beauty"
      },
      {
        title: "Cyber-Punk Metallics",
        description: "As we lean further into tech-inspired aesthetics, nails are following suit. Liquid silver, brushed bronze, and oil-slick finishes are dominating Pinterest boards. These aren't just glitters—they are smooth, mirror-like surfaces.",
        summary: "High-shine metallics bring a futuristic edge.",
        image: "/placeholder.png",
        ctaLabel: "View Palette",
        ctaUrl: "#",
        ctaStore: "Cult Beauty"
      },
      {
        title: "Bio-Glitch Textures",
        description: "3D nail art is becoming more organic. 'Bio-glitch' textures look like melting water droplets, crystalline structures, or distorted organic shapes. It’s wearable art that demands a second look.",
        summary: "Texture adds a tactile dimension to your style.",
        image: "/placeholder.png",
        ctaLabel: "Book Appointment",
        ctaUrl: "#",
        ctaStore: "Glosslab"
      }
    ]
  },
  {
    id: '3',
    title: '18 Tiny Things That Make You Look Cheap (Even If You Spent A Fortune 👀)',
    excerpt: 'Small styling mistakes can undo a great outfit. This one keeps the look polished and elevated.',
    image: '/placeholder.png',
    date: 'April 15, 2026',
    category: 'Fashion',
    featured: true,
    sections: [
      {
        title: "The Wrinkle Factor",
        description: "Nothing kills an expensive look faster than visible wrinkles. Even a designer linen shirt looks 'cheap' if it hasn't seen a steamer. Investing 5 minutes in smoothing your fabrics can double the perceived value of your outfit.",
        summary: "A steamer is the most underrated tool in your closet.",
        image: "/placeholder.png",
        ctaLabel: "Shop Steamers",
        ctaUrl: "#",
        ctaStore: "Amazon"
      },
      {
        title: "Incorrect Hem Lengths",
        description: "Trousers that bunch at the ankles or skirts that hit at the widest part of your calf disrupt the visual line. Proper tailoring ensures your clothes frame your body correctly, making them look custom-made.",
        summary: "Tailoring turns 'off-the-rack' into 'couture'.",
        image: "/placeholder.png",
        ctaLabel: "Find a Tailor",
        ctaUrl: "#",
        ctaStore: "Yelp"
      },
      {
        title: "Mismatched Hardware",
        description: "While mixing metals can be a choice, doing it accidentally often looks messy. If your bag has gold hardware, your belt is silver, and your jewelry is rose gold, the outfit loses its cohesion. Pick a dominant metal and stick to it.",
        summary: "Cohesion is the cornerstone of luxury styling.",
        image: "/placeholder.png",
        ctaLabel: "Shop Accessories",
        ctaUrl: "#",
        ctaStore: "Net-a-Porter"
      },
      {
        title: "Poorly Maintained Shoes",
        description: "You can wear a $2,000 suit, but if your shoes have scuffed toes or worn-down heels, the whole look collapses. Keep your footwear polished, repaired, and clean. It’s the foundation of your entire aesthetic.",
        summary: "The state of your shoes tells the real story.",
        image: "/placeholder.png",
        ctaLabel: "Shoe Care Kit",
        ctaUrl: "#",
        ctaStore: "Mr Porter"
      }
    ]
  },
  {
    id: '4',
    title: '10 Real-Life Tips For Glowing Summer Skin (That Actually Work)',
    excerpt: 'Summer skin doesn’t have to be oily and dull. Here are 10 practical habits for a fresh, clean, and healthy glow.',
    image: '/placeholder.png',
    date: 'April 27, 2026',
    category: 'Beauty',
    featured: true,
    sections: [
      {
        title: "Cleanse Your Face Twice a Day",
        description: "Your skin collects sweat, oil, and dust throughout the day. I always wash my face once in the morning to remove overnight oil and once at night to clear everything the day threw at my skin. A gentle face wash works best—you don’t want your skin feeling tight or dry after using it.",
        summary: "Consistency is the first step to clearing summer congestion.",
        image: "/placeholder.png",
        ctaLabel: "Shop Cleansers",
        ctaUrl: "#",
        ctaStore: "Sephora"
      },
      {
        title: "Switch to a Lightweight Moisturizer",
        description: "When your skin lacks hydration, it produces more oil to compensate. Switching to a lightweight, gel-based moisturizer makes a big difference. It hydrates your skin without making it greasy. Think of it as balance—not heavy, not dry.",
        summary: "Hydration keeps the oil at bay, even in peak heat.",
        image: "/placeholder.png",
        ctaLabel: "Shop Moisturizers",
        ctaUrl: "#",
        ctaStore: "Ulta"
      },
      {
        title: "Never Skip Sunscreen",
        description: "Even if you’re indoors, UV rays still affect your skin. Use at least SPF 30, and if you're stepping out, reapply every 2–3 hours. It might feel like extra effort, but this one habit protects your glow long-term and prevents uneven skin tone.",
        summary: "Sun protection is the most important anti-aging step you can take.",
        image: "/placeholder.png",
        ctaLabel: "Shop SPF 30+",
        ctaUrl: "#",
        ctaStore: "Cult Beauty"
      },
      {
        title: "Stay Hydrated from Within",
        description: "No skincare product can replace hydration from inside. When you stay consistent with water, coconut water, and fruits like watermelon or cucumber, the difference shows naturally. It’s the simplest tip, but also the most ignored.",
        summary: "Natural glow begins with what you put inside your body.",
        image: "/placeholder.png",
        ctaLabel: "View Wellness Guide",
        ctaUrl: "#",
        ctaStore: "Fashcon Health"
      },
      {
        title: "Keep Makeup Minimal and Breathable",
        description: "Heavy makeup melts, clogs pores, and makes your skin feel suffocated in the heat. Switching to a BB cream or a light foundation keeps the skin looking fresh without overloading it. Some days, even skipping makeup entirely feels better.",
        summary: "Let your skin breathe; elegance doesn't need layers.",
        image: "/placeholder.png",
        ctaLabel: "Shop BB Creams",
        ctaUrl: "#",
        ctaStore: "Fenty Beauty"
      },
      {
        title: "Exfoliate Smartly (Not Daily)",
        description: "Exfoliation helps remove dead skin and keeps your face smooth—but overdoing it can damage your skin barrier. Once or twice a week is enough. I usually exfoliate at night so my skin can recover while I sleep.",
        summary: "Gentle renewal beats aggressive scrubbing every time.",
        image: "/placeholder.png",
        ctaLabel: "Shop Exfoliators",
        ctaUrl: "#",
        ctaStore: "Dermstore"
      },
      {
        title: "Instant Refreshment with Face Mists",
        description: "Midday heat can make your skin feel dull and sticky. A quick spray of face mist or rose water instantly refreshes your face and gives a soft glow. It’s something small, but it makes a big difference—especially if you’re traveling.",
        summary: "A midday reset is your skin's favorite pick-me-up.",
        image: "/placeholder.png",
        ctaLabel: "Shop Face Mists",
        ctaUrl: "#",
        ctaStore: "Soko Glam"
      },
      {
        title: "Protect Your Skin Physically",
        description: "Skincare isn’t just what you apply—it’s also how you protect your skin. Whenever you step out in harsh sun, make sure to use sunglasses or a cap. It reduces direct exposure and helps prevent tanning and long-term skin damage.",
        summary: "Physical barriers are your skin's best line of defense.",
        image: "/placeholder.png",
        ctaLabel: "Shop Summer Hats",
        ctaUrl: "#",
        ctaStore: "Nordstrom"
      },
      {
        title: "Eat Skin-Friendly Foods",
        description: "Your diet shows on your skin. Oily or fried food can cause instant reactions. On the other hand, adding fruits, green vegetables, and light meals keeps your skin calm and clear. You don’t need a strict diet—just small, consistent choices.",
        summary: "Nutrient-dense meals are the ultimate skincare routine.",
        image: "/placeholder.png",
        ctaLabel: "View Recipe Edit",
        ctaUrl: "#",
        ctaStore: "Fashcon Kitchen"
      },
      {
        title: "Keep Your Skincare Routine Simple",
        description: "Adding too many layers can irritate skin already dealing with heat and sweat. I stick to the basics: Cleanser, Moisturizer, and Sunscreen. My skin looks better than when I used 6–7 products. Minimalism is the highest form of skincare sophistication.",
        summary: "Consistency over complexity always wins in the long run.",
        image: "/placeholder.png",
        ctaLabel: "Shop The Routine",
        ctaUrl: "#",
        ctaStore: "The Ordinary"
      },
      {
        title: "Final Takeaways",
        description: "Glowing summer skin isn’t about expensive products or complicated routines. It’s about understanding what your skin needs in heat. Don't forget: Wash after heavy sweating, avoid touching your face, and change pillow covers regularly.",
        summary: "At Fashcon, we believe real glow comes from balance. A few right steps, done daily, will always beat an overloaded routine.",
        image: "/placeholder.png",
        ctaLabel: "Back to Journal",
        ctaUrl: "/blog",
        ctaStore: "Fashcon Editorial"
      }
    ]
  },
  {
    id: '5',
    title: 'The Prettiest Soft Glam Makeup Looks For Everyday Confidence',
    excerpt: 'Soft glam inspiration that stays elegant in daylight and still feels special for evenings out.',
    image: '/placeholder.png',
    date: 'April 10, 2026',
    category: 'Makeup',
    featured: false,
    sections: [
      {
        title: "Cloud Skin Base",
        description: "The 'Cloud Skin' aesthetic is about achieving a finish that is matte but still luminous. It's not about hiding your skin, but about creating a soft-focus, blurred effect that looks like you're under a permanent ring light.",
        summary: "Soft-focus skin is the ultimate everyday luxury.",
        image: "/placeholder.png",
        ctaLabel: "Shop Foundation",
        ctaUrl: "#",
        ctaStore: "Fenty Beauty"
      },
      {
        title: "Sunset Blended Eyes",
        description: "Move away from harsh smokey eyes. Soft glam in 2026 utilizes warm terracotta, soft gold, and muted peach tones blended seamlessly across the lid. It enhances the eye shape without the 'heavy' makeup feel.",
        summary: "Warm tones bring life and light to your gaze.",
        image: "/placeholder.png",
        ctaLabel: "View Palettes",
        ctaUrl: "#",
        ctaStore: "Anastasia Beverly Hills"
      },
      {
        title: "Natural Feathery Brows",
        description: "The 'laminated' look has softened. Instead of perfectly stuck-down hairs, we are seeing feathery, natural brows that add structure to the face while maintaining a youthful, effortless vibe. A clear gel is your best friend here.",
        summary: "Brows should frame the face, not dominate it.",
        image: "/placeholder.png",
        ctaLabel: "Shop Brow Gel",
        ctaUrl: "#",
        ctaStore: "Glossier"
      },
      {
        title: "The Blotted Lip",
        description: "Harsh lip liners and liquid mattes are being replaced by blotted lips. This technique creates a soft-focus stain effect that looks like you've just eaten a berry. It's romantic, low-maintenance, and incredibly flattering.",
        summary: "A soft stain is more alluring than a perfect line.",
        image: "/placeholder.png",
        ctaLabel: "Shop Lip Stains",
        ctaUrl: "#",
        ctaStore: "Rare Beauty"
      }
    ]
  },
  {
    id: '6',
    title: 'How To Build A Wardrobe That Always Looks Expensive',
    excerpt: 'The kind of classic pieces and color pairings that make every outfit feel considered and chic.',
    image: '/placeholder.png',
    date: 'April 08, 2026',
    category: 'Styling',
    featured: false,
    sections: [
      {
        title: "Neutral Foundations",
        description: "Building an expensive-looking wardrobe starts with a palette of neutrals. Camel, cream, charcoal, and black are timeless because they mix and match effortlessly, creating a cohesive aesthetic that looks intentional.",
        summary: "A neutral palette is the canvas of a luxury wardrobe.",
        image: "/placeholder.png",
        ctaLabel: "Shop Essentials",
        ctaUrl: "#",
        ctaStore: "Everlane"
      },
      {
        title: "The Structured Blazer",
        description: "If you buy one thing this year, make it a high-quality structured blazer. It can elevate a simple white tee and jeans into a powerful ensemble. Look for sharp shoulders and a slightly oversized, yet tailored, fit.",
        summary: "Structure is the language of professional elegance.",
        image: "/placeholder.png",
        ctaLabel: "Shop Blazers",
        ctaUrl: "#",
        ctaStore: "Theory"
      },
      {
        title: "High-Quality Leather Goods",
        description: "Accessories are where you should invest. A high-quality leather bag or a classic belt with minimal hardware acts as an anchor for your outfit, signaling quality and attention to detail.",
        summary: "Quality over quantity, always and especially in leather.",
        image: "/placeholder.png",
        ctaLabel: "Shop Bags",
        ctaUrl: "#",
        ctaStore: "Cuyana"
      },
      {
        title: "Monochromatic Mastery",
        description: "Dressing in one color from head to toe is a classic styling trick used by the most stylish women in the world. It creates a long, lean silhouette and looks incredibly expensive, even if the pieces are from high-street brands.",
        summary: "One color, infinite sophistication.",
        image: "/placeholder.png",
        ctaLabel: "Style Guide",
        ctaUrl: "#",
        ctaStore: "Vogue"
      }
    ]
  },
];

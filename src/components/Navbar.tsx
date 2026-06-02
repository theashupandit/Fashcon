'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaSearch,
  FaBars,
  FaTimes,
  FaArrowRight,
  FaChartLine,
  FaChevronDown,
  FaHome,
  FaList,
  FaBlog,
  FaInfoCircle,
  FaEnvelope,
  FaTshirt,
  FaGem,
  FaShoppingBag,
  FaChild,
  FaMagic,
  FaTag,
  FaPen,
  FaNewspaper
} from 'react-icons/fa';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ToggleTheme } from './ToggleTheme';
import { useTheme } from './ThemeProvider';
import BackButton from './BackButton';
import { motion, AnimatePresence } from 'framer-motion';

type NavbarCategory = {
  name: string;
  slug: string;
};

interface NavbarProps {
  categories: NavbarCategory[];
  blogCategories?: NavbarCategory[];
  suggestions: string[];
}

const getCategoryIcon = (slug: string) => {
  const s = slug.toLowerCase();
  if (s.includes('dress')) return <FaTshirt className="text-pink-500" />;
  if (s.includes('jewel')) return <FaGem className="text-emerald-400" />;
  if (s.includes('accessor')) return <FaShoppingBag className="text-amber-500" />;
  if (s.includes('shoe')) return <FaShoppingBag className="text-orange-500" />;
  if (s.includes('kid')) return <FaChild className="text-cyan-500" />;
  if (s.includes('shirt')) return <FaTshirt className="text-blue-500" />;
  if (s.includes('beaut')) return <FaMagic className="text-fuchsia-500" />;
  return <FaTag className="text-rose-500" />;
};

const FALLBACK_SUGGESTIONS = [
  'Summer Trends 2026',
  'Minimalist Jewelry',
  'Boho Chic Outfits',
  'Skincare Routine',
  'Wedding Guest Dresses',
];

const MotionLink = motion(Link);

export default function Navbar({ categories, blogCategories = [], suggestions }: NavbarProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isScrolledRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchShellRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);

  const isHome = pathname === '/';

  const categoryLinks = categories.length > 0
    ? categories
    : [
      { name: 'Dresses', slug: 'dresses' },
      { name: 'Jewelry', slug: 'jewelry' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Shoes', slug: 'shoes' },
    ];

  const contentLinks = [
    { name: 'About', path: '/about', icon: <FaInfoCircle className="mr-1.5 text-amber-500" size={14} /> },
    { name: 'Contact', path: '/contact', icon: <FaEnvelope className="mr-1.5 text-rose-500" size={14} /> },
  ];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (isScrolledRef.current !== scrolled) {
        isScrolledRef.current = scrolled;
        setIsScrolled(scrolled);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchShellRef.current &&
        !searchShellRef.current.contains(event.target as Node) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(event.target as Node))
      ) {
        setIsSearchOpen(false);
        setShowSuggestions(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchOpen]);

  const submitSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  const goToCategory = (path: string) => {
    router.push(path);
  };

  const allSuggestions = Array.from(new Set([
    ...suggestions,
    ...FALLBACK_SUGGESTIONS,
  ]));

  const filteredSuggestions = searchQuery.trim() === ''
    ? allSuggestions.slice(0, 5) // Trending/Recent if empty
    : allSuggestions.filter(s =>
      s.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsSearchOpen(false);
    setIsOpen(false);
    setShowSuggestions(false);
  };

  // Adaptive text color logic
  const isTextWhite = !isScrolled && isHome;

  const navLinkClass = cn(
    "text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-[var(--primary)] whitespace-nowrap",
    isTextWhite ? 'text-white' : 'text-[var(--foreground)]'
  );
  const iconButtonClass = cn(
    'p-2 rounded-full transition-all duration-300 ease-out hover:bg-[var(--card)] hover:text-[var(--primary)] hover:-translate-y-0.5',
    isTextWhite ? 'text-white' : 'text-[var(--foreground)]'
  );

  const renderCategoriesDropdown = () => {
    const trigger = (
      <div className={cn(
        "group flex items-center text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap outline-none px-1 cursor-pointer",
        isTextWhite ? 'text-white hover:text-[var(--primary)]' : 'text-[var(--foreground)] hover:text-[var(--primary)]'
      )}>
        Categories
        <FaChevronDown size={10} className="ml-1 transition-transform duration-300 ease-out" />
      </div>
    );

    if (!mounted) return trigger;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          id="nav-categories-trigger"
          suppressHydrationWarning
          className="outline-none"
        >
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={20} className="min-w-[160px] md:min-w-[180px]">
          {categoryLinks.map((cat) => (
            <DropdownMenuItem key={cat.slug} onClick={() => goToCategory(`/category/${cat.slug}`)}>
              {cat.name}
            </DropdownMenuItem>
          ))}
          <div className="border-t border-[var(--border)]/40 mt-1.5 pt-1.5">
            <DropdownMenuItem onClick={() => goToCategory('/categories')} className="font-bold text-[var(--primary)]">
              View All Collections
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderBlogDropdown = () => {
    const trigger = (
      <div className={cn(
        "group flex items-center text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap outline-none px-1 cursor-pointer",
        isTextWhite ? 'text-white hover:text-[var(--primary)]' : 'text-[var(--foreground)] hover:text-[var(--primary)]'
      )}>
        Blog
        <FaChevronDown size={10} className="ml-1 transition-transform duration-300 ease-out" />
      </div>
    );

    if (!mounted) return trigger;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          id="nav-blog-trigger"
          suppressHydrationWarning
          className="outline-none"
        >
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={20} className="min-w-[160px] md:min-w-[180px]">
          <DropdownMenuItem onClick={() => goToCategory('/blog')}>
            All Posts
          </DropdownMenuItem>
          {blogCategories.map((cat) => (
            <DropdownMenuItem key={cat.slug} onClick={() => goToCategory(`/blog?category=${cat.slug}`)}>
              {cat.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderContactDropdown = () => {
    const trigger = (
      <div className={cn(
        "group flex items-center text-[10px] xl:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap outline-none px-1 cursor-pointer",
        isTextWhite ? 'text-white hover:text-[var(--primary)]' : 'text-[var(--foreground)] hover:text-[var(--primary)]'
      )}>
        Contact
        <FaChevronDown size={10} className="ml-1 transition-transform duration-300 ease-out" />
      </div>
    );

    if (!mounted) return trigger;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          id="nav-contact-trigger"
          suppressHydrationWarning
          className="outline-none"
        >
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={20} className="min-w-[160px] md:min-w-[180px]">
          <DropdownMenuItem onClick={() => goToCategory('/contact')}>
            Contact Us
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => goToCategory('/about')}>
            About Us
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <nav className={cn(
      'select-none sticky top-0 z-[100] transition-[background-color,backdrop-filter,box-shadow] duration-300 ease-out',
      isScrolled
        ? 'bg-[var(--glass)] backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "flex justify-between items-center h-14 gap-3 sm:gap-4 lg:gap-3 relative",
          isHome ? "xl:gap-6" : "xl:gap-4 2xl:gap-6"
        )}>
          <div className={cn(
            "hidden lg:flex items-center justify-start gap-2.5 xl:gap-4 2xl:gap-5 flex-[1_1_0] min-w-0 z-20"
          )}>
            <BackButton className={cn(isTextWhite ? "text-white" : "text-[var(--foreground)]", "text-[10px] xl:text-[10.5px] 2xl:text-[11px]")} />
            {isHome && (
              <Link href="/shop" className={navLinkClass}>
                Shop Now
              </Link>
            )}
            {!isHome && (
              <Link href="/" className={navLinkClass}>
                Home
              </Link>
            )}

            {renderCategoriesDropdown()}
            {renderBlogDropdown()}
            {renderContactDropdown()}
          </div>

          <div className="lg:hidden flex-1 flex items-center justify-start gap-4">
            <BackButton className={cn(isTextWhite ? "text-white" : "text-[var(--foreground)]")} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-full transition-colors",
                isTextWhite ? "text-white hover:bg-white/10" : "text-[var(--foreground)] hover:bg-[var(--card)]"
              )}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          <MotionLink
            href="/"
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:relative lg:left-auto lg:top-auto lg:translate-x-0 lg:translate-y-0 z-10 flex-shrink-0 flex items-center justify-center lg:mx-4 xl:mx-8",
              "gap-1"
            )}
          >
            <motion.div 
              className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11"
            >
              <motion.img
                src="/favicon.png"
                alt="Fashcon Logo"
                initial={false}
                animate={{ 
                  scale: isScrolled ? 1.15 : 1,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="object-contain flex-shrink-0 h-[85%] w-[85%] will-change-transform"
                style={{
                  filter: isTextWhite
                    ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))'
                    : 'drop-shadow(0 3px 8px rgba(0,0,0,0.25))'
                }}
              />
            </motion.div>
            
            <motion.div
              className={cn(
                "font-black tracking-tighter italic flex items-center whitespace-nowrap text-[var(--primary)]"
              )}
              style={{
                textShadow: isTextWhite
                  ? '0 2px 8px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)'
                  : '0 2px 6px rgba(0, 0, 0, 0.06), 0 1px 1px rgba(0, 0, 0, 0.02)',
              }}
            >
              <motion.span 
                initial={false}
                animate={{ 
                  maxWidth: isScrolled ? 0 : "240px",
                  opacity: isScrolled ? 0 : 1,
                  paddingRight: isScrolled ? 0 : "18px",
                  marginRight: isScrolled ? 0 : "2px",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  isHome
                    ? "text-[20px] sm:text-[22px] lg:text-[20px] xl:text-[26px] 2xl:text-[28px]"
                    : "text-[20px] sm:text-[22px] lg:text-[20px] xl:text-[25px] 2xl:text-[28px]",
                  "inline-block overflow-hidden will-change-[max-width,opacity,padding]"
                )}
              >
                FASHCON
              </motion.span>
              
              <motion.span
                initial={false}
                animate={{
                  scale: isScrolled ? 1.1 : 1,
                  y: isScrolled ? 0 : 0.5,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  "font-bold lowercase tracking-normal flex-shrink-0 will-change-transform",
                  isHome
                    ? "text-[11px] sm:text-[12px] lg:text-[11px] xl:text-[13px] 2xl:text-[14px]"
                    : "text-[11px] sm:text-[12px] lg:text-[11px] xl:text-[12.5px] 2xl:text-[14px]",
                  "text-[var(--primary)]/65"
                )}
              >
                fashion
              </motion.span>
            </motion.div>
          </MotionLink>

          <div className={cn(
            "flex items-center justify-end flex-[1_1_0] min-w-0 z-20",
            isHome ? "gap-1.5 xl:gap-3" : "gap-1.5 xl:gap-2 2xl:gap-3"
          )}>
            <div
              ref={searchShellRef}
              className={cn(
                'hidden lg:flex items-center transition-all duration-300 ease-out',
                !isSearchOpen && 'overflow-hidden',
                isSearchOpen
                  ? 'rounded-full border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.08)] h-12 w-[min(100%,13rem)] sm:w-[min(100%,14.5rem)] lg:w-[min(100%,16rem)] px-1.5 relative'
                  : 'h-10 w-10 justify-center p-0 border-0 bg-transparent shadow-none'
              )}
            >
              <button
                type="button"
                onClick={() => {
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                    return;
                  }
                  searchInputRef.current?.focus();
                }}
                className={cn(
                  'flex shrink-0 items-center justify-center rounded-full leading-none transition-all duration-300',
                  isTextWhite ? 'text-white' : 'text-[var(--foreground)]',
                  isSearchOpen ? 'h-9 w-9 p-0' : 'p-2',
                  'hover:bg-[var(--card)] hover:text-[var(--primary)]'
                )}
                title="Search"
                aria-label="Search"
                aria-expanded={isSearchOpen}
              >
                <FaSearch size={17} className="block" />
              </button>

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search styles, trends, outfits..."
                className={cn(
                  'min-w-0 flex-1 bg-transparent text-[13px] font-semibold placeholder:text-current focus:outline-none transition-all duration-300',
                  isTextWhite ? 'text-white' : 'text-[var(--foreground)]',
                  isSearchOpen ? 'px-2 opacity-100' : 'w-0 px-0 opacity-0 pointer-events-none'
                )}
                value={searchQuery}
                onFocus={() => {
                  // Keep focused but don't show suggestions automatically
                }}
                onClick={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submitSearch();
                  }
                }}
                aria-label="Search query"
              />

              {/* Desktop Suggestions Dropdown */}
              {isSearchOpen && showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-[150] animate-shutter-down">
                  <div className="p-3 border-b border-[var(--border)] bg-[var(--foreground)]/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40">
                      {searchQuery.trim() === '' ? 'Trending Searches' : 'Suggestions'}
                    </p>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto py-1">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[var(--foreground)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-colors text-left group"
                        >
                          {searchQuery.trim() === '' ? (
                            <FaChartLine size={14} className="opacity-40 group-hover:opacity-100" />
                          ) : (
                            <FaSearch size={14} className="opacity-40 group-hover:opacity-100" />
                          )}
                          <span className="truncate">{s}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-[13px] text-[var(--foreground)] opacity-40">No matching trends found...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setSearchQuery('');
                  } else {
                    setIsSearchOpen(false);
                    setShowSuggestions(false);
                  }
                }}
                className={cn(
                  'shrink-0 rounded-full p-2 text-[var(--foreground)]/55 transition-all duration-300',
                  isSearchOpen ? 'opacity-100 hover:text-[var(--primary)]' : 'w-0 p-0 opacity-0 pointer-events-none'
                )}
                aria-label={searchQuery.trim() ? 'Clear search' : 'Close search'}
              >
                <FaTimes size={16} />
              </button>

              <button
                type="submit"
                onClick={handleSearch}
                className={cn(
                  'shrink-0 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] transition-all duration-300 ease-out hover:scale-105 hover:shadow-md',
                  isSearchOpen ? 'ml-1 flex h-9 w-9 items-center justify-center' : 'hidden'
                )}
                aria-label="Submit search"
              >
                <FaArrowRight size={17} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">              <Link
              href="/shop"
              className="hidden sm:flex bg-[var(--primary)] text-[var(--primary-foreground)] px-3 xl:px-6 py-2 xl:py-2.5 rounded-[12px] xl:rounded-[16px] text-[10px] xl:text-xs font-bold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md shadow-sm"
            >
              Explore
            </Link>

              <ToggleTheme className={cn(
                isTextWhite && "bg-white/10 border-white/40 text-white hover:bg-white hover:text-black"
              )} />
            </div>
          </div>

        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-[120] lg:hidden transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={cn(
          'fixed top-0 left-0 w-screen h-dvh bg-[var(--background)] z-[130] lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto overscroll-contain',
          isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        )}
      >
        {/* Subtle, Rich Luxury Color Background Gradient Layers */}
        {theme === 'dark' ? (
          /* Dark Mode Gradient Overlay */
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050505] via-[#1c081d] to-[#2d0515] pointer-events-none z-0" />
        ) : (
          /* Light Mode Gradient Overlay */
          <div className="absolute inset-0 bg-gradient-to-tr from-[#fff5f8] via-[#ffe3eb] to-[#f4e4ff] pointer-events-none z-0" />
        )}

        {/* Ambient Editorial Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_50%)] opacity-[0.08] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--primary)_0%,transparent_60%)] opacity-[0.05] pointer-events-none z-0" />

        {/* Ambient Editorial Background Doodles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          {/* Sparkle top right - Gold */}
          <svg className={cn(
            "absolute top-[18%] right-[8%] w-14 h-14 opacity-[0.25] rotate-12 animate-[pulse_4s_ease-in-out_infinite]",
            theme === 'dark' ? "text-amber-300" : "text-amber-500"
          )} viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 C50 35, 35 50, 10 50 C35 50, 50 65, 50 90 C50 65, 65 50, 90 50 C65 50, 50 35, 50 10 Z" />
          </svg>

          {/* Loopy Heart middle left - Fashcon Red */}
          <svg className={cn(
            "absolute top-[32%] left-[4%] w-10 h-10 opacity-[0.22] -rotate-[15deg] animate-[pulse_6s_ease-in-out_infinite_1s]",
            theme === 'dark' ? "text-rose-400" : "text-rose-500"
          )} viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 30 C60 10, 85 15, 85 40 C85 65, 55 80, 50 85 C45 80, 15 65, 15 40 C15 15, 40 10, 50 30 Z" />
          </svg>

          {/* Designer Leather Handbag Sketch middle right - Rose Pink */}
          <svg className={cn(
            "absolute top-[52%] right-[6%] w-16 h-16 opacity-[0.22] rotate-6 animate-[pulse_5s_ease-in-out_infinite_0.5s]",
            theme === 'dark' ? "text-[#ff4e7c]" : "text-[#e60023]"
          )} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M25 45 L75 45 C80 45, 82 48, 80 55 L75 80 C74 83, 70 85, 65 85 L35 85 C30 85, 26 83, 25 80 L20 55 C18 48, 20 45, 25 45 Z" />
            <path d="M38 45 C38 25, 62 25, 62 45" />
            <path d="M42 45 L58 45 L54 60 C54 62, 46 62, 46 60 Z" fill="currentColor" strokeWidth="0" />
          </svg>

          {/* Cat-Eye Sunglasses bottom left - Purple */}
          <svg className={cn(
            "absolute bottom-[18%] left-[8%] w-18 h-18 opacity-[0.22] -rotate-12 animate-[pulse_4s_ease-in-out_infinite_2s]",
            theme === 'dark' ? "text-purple-400" : "text-purple-500"
          )} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 45 C15 45, 20 30, 42 38 C42 38, 48 55, 30 55 C12 55, 15 45, 15 45 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M85 45 C85 45, 80 30, 58 38 C58 38, 52 55, 70 55 C88 55, 85 45, 85 45 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M42 41 Q50 36, 58 41" />
            <path d="M15 45 Q5 40, 10 30" strokeWidth="1.5" />
            <path d="M85 45 Q95 40, 90 30" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative z-10 p-6 min-h-dvh flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.png"
                alt="Fashcon Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="font-black tracking-tighter italic flex items-baseline gap-0.5 text-[var(--primary)]">
                <span className="text-2xl">FASHCON</span>
                <span className="font-bold lowercase tracking-normal text-[12px] text-[var(--primary)]/65">.store</span>
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-[var(--foreground)] hover:bg-[var(--card)] rounded-full transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="mb-6">
            <form
              ref={mobileSearchRef}
              onSubmit={handleSearch}
              className="relative flex items-center bg-[var(--card)] border border-[var(--border)] rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all"
            >
              <div className="pl-2.5 pr-1.5 text-[var(--foreground)]/50">
                <FaSearch size={15} />
              </div>
              <input
                type="text"
                placeholder="Search styles, trends..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 py-1.5"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
              />
              <button
                type="submit"
                className="bg-[var(--primary)] text-white h-8 w-8 rounded-lg transition-transform active:scale-95 flex items-center justify-center shrink-0"
              >
                <FaArrowRight size={14} />
              </button>

              {/* Mobile Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl z-[150] overflow-hidden max-h-[250px] overflow-y-auto animate-shutter-down">
                  <div className="p-2 border-b border-[var(--border)] bg-[var(--foreground)]/5 lg:hidden">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-40 pl-2">
                      {searchQuery.trim() === '' ? 'Trending' : 'Matches'}
                    </p>
                  </div>
                  {filteredSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--primary)]/5 active:bg-[var(--primary)]/10 transition-colors text-left"
                    >
                      <FaSearch size={14} className="opacity-40" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          <div className="space-y-5 flex-grow">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-lg font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2"
            >
              <span className="flex items-center justify-center w-6"><FaHome className="text-blue-500" /></span>
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 text-lg font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2"
            >
              <span className="flex items-center justify-center w-6"><FaSearch className="text-purple-500" /></span>
              Explore
            </Link>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--foreground)]/40">Categories</p>
              {categoryLinks.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-lg font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2 pl-3"
                >
                  <span className="flex items-center justify-center w-6">{getCategoryIcon(cat.slug)}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--foreground)]/40">Blog</p>
              <Link
                href="/blog"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2 pl-3"
              >
                <span className="flex items-center justify-center w-6"><FaNewspaper className="text-sky-500" /></span>
                All Posts
              </Link>
              {blogCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-lg font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2 pl-3"
                >
                  <span className="flex items-center justify-center w-6">{getCategoryIcon(cat.slug)}</span>
                  {cat.name}
                </Link>
              ))}
            </div>
            {contentLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 text-lg font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2"
              >
                <span className="flex items-center justify-center w-6">{link.icon}</span>
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-10 border-t border-[var(--border)] mt-auto">


            <p className="text-[10px] text-[var(--foreground)] uppercase tracking-[0.2em] opacity-60">© 2026 FASHCON STORES</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

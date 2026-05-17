'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ToggleTheme } from './ToggleTheme';
import BackButton from './BackButton';

type NavbarCategory = {
  name: string;
  slug: string;
};

interface NavbarProps {
  categories: NavbarCategory[];
  suggestions: string[];
}

const FALLBACK_SUGGESTIONS = [
  'Summer Trends 2026',
  'Minimalist Jewelry',
  'Boho Chic Outfits',
  'Skincare Routine',
  'Wedding Guest Dresses',
];

export default function Navbar({ categories, suggestions }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchShellRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);

  const isHome = pathname === '/';

  const categoryLinks = (categories.length > 0
    ? categories
    : [
      { name: 'Dresses', slug: 'dresses' },
      { name: 'Jewelry', slug: 'jewelry' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Shoes', slug: 'shoes' },
    ]
  ).map((category) => ({
    name: category.name,
    path: `/category/${category.slug}`,
  }));

  const contentLinks = [
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
    'text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ease-out hover:text-[var(--primary)] hover:-translate-y-0.5 whitespace-nowrap',
    isTextWhite ? 'text-white' : 'text-[var(--foreground)]'
  );
  const iconButtonClass = cn(
    'p-2 rounded-full transition-all duration-300 ease-out hover:bg-[var(--card)] hover:text-[var(--primary)] hover:-translate-y-0.5',
    isTextWhite ? 'text-white' : 'text-[var(--foreground)]'
  );

  return (
    <nav className={cn(
      'select-none sticky top-0 z-[100] transition-all duration-500',
      isScrolled
        ? 'bg-[var(--glass)] backdrop-blur-xl py-0 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]'
        : 'bg-transparent border-transparent border-b-0 p-0 top-0'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 gap-3 sm:gap-4 lg:gap-6">
          <div className="hidden lg:flex items-center justify-start gap-6 flex-[1_1_0] min-w-0">
            <BackButton className={cn(isTextWhite ? "text-white" : "text-[var(--foreground)]")} />
            <Link href="/" className={navLinkClass}>
              Home
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                openOnHover
                delay={60}
                closeDelay={120}
                className={cn(
                  "group flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ease-out hover:bg-[var(--card)] hover:text-[var(--primary)] hover:-translate-y-0.5 whitespace-nowrap outline-none data-open:bg-[var(--card)] data-open:text-[var(--primary)]",
                  isTextWhite ? 'text-white' : 'text-[var(--foreground)]'
                )}
              >
                Categories
                <ChevronDown size={14} className="transition-transform duration-300 ease-out group-data-[open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={12}
              >
                {categoryLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.name}
                    onClick={() => goToCategory(link.path)}
                  >
                    {link.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {contentLinks.map((link) => (
              <Link key={link.name} href={link.path} className={navLinkClass}>
                {link.name}
              </Link>
            ))}
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
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <Link href="/" className="relative z-10 flex-shrink-0 flex items-center justify-center">
            <span className={cn(
              "text-[22px] sm:text-2xl lg:text-3xl font-black tracking-tighter italic transition-colors duration-300",
              isTextWhite ? "text-white" : "text-[var(--primary)]"
            )}>
              FASHCON
            </span>
          </Link>

          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-[1_1_0] min-w-0">
            <div
              ref={searchShellRef}
              className={cn(
                'hidden lg:flex items-center transition-all duration-300 ease-out',
                !isSearchOpen && 'overflow-hidden',
                isSearchOpen
                  ? 'rounded-full border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.08)] h-12 w-[min(100%,18rem)] sm:w-[min(100%,20rem)] lg:w-[min(100%,22rem)] px-1.5 relative'
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
                <Search size={17} className="block" />
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-[150] animate-in fade-in slide-in-from-top-2 duration-300">
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
                            <TrendingUp size={14} className="opacity-40 group-hover:opacity-100" />
                          ) : (
                            <Search size={14} className="opacity-40 group-hover:opacity-100" />
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
                <X size={16} />
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
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">              <Link
              href="/categories"
              className="hidden sm:flex bg-[var(--primary)] text-[var(--primary-foreground)] px-4 sm:px-6 py-2.5 rounded-[16px] text-xs font-bold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md shadow-sm"
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

      {isOpen && (
        <div
          className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-[120] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-0 w-full max-w-none h-dvh bg-[var(--background)] z-[130] lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl overflow-y-auto overscroll-contain',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          !isOpen && 'invisible pointer-events-none'
        )}
      >
        <div className="p-6 min-h-dvh flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="text-2xl font-black italic text-[var(--primary)]">FASHCON</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-[var(--foreground)] hover:bg-[var(--card)] rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="mb-10">
            <form
              ref={mobileSearchRef}
              onSubmit={handleSearch}
              className="relative flex items-center bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all"
            >
              <div className="pl-3 pr-2 text-[var(--foreground)]/50">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search styles, trends..."
                className="flex-1 bg-transparent border-none outline-none text-base font-bold text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 py-2.5"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
              />
              <button
                type="submit"
                className="bg-[var(--primary)] text-white p-2.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center"
              >
                <ArrowRight size={18} />
              </button>

              {/* Mobile Suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--background)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl z-[150] overflow-hidden max-h-[250px] overflow-y-auto">
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
                      <Search size={14} className="opacity-40" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          <div className="space-y-8 flex-grow">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block text-2xl font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2"
            >
              Home
            </Link>
            <Link
              href="/categories"
              onClick={() => setIsOpen(false)}
              className="block text-2xl font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2"
            >
              Explore
            </Link>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--foreground)]/40">Categories</p>
              {categoryLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-2xl font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2 pl-3"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            {contentLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-2xl font-black italic text-[var(--foreground)] transition-all duration-300 ease-out hover:text-[var(--primary)] hover:translate-x-2"
              >
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

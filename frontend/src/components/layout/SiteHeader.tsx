import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, HelpCircle, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router';

import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import type { NavigationItem } from '@/types/navigation';
import { cn } from '@/utils/cn';

const primaryNavigation: NavigationItem[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/categories' },
  { label: 'Gifting', href: '/categories/gift-boxes' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function navLinkClass() {
  return ({ isActive }: { isActive: boolean }) =>
    cn(
      'group relative font-button text-[0.78rem] font-medium tracking-[0.04em] text-astraya-navy/80 transition-colors after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-center after:scale-x-0 after:bg-astraya-gold after:transition-transform hover:text-astraya-gold hover:after:scale-x-100',
      isActive && 'text-astraya-gold after:scale-x-100',
    );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { isAuthenticated, logout, user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const accountHref = user?.role === 'admin' ? '/admin' : '/profile';
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-astraya-border/70 bg-astraya-ivory/96 backdrop-blur-xl">
      <div className="bg-astraya-navy text-white">
        <div className="container flex h-9 items-center justify-center text-center font-button text-[0.65rem] tracking-[0.08em] sm:justify-between">
          <span className="hidden items-center gap-2 sm:inline-flex">
            <span className="h-px w-5 bg-white/35" />
            Hand-poured in India
          </span>
          <p>Complimentary shipping on orders over ₹999</p>
          <Link className="hidden items-center gap-1.5 transition hover:text-astraya-cream sm:inline-flex" to="/contact">
            <HelpCircle size={13} aria-hidden="true" />
            Get help
          </Link>
        </div>
      </div>

      <div className="container grid min-h-[78px] grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="hidden items-center gap-1 lg:flex">
          <Button asChild size="icon" variant="ghost" aria-label={isAuthenticated ? 'Open account' : 'Log in'}>
            <Link to={isAuthenticated ? accountHref : '/login'}><UserRound size={19} aria-hidden="true" /></Link>
          </Button>
          <Button asChild className="relative" size="icon" variant="ghost" aria-label="Open wishlist">
            <Link to="/wishlist">
              <Heart size={19} aria-hidden="true" />
              {wishlistCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-astraya-gold px-1 text-[0.58rem] font-bold text-white">{wishlistCount}</span>}
            </Link>
          </Button>
        </div>

        <BrandMark />

        <div className="hidden items-center justify-end gap-1 lg:flex">
          <Button
            asChild
            size="icon"
            variant="ghost"
            aria-label="Search Astraya"
          >
            <Link to="/shop">
              <Search size={19} aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            className="relative"
            size="icon"
            variant="ghost"
            aria-label="Open cart"
          >
            <Link to="/cart">
              <ShoppingBag size={19} aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-astraya-gold px-1 text-[0.58rem] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>
        </div>

        <Button
          className="justify-self-end lg:hidden"
          size="icon"
          variant="ghost"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </Button>
      </div>

      <nav className="hidden h-12 items-center justify-center gap-9 border-t border-astraya-border/55 lg:flex" aria-label="Primary navigation">
        {primaryNavigation.map((item) => (
          <NavLink key={item.href} className={navLinkClass()} to={item.href}>{item.label}</NavLink>
        ))}
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="border-t border-astraya-border bg-astraya-ivory shadow-card lg:hidden"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <nav className="container grid gap-1 py-4" aria-label="Mobile navigation">
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.href}
                  className="border-b border-astraya-border/60 px-1 py-3 font-button text-sm font-medium tracking-[0.04em] text-astraya-navy transition hover:text-astraya-gold"
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-astraya-border pt-4">
                <Button asChild variant="outline">
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                    <Heart size={17} aria-hidden="true" />
                    {wishlistCount > 0 ? `Wishlist ${wishlistCount}` : 'Wishlist'}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                    <ShoppingBag size={17} aria-hidden="true" />
                    {itemCount > 0 ? `Cart ${itemCount}` : 'Cart'}
                  </Link>
                </Button>
                {isAuthenticated ? (
                  <Button asChild variant="primary">
                    <Link to={accountHref} onClick={() => setIsMenuOpen(false)}>
                      Account
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="primary">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                )}
              </div>
              {isAuthenticated && (
                <Button
                  className="mt-2 w-full"
                  variant="outline"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                >
                  Sign out
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

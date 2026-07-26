import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router';

import { BrandMark } from '@/components/brand/BrandMark';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useWishlist } from '@/hooks/useWishlist';
import type { NavigationItem } from '@/types/navigation';
import { cn } from '@/utils/cn';

const primaryNavigation: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

function navLinkClass(isOverHero: boolean) {
  return ({ isActive }: { isActive: boolean }) =>
    cn(
      'group relative font-button text-[0.78rem] font-semibold uppercase tracking-[0.16em] transition-colors after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-astraya-gold after:transition-transform hover:after:scale-x-100',
      isOverHero ? 'text-white/86 hover:text-astraya-gold' : 'text-astraya-navy/78 hover:text-astraya-darkGold',
      isActive && 'text-astraya-gold after:scale-x-100',
    );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { isAuthenticated, logout, user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const accountHref = user?.role === 'admin' ? '/admin' : '/profile';
  const isOverHero = location.pathname === '/' && !hasScrolled;

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300',
        hasScrolled
          ? 'border-astraya-border/85 bg-astraya-ivory/88 shadow-card backdrop-blur-xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="container flex min-h-20 items-center justify-between gap-4">
        <BrandMark inverse={isOverHero} />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <NavLink key={item.href} className={navLinkClass(isOverHero)} to={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            asChild
            className={cn(isOverHero && 'text-white hover:text-astraya-gold')}
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
            className={cn('relative', isOverHero && 'text-white hover:text-astraya-gold')}
            size="icon"
            variant="ghost"
            aria-label="Open wishlist"
          >
            <Link to="/wishlist">
              <Heart size={19} aria-hidden="true" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-astraya-gold px-1 text-[0.65rem] font-bold text-astraya-ink">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </Button>
          <Button
            asChild
            className={cn('relative', isOverHero && 'text-white hover:text-astraya-gold')}
            size="icon"
            variant="ghost"
            aria-label="Open cart"
          >
            <Link to="/cart">
              <ShoppingBag size={19} aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-astraya-gold px-1 text-[0.65rem] font-bold text-astraya-ink">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button asChild variant="outline">
                <Link to={accountHref}>
                  <UserRound size={18} aria-hidden="true" />
                  Account
                </Link>
              </Button>
              <Button variant="primary" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild variant="primary">
              <Link to="/login">
                <UserRound size={18} aria-hidden="true" />
                Login
              </Link>
            </Button>
          )}
        </div>

        <Button
          className={cn('lg:hidden', isOverHero && 'text-white hover:text-astraya-gold')}
          size="icon"
          variant="ghost"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </Button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="border-t border-astraya-border bg-astraya-card/96 shadow-card backdrop-blur-xl lg:hidden"
            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <nav className="container grid gap-1 py-4" aria-label="Mobile navigation">
              {primaryNavigation.map((item) => (
                <NavLink
                  key={item.href}
                  className="rounded-md px-3 py-3 font-button text-sm font-semibold uppercase tracking-[0.12em] text-astraya-navy transition hover:bg-astraya-ivory hover:text-astraya-darkGold"
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

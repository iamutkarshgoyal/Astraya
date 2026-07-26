import { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { Link, NavLink } from 'react-router';

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

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'text-sm font-semibold text-astraya-navy/78 transition-colors hover:text-astraya-gold',
    isActive && 'text-astraya-gold',
  );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const accountHref = user?.role === 'admin' ? '/admin' : '/profile';

  return (
    <header className="sticky top-0 z-50 border-b border-astraya-navy/10 bg-white/90 backdrop-blur-xl">
      <div className="container flex min-h-20 items-center justify-between gap-4">
        <BrandMark />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {primaryNavigation.map((item) => (
            <NavLink key={item.href} className={navLinkClass} to={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild size="icon" variant="ghost" aria-label="Search Astraya">
            <Link to="/shop">
              <Search size={19} aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            className="relative"
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
            className="relative"
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
          className="lg:hidden"
          size="icon"
          variant="ghost"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-astraya-navy/10 bg-white lg:hidden">
          <nav className="container grid gap-1 py-4" aria-label="Mobile navigation">
            {primaryNavigation.map((item) => (
              <NavLink
                key={item.href}
                className="rounded-md px-3 py-3 text-sm font-semibold text-astraya-navy hover:bg-astraya-ivory"
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-astraya-navy/10 pt-4">
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
        </div>
      )}
    </header>
  );
}

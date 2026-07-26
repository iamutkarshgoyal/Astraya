import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/hooks/useAuth';
import { wishlistService } from '@/services/wishlist-service';
import type { Product } from '@/types/catalog';

const WISHLIST_STORAGE_KEY = 'astraya-wishlist';

type WishlistContextValue = {
  items: Product[];
  wishlistCount: number;
  addWishlist: (product: Product) => void;
  removeWishlist: (productId: number) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function readStoredWishlist(): Product[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Product[]>(() =>
    typeof window === 'undefined' ? [] : readStoredWishlist(),
  );

  useEffect(() => {
    if (isAuthenticated) {
      window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [isAuthenticated, items]);

  useEffect(() => {
    let isMounted = true;
    async function syncAuthenticatedWishlist() {
      if (!isAuthenticated) {
        setItems(readStoredWishlist());
        return;
      }

      const anonymousItems = readStoredWishlist();
      let nextItems = await wishlistService.getWishlist();
      for (const product of anonymousItems) {
        nextItems = await wishlistService.addItem(product.id);
      }
      window.localStorage.removeItem(WISHLIST_STORAGE_KEY);
      if (isMounted) {
        setItems(nextItems);
      }
    }

    void syncAuthenticatedWishlist().catch(() => {
      if (isMounted && !isAuthenticated) {
        setItems(readStoredWishlist());
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  function addWishlist(product: Product) {
    setItems((current) => {
      if (current.some((item) => item.id === product.id)) {
        return current;
      }
      return [product, ...current];
    });
    if (isAuthenticated) {
      void wishlistService.addItem(product.id).then(setItems).catch(() => undefined);
    }
  }

  function removeWishlist(productId: number) {
    setItems((current) => current.filter((item) => item.id !== productId));
    if (isAuthenticated) {
      void wishlistService.removeItem(productId).then(setItems).catch(() => undefined);
    }
  }

  function toggleWishlist(product: Product) {
    const shouldRemove = items.some((item) => item.id === product.id);
    setItems((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [product, ...current],
    );
    if (isAuthenticated) {
      const request = shouldRemove
        ? wishlistService.removeItem(product.id)
        : wishlistService.addItem(product.id);
      void request.then(setItems).catch(() => undefined);
    }
  }

  function isWishlisted(productId: number) {
    return items.some((item) => item.id === productId);
  }

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      wishlistCount: items.length,
      addWishlist,
      removeWishlist,
      toggleWishlist,
      isWishlisted,
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used inside WishlistProvider');
  }
  return context;
}

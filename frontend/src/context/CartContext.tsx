import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/hooks/useAuth';
import { cartService, type ApiCart } from '@/services/cart-service';
import type { CartLine } from '@/types/commerce';
import type { Product } from '@/types/catalog';
import { calculateCartSubtotal } from '@/utils/money';

const CART_STORAGE_KEY = 'astraya-cart';

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function linesFromApiCart(cart: ApiCart): CartLine[] {
  return cart.items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartLine[]>(() =>
    typeof window === 'undefined' ? [] : readStoredCart(),
  );

  useEffect(() => {
    if (isAuthenticated) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isAuthenticated, items]);

  useEffect(() => {
    let isMounted = true;
    async function syncAuthenticatedCart() {
      if (!isAuthenticated) {
        setItems(readStoredCart());
        return;
      }

      const anonymousItems = readStoredCart();
      let cart = await cartService.getCart();
      for (const item of anonymousItems) {
        cart = await cartService.addItem(item.product.id, item.quantity);
      }
      window.localStorage.removeItem(CART_STORAGE_KEY);
      if (isMounted) {
        setItems(linesFromApiCart(cart));
      }
    }

    void syncAuthenticatedCart().catch(() => {
      if (isMounted && !isAuthenticated) {
        setItems(readStoredCart());
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  function addItem(product: Product, quantity = 1) {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(product.stock_quantity, item.quantity + quantity),
                product,
              }
            : item,
        );
      }
      return [...current, { product, quantity: Math.min(product.stock_quantity, quantity) }];
    });
    if (isAuthenticated) {
      void cartService
        .addItem(product.id, quantity)
        .then((cart) => setItems(linesFromApiCart(cart)))
        .catch(() => undefined);
    }
  }

  function updateQuantity(productId: number, quantity: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.min(item.product.stock_quantity, Math.max(1, quantity)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
    if (isAuthenticated) {
      void cartService
        .updateItem(productId, Math.max(1, quantity))
        .then((cart) => setItems(linesFromApiCart(cart)))
        .catch(() => undefined);
    }
  }

  function removeItem(productId: number) {
    setItems((current) => current.filter((item) => item.product.id !== productId));
    if (isAuthenticated) {
      void cartService
        .removeItem(productId)
        .then((cart) => setItems(linesFromApiCart(cart)))
        .catch(() => undefined);
    }
  }

  function clearCart() {
    setItems([]);
    if (isAuthenticated) {
      void cartService.clearCart().catch(() => undefined);
    }
  }

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: calculateCartSubtotal(items),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used inside CartProvider');
  }
  return context;
}

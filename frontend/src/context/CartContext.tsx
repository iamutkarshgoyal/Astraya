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
import type { CandleCustomization } from '@/types/customization';
import { createCustomizationKey } from '@/utils/customization';
import { calculateCartSubtotal } from '@/utils/money';

const CART_STORAGE_KEY = 'astraya-cart';

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (
    product: Product,
    quantity?: number,
    options?: {
      customization?: CandleCustomization | null;
      previewImage?: string | null;
    },
  ) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Partial<CartLine>[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((line): line is Partial<CartLine> & Pick<CartLine, 'product' | 'quantity'> =>
        Boolean(line?.product && line.quantity),
      )
      .map((line) => {
        const variantKey =
          line.variantKey ??
          (line.customization
            ? createCustomizationKey(line.customization)
            : 'standard');
        return {
          cartItemId: line.cartItemId,
          customization: line.customization ?? null,
          lineId: line.lineId ?? `${line.product.id}:${variantKey}`,
          previewImage: line.previewImage ?? null,
          product: line.product,
          quantity: line.quantity,
          variantKey,
        };
      });
  } catch {
    return [];
  }
}

function linesFromApiCart(cart: ApiCart): CartLine[] {
  return cart.items.map((item) => ({
    cartItemId: item.id,
    customization: item.customization ?? null,
    lineId: `cart-${item.id}`,
    previewImage: item.preview_image ?? null,
    product: item.product,
    quantity: item.quantity,
    variantKey: item.variant_key ?? 'standard',
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
        cart = await cartService.addItem(
          item.product.id,
          item.quantity,
          item.customization,
          item.previewImage,
        );
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

  function addItem(
    product: Product,
    quantity = 1,
    options?: {
      customization?: CandleCustomization | null;
      previewImage?: string | null;
    },
  ) {
    const customization = options?.customization ?? null;
    const previewImage = options?.previewImage ?? null;
    const variantKey = customization
      ? createCustomizationKey(customization)
      : 'standard';
    const lineId = `${product.id}:${variantKey}`;

    setItems((current) => {
      const existing = current.find(
        (item) =>
          item.product.id === product.id && item.variantKey === variantKey,
      );
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id && item.variantKey === variantKey
            ? {
                ...item,
                quantity: Math.min(product.stock_quantity, item.quantity + quantity),
                customization,
                previewImage: previewImage || item.previewImage,
                product,
              }
            : item,
        );
      }
      return [
        ...current,
        {
          customization,
          lineId,
          previewImage,
          product,
          quantity: Math.min(product.stock_quantity, quantity),
          variantKey,
        },
      ];
    });
    if (isAuthenticated) {
      void cartService
        .addItem(product.id, quantity, customization, previewImage)
        .then((cart) => setItems(linesFromApiCart(cart)))
        .catch(() => undefined);
    }
  }

  function updateQuantity(lineId: string, quantity: number) {
    const target = items.find((item) => item.lineId === lineId);
    setItems((current) =>
      current
        .map((item) =>
          item.lineId === lineId
            ? {
                ...item,
                quantity: Math.min(item.product.stock_quantity, Math.max(1, quantity)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
    if (isAuthenticated && target?.cartItemId) {
      void cartService
        .updateLine(
          target.cartItemId,
          target.product.id,
          Math.max(1, quantity),
        )
        .then((cart) => setItems(linesFromApiCart(cart)))
        .catch(() => undefined);
    }
  }

  function removeItem(lineId: string) {
    const target = items.find((item) => item.lineId === lineId);
    setItems((current) => current.filter((item) => item.lineId !== lineId));
    if (isAuthenticated && target?.cartItemId) {
      void cartService
        .removeLine(target.cartItemId)
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

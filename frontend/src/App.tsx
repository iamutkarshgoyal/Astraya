import { RouterProvider } from 'react-router';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { appRouter } from '@/routes/app-router';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={appRouter} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

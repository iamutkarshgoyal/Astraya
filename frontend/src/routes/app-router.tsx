import { createBrowserRouter } from 'react-router';

import { AboutPage } from '@/pages/AboutPage';
import { CartPage } from '@/pages/CartPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { CategoryDetailPage } from '@/pages/CategoryDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ContactPage } from '@/pages/ContactPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ShopPage } from '@/pages/ShopPage';
import { SignupPage } from '@/pages/SignupPage';
import { StaticPage } from '@/pages/StaticPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'shop',
        element: <ShopPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'categories/:slug',
        element: <CategoryDetailPage />,
      },
      {
        path: 'products/:slug',
        element: <ProductDetailPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'wishlist',
        element: <WishlistPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'order-success/:orderNumber',
        element: <OrderSuccessPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'admin',
        element: <AdminDashboardPage />,
      },
      {
        path: 'faq',
        element: <StaticPage page="faq" />,
      },
      {
        path: 'privacy',
        element: <StaticPage page="privacy" />,
      },
      {
        path: 'terms',
        element: <StaticPage page="terms" />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

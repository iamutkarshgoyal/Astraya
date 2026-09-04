import { FormEvent, useState } from 'react';
import {
  Boxes,
  CalendarDays,
  ClipboardList,
  FolderPlus,
  Inbox,
  LayoutDashboard,
  Mail,
  MapPin,
  PackagePlus,
  Pencil,
  Trash2,
  Truck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/sections/EmptyState';
import { SmartImage } from '@/components/media/SmartImage';
import { SectionHeading } from '@/components/sections/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/admin-service';
import type { Product } from '@/types/catalog';
import { getErrorMessage } from '@/utils/errors';
import { customizationSummary } from '@/utils/customization';
import { formatPrice } from '@/utils/money';
import { slugify } from '@/utils/slug';

type AdminTab = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'messages';

const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Boxes },
  { id: 'categories', label: 'Categories', icon: FolderPlus },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'messages', label: 'Messages', icon: Inbox },
];

const orderStatuses = ['payment_pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

export function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const dashboard = useAsyncData(
    async () => {
      if (!isAuthenticated || user?.role !== 'admin') {
        return null;
      }
      const [stats, categories, products, orders, customers, contactMessages, newsletter] =
        await Promise.all([
          adminService.getStats(),
          adminService.listCategories(),
          adminService.listProducts(),
          adminService.listOrders(),
          adminService.listCustomers(),
          adminService.listContactMessages(),
          adminService.listNewsletterSubscribers(),
        ]);
      return { stats, categories, products, orders, customers, contactMessages, newsletter };
    },
    [isAuthenticated, user?.role, refreshKey],
  );

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Admin login required"
          text="Sign in with an administrator account to manage Astraya."
          action={
            <Button asChild variant="primary">
              <Link to="/login">Login</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="container py-16">
        <EmptyState
          title="Admin access only"
          text="This account cannot access the Astraya management dashboard."
          action={
            <Button asChild variant="primary">
              <Link to="/">Return home</Link>
            </Button>
          }
        />
      </div>
    );
  }

  async function runAdminAction(action: () => Promise<void>, success: string) {
    setMessage(null);
    try {
      await action();
      setRefreshKey((current) => current + 1);
      setMessage(success);
    } catch (error) {
      setMessage(getErrorMessage(error, 'Admin action failed'));
    }
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '');
    await runAdminAction(
      () =>
        adminService.createCategory({
          name,
          slug: String(form.get('slug') || slugify(name)),
          description: String(form.get('description') ?? ''),
          image_url: String(form.get('image_url') || '/images/categories/signature-collection.jpg'),
          display_order: Number(form.get('display_order') || 0),
          is_active: true,
        }).then(() => undefined),
      'Category created.',
    );
    event.currentTarget.reset();
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '');
    const slug = String(form.get('slug') || slugify(name));
    const imageUrl = String(form.get('image_url') || 'lunar-bloom-soy-candle/1.jpg');
    await runAdminAction(
      () =>
        adminService.createProduct({
          category_id: Number(form.get('category_id')),
          name,
          slug,
          sku: String(form.get('sku') || `AST-${slug.slice(0, 16).toUpperCase()}`),
          short_description: String(form.get('short_description') ?? ''),
          description: String(form.get('description') ?? ''),
          price: Number(form.get('price') || 0),
          discount_price: form.get('discount_price') ? Number(form.get('discount_price')) : null,
          stock_quantity: Number(form.get('stock_quantity') || 0),
          burn_time_minutes: form.get('burn_time_minutes')
            ? Number(form.get('burn_time_minutes'))
            : null,
          wax_type: String(form.get('wax_type') || ''),
          fragrance: String(form.get('fragrance') || ''),
          ingredients: String(form.get('ingredients') || ''),
          weight_grams: form.get('weight_grams') ? Number(form.get('weight_grams')) : null,
          dimensions: String(form.get('dimensions') || ''),
          is_featured: form.get('is_featured') === 'on',
          is_best_seller: form.get('is_best_seller') === 'on',
          is_active: true,
          images: [
            {
              image_url: imageUrl,
              alt_text: `${name} product image`,
              display_order: 0,
              is_primary: true,
            },
          ],
        }).then(() => undefined),
      'Product created.',
    );
    event.currentTarget.reset();
  }

  async function saveProductDetails(event: FormEvent<HTMLFormElement>, product: Product) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const imageUrls = String(form.get('image_urls') ?? '')
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean);
    await runAdminAction(
      () =>
        adminService.updateProduct(product.id, {
          category_id: Number(form.get('category_id')),
          name: String(form.get('name') ?? product.name),
          sku: String(form.get('sku') ?? product.sku),
          short_description: String(form.get('short_description') ?? product.short_description),
          description: String(form.get('description') ?? product.description),
          price: Number(form.get('price') ?? product.price),
          discount_price: form.get('discount_price')
            ? Number(form.get('discount_price'))
            : null,
          stock_quantity: Number(form.get('stock_quantity') ?? product.stock_quantity),
          fragrance: String(form.get('fragrance') ?? product.fragrance ?? ''),
          dimensions: String(form.get('dimensions') ?? product.dimensions ?? ''),
          is_active: form.get('is_active') === 'on',
          images: imageUrls.map((image_url, index) => ({
            image_url,
            alt_text: `${String(form.get('name') ?? product.name)} product image ${index + 1}`,
            display_order: index,
            is_primary: index === 0,
          })),
        }).then(() => undefined),
      'Product details updated.',
    );
    setEditingProductId(null);
  }

  const data = dashboard.data;

  return (
    <div className="py-10">
      <div className="container">
        <SectionHeading
          eyebrow="Admin"
          title="Astraya dashboard"
          text="Manage catalog, orders, customers, messages, and newsletter subscribers."
        />

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                className="shrink-0"
                size="sm"
                type="button"
                variant={activeTab === tab.id ? 'gold' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} aria-hidden="true" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {message && (
          <p className="mb-5 rounded-md border border-astraya-navy/10 bg-white p-3 text-sm text-astraya-text/70">
            {message}
          </p>
        )}

        {dashboard.error && (
          <EmptyState
            title="Dashboard unavailable"
            text="The admin API could not be reached or the session has expired."
          />
        )}

        {activeTab === 'overview' && data && (
          <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['Customers', data.stats.total_customers],
              ['Orders', data.stats.total_orders],
              ['Products', data.stats.total_products],
              ['Pending orders', data.stats.pending_orders],
              ['Revenue', formatPrice(data.stats.revenue)],
              ['Newsletter', data.stats.newsletter_subscribers],
            ].map(([label, value]) => (
              <article key={label} className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-astraya-gold">
                  {label}
                </p>
                <p className="mt-3 text-3xl font-bold text-astraya-navy">{value}</p>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'products' && data && (
          <section className="grid gap-8">
            <form className="grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm" onSubmit={createProduct}>
              <h2 className="flex items-center gap-2 font-serif text-3xl text-astraya-navy">
                <PackagePlus size={24} aria-hidden="true" />
                Add product
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Input name="name" placeholder="Product name" required />
                <Input name="slug" placeholder="slug-auto-if-empty" />
                <Input name="sku" placeholder="SKU" />
                <select className="h-11 rounded-md border border-astraya-navy/15 bg-white px-3 text-sm" name="category_id" required>
                  {data.categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <Input name="price" min="1" placeholder="Price" type="number" required />
                <Input name="discount_price" min="1" placeholder="Discount price" type="number" />
                <Input name="stock_quantity" min="0" placeholder="Stock" type="number" required />
                <Input name="burn_time_minutes" min="1" placeholder="Burn minutes" type="number" />
                <Input name="weight_grams" min="1" placeholder="Weight grams" type="number" />
                <Input name="wax_type" placeholder="Wax type" />
                <Input name="fragrance" placeholder="Fragrance notes" />
                <Input name="dimensions" placeholder="Dimensions" />
                <Input className="md:col-span-3" name="image_url" placeholder="product-slug/1.jpg" />
              </div>
              <Input name="short_description" placeholder="Short description" required />
              <Textarea name="description" placeholder="Full description" required />
              <Textarea name="ingredients" placeholder="Ingredients" />
              <div className="flex flex-wrap gap-4 text-sm font-semibold text-astraya-navy">
                <label className="flex items-center gap-2"><input name="is_featured" type="checkbox" /> Featured</label>
                <label className="flex items-center gap-2"><input name="is_best_seller" type="checkbox" /> Bestseller</label>
              </div>
              <Button className="w-fit" type="submit" variant="gold">Create product</Button>
            </form>

            <div className="overflow-x-auto rounded-lg border border-astraya-navy/10 bg-white shadow-sm">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-astraya-ivory text-xs uppercase tracking-[0.12em] text-astraya-navy">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Active</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((product) => (
                    <tr key={product.id} className="border-t border-astraya-navy/10">
                      <td className="p-3 font-semibold text-astraya-navy">{product.name}</td>
                      <td className="p-3">{product.category.name}</td>
                      <td className="p-3">{formatPrice(product.discount_price ?? product.price)}</td>
                      <td className="p-3">
                        <form
                          className="flex gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const form = new FormData(event.currentTarget);
                            void runAdminAction(
                              () =>
                                adminService.updateProduct(product.id, {
                                  stock_quantity: Number(form.get('stock_quantity') || 0),
                                  is_active: form.get('is_active') === 'on',
                                }).then(() => undefined),
                              'Product updated.',
                            );
                          }}
                        >
                          <Input className="w-24" defaultValue={product.stock_quantity} min="0" name="stock_quantity" type="number" />
                          <label className="flex items-center gap-1">
                            <input defaultChecked={product.is_active} name="is_active" type="checkbox" />
                          </label>
                          <Button size="sm" type="submit" variant="outline">Save</Button>
                        </form>
                      </td>
                      <td className="p-3">{product.is_active ? 'Yes' : 'No'}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            aria-label={`Edit ${product.name}`}
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() => setEditingProductId(product.id)}
                          >
                            <Pencil size={17} aria-hidden="true" />
                          </Button>
                          <Button
                            aria-label="Remove product from shop"
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() =>
                              void runAdminAction(
                                () => adminService.deleteProduct(product.id),
                                'Product removed from the storefront. Order history is retained.',
                              )
                            }
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.products
              .filter((product) => product.id === editingProductId)
              .map((product) => (
                <form
                  key={product.id}
                  className="grid gap-4 rounded-lg border border-astraya-gold/45 bg-astraya-ivory p-5 shadow-sm"
                  onSubmit={(event) => void saveProductDetails(event, product)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 font-serif text-3xl text-astraya-navy">
                      <Pencil size={22} aria-hidden="true" />
                      Edit product
                    </h2>
                    <Button size="sm" type="button" variant="outline" onClick={() => setEditingProductId(null)}>
                      Cancel
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input defaultValue={product.name} name="name" placeholder="Product name" required />
                    <Input defaultValue={product.sku} name="sku" placeholder="SKU" required />
                    <select className="h-11 rounded-md border border-astraya-navy/15 bg-white px-3 text-sm" defaultValue={product.category_id} name="category_id">
                      {data.categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <Input defaultValue={product.price} min="1" name="price" placeholder="Marked price" required type="number" />
                    <Input defaultValue={product.discount_price ?? ''} min="1" name="discount_price" placeholder="Discounted price" type="number" />
                    <Input defaultValue={product.stock_quantity} min="0" name="stock_quantity" placeholder="Boxes in stock" required type="number" />
                    <Input defaultValue={product.fragrance ?? ''} name="fragrance" placeholder="Fragrance" />
                    <Input defaultValue={product.dimensions ?? ''} name="dimensions" placeholder="Dimensions" />
                    <label className="flex items-center gap-2 text-sm font-semibold text-astraya-navy">
                      <input defaultChecked={product.is_active} name="is_active" type="checkbox" />
                      Visible on storefront
                    </label>
                  </div>
                  <Input defaultValue={product.short_description} name="short_description" placeholder="Short description" required />
                  <Textarea defaultValue={product.description} name="description" placeholder="Full description" required />
                  <label className="grid gap-2 text-sm font-semibold text-astraya-navy">
                    Product image URLs — one image per line, first image is the main product photo
                    <Textarea defaultValue={product.images.map((image) => image.image_url).join('\n')} name="image_urls" required />
                  </label>
                  <Button className="w-fit" type="submit" variant="gold">Save product changes</Button>
                </form>
              ))}
          </section>
        )}

        {activeTab === 'categories' && data && (
          <section className="grid gap-8">
            <form className="grid gap-4 rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm" onSubmit={createCategory}>
              <h2 className="font-serif text-3xl text-astraya-navy">Add category</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="name" placeholder="Category name" required />
                <Input name="slug" placeholder="slug-auto-if-empty" />
                <Input name="display_order" placeholder="Display order" type="number" />
                <Input name="image_url" placeholder="/images/categories/example.png" />
              </div>
              <Textarea name="description" placeholder="Category description" />
              <Button className="w-fit" type="submit" variant="gold">Create category</Button>
            </form>

            <div className="grid gap-4">
              {data.categories.map((category) => (
                <form
                  key={category.id}
                  className="grid gap-3 rounded-lg border border-astraya-navy/10 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_8rem_auto]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    void runAdminAction(
                      () =>
                        adminService.updateCategory(category.id, {
                          name: String(form.get('name') ?? category.name),
                          slug: String(form.get('slug') ?? category.slug),
                          display_order: Number(form.get('display_order') || 0),
                          is_active: form.get('is_active') === 'on',
                        }).then(() => undefined),
                      'Category updated.',
                    );
                  }}
                >
                  <Input defaultValue={category.name} name="name" />
                  <Input defaultValue={category.slug} name="slug" />
                  <Input defaultValue={category.display_order} name="display_order" type="number" />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input defaultChecked={category.is_active} name="is_active" type="checkbox" />
                      Active
                    </label>
                    <Button size="sm" type="submit" variant="outline">Save</Button>
                    <Button
                      aria-label="Deactivate category"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        void runAdminAction(
                          () => adminService.deleteCategory(category.id),
                          'Category deactivated.',
                        )
                      }
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'orders' && data && (
          <section className="grid gap-4">
            {data.orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl text-astraya-navy">{order.order_number}</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-astraya-text/64">
                      <CalendarDays size={15} aria-hidden="true" />
                      {new Date(order.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-astraya-navy">{formatPrice(order.grand_total)}</p>
                </div>

                <div className="mt-5 grid gap-2 text-sm text-astraya-text/72 sm:grid-cols-2">
                  <p className="font-semibold text-astraya-navy">{order.customer_name}</p>
                  <a className="hover:text-astraya-darkGold" href={`mailto:${order.email}`}>
                    {order.email}
                  </a>
                  <a className="hover:text-astraya-darkGold" href={`tel:${order.phone}`}>
                    {order.phone}
                  </a>
                  <p className="flex gap-2 sm:col-span-2">
                    <MapPin className="mt-0.5 shrink-0 text-astraya-gold" size={16} aria-hidden="true" />
                    <span>
                      {order.address}, {order.city}, {order.state} - {order.pincode}
                    </span>
                  </p>
                </div>

                <div className="mt-5 border-y border-astraya-navy/10">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 border-b border-astraya-navy/10 py-4 last:border-b-0 sm:grid-cols-[5.5rem_1fr_auto]"
                    >
                      {item.preview_image ? (
                        <div className="relative aspect-square overflow-hidden rounded-md bg-astraya-cream">
                          <SmartImage
                            alt={`${item.product_name} custom preview`}
                            src={item.preview_image}
                          />
                        </div>
                      ) : (
                        <div className="hidden sm:block" aria-hidden="true" />
                      )}
                      <div>
                        <p className="font-semibold text-astraya-navy">
                          {item.product_name}
                        </p>
                        <p className="mt-1 text-sm text-astraya-text/64">
                          Quantity {item.quantity} at {formatPrice(item.unit_price)}
                        </p>
                        {item.customization && (
                          <p className="mt-2 text-xs leading-5 text-astraya-text/66">
                            {customizationSummary(item.customization).join(' · ')}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-astraya-navy">
                        {formatPrice(item.line_total)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="text-xs leading-5 text-astraya-text/62">
                    <p>Payment: {order.payment_method} · {order.payment_status}</p>
                    <p>Owner email: {order.email_notification_status ?? 'not attempted'} · Owner WhatsApp: {order.whatsapp_notification_status ?? 'not attempted'}</p>
                    <p>Customer email: {order.customer_email_notification_status ?? 'not attempted'} · WhatsApp: {order.customer_whatsapp_notification_status ?? 'not attempted'} · SMS: {order.customer_sms_notification_status ?? 'not attempted'}</p>
                    {order.notification_error && (
                      <p className="mt-1 text-red-700">{order.notification_error}</p>
                    )}
                  </div>
                  <select
                    aria-label={`Status for ${order.order_number}`}
                    className="h-11 rounded-md border border-astraya-navy/15 bg-white px-3 text-sm"
                    defaultValue={order.status}
                    onChange={(event) =>
                      void runAdminAction(
                        () => adminService.updateOrderStatus(order.id, event.target.value).then(() => undefined),
                        'Order status updated.',
                      )
                    }
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <form
                  className="mt-5 grid gap-3 rounded-md bg-astraya-ivory p-4 md:grid-cols-[10rem_1fr_1fr_auto] md:items-end"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const carrier = String(form.get('carrier') ?? 'dtdc') as 'dtdc' | 'blue_dart' | 'other';
                    void runAdminAction(
                      () =>
                        adminService.updateOrderTracking(order.id, {
                          carrier,
                          tracking_number: String(form.get('tracking_number') ?? ''),
                          tracking_url: String(form.get('tracking_url') ?? '') || null,
                        }).then(() => undefined),
                      'Tracking saved and customer delivery notifications queued.',
                    );
                  }}
                >
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.1em] text-astraya-navy">
                    Carrier
                    <select className="h-11 rounded-md border border-astraya-navy/15 bg-white px-3 text-sm normal-case tracking-normal" defaultValue={order.tracking_carrier ?? 'dtdc'} name="carrier">
                      <option value="dtdc">DTDC</option>
                      <option value="blue_dart">Blue Dart</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.1em] text-astraya-navy">
                    Tracking number
                    <Input defaultValue={order.tracking_number ?? ''} name="tracking_number" placeholder="Enter consignment number" required />
                  </label>
                  <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.1em] text-astraya-navy">
                    Custom tracking link
                    <Input defaultValue={order.tracking_carrier === 'other' ? order.tracking_url ?? '' : ''} name="tracking_url" placeholder="Required for Other" type="url" />
                  </label>
                  <Button type="submit" variant="gold">
                    <Truck size={16} aria-hidden="true" />
                    Send tracking
                  </Button>
                  {order.tracking_url && (
                    <p className="text-xs text-astraya-text/64 md:col-span-4">
                      Active tracking: <a className="underline hover:text-astraya-darkGold" href={order.tracking_url} rel="noreferrer" target="_blank">{order.tracking_number}</a>
                    </p>
                  )}
                </form>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'customers' && data && (
          <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
              <h2 className="font-serif text-3xl text-astraya-navy">Customers</h2>
              <div className="mt-5 grid gap-3">
                {data.customers.map((customer) => (
                  <div key={customer.id} className="rounded-md border border-astraya-navy/10 p-3 text-sm">
                    <p className="font-semibold text-astraya-navy">{customer.full_name}</p>
                    <p className="text-astraya-text/64">{customer.email}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-serif text-3xl text-astraya-navy">
                <Mail size={22} aria-hidden="true" />
                Newsletter
              </h2>
              <div className="mt-5 grid gap-3">
                {data.newsletter.map((subscriber) => (
                  <p key={subscriber.id} className="rounded-md border border-astraya-navy/10 p-3 text-sm text-astraya-text/70">
                    {subscriber.email}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'messages' && data && (
          <section className="grid gap-4">
            {data.contactMessages.map((contact) => (
              <article key={contact.id} className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl text-astraya-navy">{contact.subject}</h2>
                    <p className="text-sm text-astraya-text/64">{contact.name} | {contact.email}</p>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-astraya-gold">
                    {contact.is_read ? 'Read' : 'New'}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-astraya-text/72">{contact.message}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

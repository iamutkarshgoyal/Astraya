export type ContactMessagePayload = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
};

export type ContactMessage = ContactMessagePayload & {
  id: number;
  is_read: boolean;
  created_at: string;
};

export type NewsletterPayload = {
  email: string;
};

export type NewsletterSubscriber = {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
};

export const ASTRAYA_EMAIL = 'astraya.candles@gmail.com';
export const ASTRAYA_SITE_URL = 'https://astrayacandles.com';
export const ASTRAYA_SITE_HOST = 'astrayacandles.com';
export const ASTRAYA_WHATSAPP_URL = 'https://wa.me/918958383707';
export const ASTRAYA_INSTAGRAM_HANDLE = '@astrayacandles';
export const ASTRAYA_INSTAGRAM_URL = 'https://www.instagram.com/astrayacandles';

export function buildContactWhatsAppUrl(values: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const message = `Hello Astraya,

Name: ${values.name}
Email: ${values.email}
Subject: ${values.subject}
Message: ${values.message}`;

  return `${ASTRAYA_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

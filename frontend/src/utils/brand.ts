export const ASTRAYA_EMAIL = 'astraya.candles@gmail.com';
export const ASTRAYA_WHATSAPP_URL = 'https://wa.me/918958383707';
export const ASTRAYA_INSTAGRAM_URL = 'https://www.instagram.com/astraya.candles';

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

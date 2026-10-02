import { describe, expect, it } from 'vitest';

import {
  ASTRAYA_WHATSAPP_URL,
  buildContactWhatsAppUrl,
  scentedProductTitle,
} from '@/utils/brand';

describe('brand utilities', () => {
  it('adds Scented to product titles without duplicating it', () => {
    expect(scentedProductTitle('Star T-light Candle Box')).toBe(
      'Star T-light Candle Box – Scented',
    );
    expect(scentedProductTitle('Pastel Modak Scented Candle Box')).toBe(
      'Pastel Modak Scented Candle Box',
    );
  });

  it('builds encoded WhatsApp contact messages', () => {
    const url = buildContactWhatsAppUrl({
      name: 'Utkarsh',
      email: 'utkarsh@example.com',
      subject: 'Custom gift',
      message: 'Please help me build a candle set.',
    });

    expect(url).toBe(
      `${ASTRAYA_WHATSAPP_URL}?text=${encodeURIComponent(`Hello Astraya,

Name: Utkarsh
Email: utkarsh@example.com
Subject: Custom gift
Message: Please help me build a candle set.`)}`,
    );
  });
});

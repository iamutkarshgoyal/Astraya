import { describe, expect, it } from 'vitest';

import { ASTRAYA_WHATSAPP_URL, buildContactWhatsAppUrl } from '@/utils/brand';

describe('brand utilities', () => {
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

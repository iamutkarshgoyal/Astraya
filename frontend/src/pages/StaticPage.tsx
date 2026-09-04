import { SectionHeading } from '@/components/sections/SectionHeading';

const content = {
  faq: {
    title: 'FAQ',
    text: 'Answers for candle care, delivery, gifting, and order confirmation.',
    sections: [
      [
        'How are orders confirmed?',
        'COD orders are confirmed immediately. Secure online orders are confirmed after payment verification. Order and delivery updates are sent by email, WhatsApp, and SMS when those services are available.',
      ],
      [
        'How should I burn the candle?',
        'Let the top wax pool reach the edges on the first burn and trim the wick before every use.',
      ],
      [
        'Do you support custom gifting?',
        'Yes. Contact Astraya for wedding favors, corporate edits, and curated gift boxes.',
      ],
    ],
  },
  privacy: {
    title: 'Privacy',
    text: 'Astraya keeps customer and order information in the application database.',
    sections: [
      [
        'Customer data',
        'Account, checkout, contact, and newsletter details are used to serve orders and support requests.',
      ],
      ['Authentication', 'Passwords are hashed and access is handled with token-based authentication.'],
      ['Requests', 'Customers can contact Astraya for questions about stored information.'],
    ],
  },
  terms: {
    title: 'Terms',
    text: 'Purchase and use terms for Astraya candle orders.',
    sections: [
      [
        'Product care',
        'Candles should be burned on heat-safe surfaces and never left unattended.',
      ],
      [
        'Order confirmation',
        'COD orders are confirmed at checkout. Online orders are confirmed only after secure payment verification.',
      ],
      [
        'Returns and exchanges',
        'Because Astraya items are soft and handmade, returns are not accepted. Record an unboxing video immediately after delivery. An exchange can be considered only for a clear colour difference or an incorrect product received.',
      ],
      ['Availability', 'Stock can change during studio preparation for handmade batches.'],
    ],
  },
};

type StaticPageProps = {
  page: keyof typeof content;
};

export function StaticPage({ page }: StaticPageProps) {
  const data = content[page];

  return (
    <div className="container py-12">
      <SectionHeading eyebrow="Support" title={data.title} text={data.text} />
      <div className="grid gap-4">
        {data.sections.map(([title, text]) => (
          <article
            key={title}
            className="rounded-lg border border-astraya-navy/10 bg-white p-5 shadow-sm"
          >
            <h2 className="font-serif text-2xl text-astraya-navy">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-astraya-text/70">{text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

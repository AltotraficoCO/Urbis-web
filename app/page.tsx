import Landing from '@/components/Landing';
import { faqJsonLd } from '@/lib/atos-seo';

export default function Home() {
  const faq = faqJsonLd('/');
  return (
    <>
      {faq && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faq }} />}
      <Landing />
    </>
  );
}

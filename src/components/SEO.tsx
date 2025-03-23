import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  canonicalUrl?: string;
  keywords?: string[];
}

export default function SEO({
  title = 'Look Back - Preserve Your Memories',
  description = 'Create meaningful digital time capsules, track your life\'s journey, and ensure your memories live on. With advanced analytics and customizable highlights.',
  image = 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&w=1200&h=630',
  type = 'website',
  canonicalUrl = 'https://lookbackcapsule.com',
  keywords = ['memories', 'time capsule', 'digital memories', 'life journey', 'personal history']
}: SEOProps) {
  const siteName = 'Look Back';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'website' ? 'WebSite' : 'Article',
          name: title,
          description: description,
          url: canonicalUrl,
          image: image,
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
              '@type': 'ImageObject',
              url: 'https://lookbackcapsule.com/logo.png'
            }
          }
        })}
      </script>
    </Helmet>
  );
}
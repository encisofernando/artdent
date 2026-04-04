import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  robots?: string
  type?: 'website' | 'product' | 'article'
  structuredData?: Record<string, any> | Array<Record<string, any>>
  productData?: {
    name: string
    price: number
    currency: string
    availability: 'InStock' | 'OutOfStock' | 'PreOrder'
    brand: string
    sku?: string
    image?: string
    rating?: number
    reviewCount?: number
  }
  breadcrumbs?: Array<{ name: string; url: string }>
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  robots = 'index, follow',
  type = 'website',
  structuredData: customStructuredData,
  productData,
  breadcrumbs,
}: SEOHeadProps) {
  const siteUrl = 'https://shop.artdent.com.ar'
  const defaultImage = `${siteUrl}/og-image.jpg`
  const defaultDescription =
    'ArtDent - Tu sonrisa, es nuestra prioridad. Productos dentales de alta calidad para profesionales.'

  const fullTitle = title
    ? `${title} | ArtDent`
    : 'ArtDent - Productos Dentales Profesionales'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const fullImage = image || defaultImage
  const fullDescription = description || defaultDescription

  // Generate JSON-LD structured data
  const baseStructuredData: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : 'WebSite',
    name: fullTitle,
    description: fullDescription,
    url: fullUrl,
    image: fullImage,
  }

  // Product specific data
  if (type === 'product' && productData) {
    baseStructuredData['@type'] = 'Product'
    baseStructuredData.name = productData.name
    baseStructuredData.brand = {
      '@type': 'Brand',
      name: productData.brand,
    }
    baseStructuredData.offers = {
      '@type': 'Offer',
      price: productData.price,
      priceCurrency: productData.currency,
      availability: `https://schema.org/${productData.availability}`,
      url: fullUrl,
    }
    
    if (productData.sku) {
      baseStructuredData.sku = productData.sku
    }
    
    if (productData.image) {
      baseStructuredData.image = productData.image
    }

    if (productData.rating && productData.reviewCount) {
      baseStructuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: productData.rating,
        reviewCount: productData.reviewCount,
      }
    }
  }

  // Breadcrumbs data
  const breadcrumbData = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${siteUrl}${item.url}`,
        })),
      }
    : null

  const extraStructuredData = customStructuredData
    ? Array.isArray(customStructuredData)
      ? customStructuredData
      : [customStructuredData]
    : []

  // Organization data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ArtDent',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: defaultDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+54-11-XXXX-XXXX',
      contactType: 'customer service',
      areaServed: 'AR',
      availableLanguage: 'es',
    },
    sameAs: [
      'https://www.facebook.com/artdent',
      'https://www.instagram.com/artdent',
      'https://www.linkedin.com/company/artdent',
    ],
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="ArtDent" />
      <meta property="og:locale" content="es_AR" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDescription} />
      <meta property="twitter:image" content={fullImage} />

      {/* Product specific OG tags */}
      {type === 'product' && productData && (
        <>
          <meta property="product:price:amount" content={productData.price.toString()} />
          <meta property="product:price:currency" content={productData.currency} />
          <meta property="product:availability" content={productData.availability} />
          <meta property="product:brand" content={productData.brand} />
        </>
      )}

      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(baseStructuredData)}
      </script>

      {breadcrumbData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      )}

      {extraStructuredData.map((item, index) => (
        <script key={`structured-data-${index}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}

      {/* Organization data on homepage only */}
      {!url && (
        <script type="application/ld+json">
          {JSON.stringify(organizationData)}
        </script>
      )}

      {/* Robots */}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="bingbot" content={robots} />

      {/* Additional meta tags */}
      <meta name="author" content="ArtDent" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Theme color */}
      <meta name="theme-color" content="#0066CC" />
      <meta name="msapplication-TileColor" content="#0066CC" />
      
      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="ArtDent" />
    </Helmet>
  )
}

// Usage examples:
/*
// Homepage
<SEOHead />

// Product page
<SEOHead
  title={product.name}
  description={product.description}
  keywords={[product.category, 'dental', 'odontología']}
  image={product.image_url}
  url={`/productos/${product.id}`}
  type="product"
  productData={{
    name: product.name,
    price: product.price,
    currency: 'ARS',
    availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
    brand: 'ArtDent',
    sku: product.sku,
    image: product.image_url,
    rating: product.average_rating,
    reviewCount: product.review_count,
  }}
  breadcrumbs={[
    { name: 'Inicio', url: '/' },
    { name: 'Productos', url: '/productos' },
    { name: product.category, url: `/categoria/${product.category_id}` },
    { name: product.name, url: `/productos/${product.id}` },
  ]}
/>

// Category page
<SEOHead
  title={category.name}
  description={`Explora nuestra selección de ${category.name.toLowerCase()}`}
  keywords={[category.name, 'dental', 'productos dentales']}
  url={`/categoria/${category.id}`}
  breadcrumbs={[
    { name: 'Inicio', url: '/' },
    { name: 'Productos', url: '/productos' },
    { name: category.name, url: `/categoria/${category.id}` },
  ]}
/>
*/

import { Header } from '@/components/layout/Header';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { useVideos } from '@/hooks/useVideos';
import { useCategories } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { BannerAd728, BannerAd320, NativeBannerAd } from '@/components/ads';
import { Helmet } from 'react-helmet-async';


export default function Index() {
  const { data: videos, isLoading } = useVideos('published');
  const { data: categories } = useCategories();

  // Split videos for ad insertion
  const videosArray = videos || [];
  const firstBatch = videosArray.slice(0, 4);
  const secondBatch = videosArray.slice(4);

  const canonicalUrl = `${window.location.origin}/`;
  const pageTitle = 'Vid Hub | Watch & Share Videos';
  const pageDescription = 'Vid Hub: discover, watch, and share videos from creators around the world. Browse latest uploads and categories.';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vid Hub',
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
      </Helmet>

      <Header />

      {/* Top 728x90 Banner Ad */}
      <BannerAd728 />

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-gradient">VidHub</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and share amazing videos from creators around the world
          </p>
        </section>

        {categories && categories.length > 0 && (
          <section className="mb-8" aria-label="Featured video categories">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories
                .filter((c) => c.is_active)
                .slice(0, 10)
                .map((category) => (
                  <Link key={category.id} to={`/category/${category.slug}`} aria-label={`Browse ${category.name} videos`}>
                    <Badge
                      variant="secondary"
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
            </div>
          </section>
        )}

        <section className="mb-12" aria-label="Latest videos">
          <h2 className="text-2xl font-bold mb-6">Latest Videos</h2>

          {/* First batch of videos */}
          <VideoGrid videos={firstBatch} isLoading={isLoading} />

          {/* In-feed 320x50 Ad */}
          {videosArray.length > 4 && (
            <div className="my-6">
              <BannerAd320 />
            </div>
          )}

          {/* Second batch of videos */}
          {secondBatch.length > 0 && <VideoGrid videos={secondBatch} isLoading={false} />}
        </section>
      </main>

      {/* Bottom Native Banner Ad */}
      <NativeBannerAd />

      {/* Bottom 728x90 Banner Ad */}
      <BannerAd728 />

      {/* Bottom Native Banner Ad */}
      <NativeBannerAd />
    </div>
  );
}

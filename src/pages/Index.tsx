import { useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { useTrendingVideos, useLatestVideos, useInfiniteVideos } from '@/hooks/useVideos';
import { useCategories } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { SocialBar, BoxAd300 } from '@/components/ads';
import { Helmet } from 'react-helmet-async';
import { Flame, Clock, Star, Loader2 } from 'lucide-react';

export default function Index() {
  const { data: trendingVideos, isLoading: trendingLoading } = useTrendingVideos();
  const { data: latestVideos, isLoading: latestLoading } = useLatestVideos();
  const { data: categories } = useCategories();
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: recommendedLoading,
  } = useInfiniteVideos('published');

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }, { rootMargin: '400px' });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const recommendedVideos = infiniteData?.pages.flat() ?? [];

  const canonicalUrl = `${window.location.origin}/`;
  const pageTitle = 'VidHub | Watch & Share Videos';
  const pageDescription = 'Discover, watch, and share videos from creators around the world on VidHub.';

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VidHub',
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(websiteJsonLd)}</script>
      </Helmet>

      <Header />
      <SocialBar />

      <main className="mx-auto w-full max-w-screen-2xl px-3 md:px-6 py-6 space-y-10">
        {/* Categories */}
        {categories && categories.length > 0 && (
          <section aria-label="Categories">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories
                .filter((c) => c.is_active)
                .slice(0, 12)
                .map((category) => (
                  <Link key={category.id} to={`/category/${category.slug}`}>
                    <Badge
                      variant="secondary"
                      className="px-3 py-1.5 text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Latest Videos */}
        <section aria-label="Latest videos">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Latest Videos</h2>
          </div>
          <VideoGrid videos={latestVideos} isLoading={latestLoading} skeletonCount={8} />
          <BoxAd300 />
        </section>

        {/* Trending Videos */}
        <section aria-label="Trending videos">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
          <VideoGrid videos={trendingVideos} isLoading={trendingLoading} skeletonCount={8} />
        </section>

        {/* Recommended / Infinite Scroll */}
        <section aria-label="Recommended videos">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold">Recommended</h2>
          </div>
          <VideoGrid
            videos={recommendedVideos}
            isLoading={recommendedLoading}
            skeletonCount={12}
            insertAdsEvery={8}
          />
          
          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/search" className="hover:text-foreground transition-colors">Browse</Link>
            <span>© {new Date().getFullYear()} VidHub</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

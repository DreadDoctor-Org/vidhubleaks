import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { VideoGrid } from '@/components/videos/VideoGrid';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search as SearchIcon, X, Filter } from 'lucide-react';
import { BannerAd728 } from '@/components/ads';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      let searchQuery = supabase
        .from('videos')
        .select(`
          *,
          profiles!videos_user_id_profiles_fkey (username, display_name, avatar_url),
          categories (name, slug)
        `)
        .eq('status', 'published');

      // Text search
      const q = searchParams.get('q');
      if (q) {
        searchQuery = searchQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }

      // Category filter
      const categorySlug = searchParams.get('category');
      if (categorySlug && categories) {
        const category = categories.find((c) => c.slug === categorySlug);
        if (category) {
          searchQuery = searchQuery.eq('category_id', category.id);
        }
      }

      // Sorting
      const sort = searchParams.get('sort') || 'newest';
      switch (sort) {
        case 'oldest':
          searchQuery = searchQuery.order('created_at', { ascending: true });
          break;
        case 'popular':
          searchQuery = searchQuery.order('views_count', { ascending: false });
          break;
        case 'likes':
          searchQuery = searchQuery.order('likes_count', { ascending: false });
          break;
        default:
          searchQuery = searchQuery.order('created_at', { ascending: false });
      }

      const { data, error } = await searchQuery;

      if (error) throw error;

      // Filter by tag if specified
      const tagSlug = searchParams.get('tag');
      if (tagSlug && data) {
        const tag = tags.find((t) => t.slug === tagSlug);
        if (tag) {
          const { data: taggedVideoIds } = await supabase
            .from('video_tags')
            .select('video_id')
            .eq('tag_id', tag.id);

          const videoIds = taggedVideoIds?.map((vt) => vt.video_id) || [];
          setVideos(data.filter((v: any) => videoIds.includes(v.id)));
        } else {
          setVideos(data || []);
        }
      } else {
        setVideos(data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedTag) params.set('tag', selectedTag);
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasFilters = query || selectedCategory || selectedTag || sortBy !== 'newest';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Top Banner Ad */}
      <BannerAd728 />
      
      <main className="container px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Search Videos</h1>

        <form onSubmit={handleSearch} className="space-y-4 mb-8">
          {/* Search Input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="pl-10"
              />
            </div>
            <Button type="submit" className="gradient-primary">
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.filter((c) => c.is_active).map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag || "all"} onValueChange={(v) => setSelectedTag(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.slug}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most Viewed</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button type="button" variant="outline" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </form>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <Badge variant="secondary" className="gap-1">
                Search: {query}
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  setQuery('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('q');
                  setSearchParams(params);
                }} />
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories?.find((c) => c.slug === selectedCategory)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  setSelectedCategory('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('category');
                  setSearchParams(params);
                }} />
              </Badge>
            )}
            {selectedTag && (
              <Badge variant="secondary" className="gap-1">
                Tag: {tags.find((t) => t.slug === selectedTag)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  setSelectedTag('');
                  const params = new URLSearchParams(searchParams);
                  params.delete('tag');
                  setSearchParams(params);
                }} />
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {loading ? 'Searching...' : `${videos.length} video${videos.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <VideoGrid videos={videos} isLoading={loading} />
      </main>

      {/* Bottom Banner Ad */}
      <BannerAd728 />
    </div>
  );
}

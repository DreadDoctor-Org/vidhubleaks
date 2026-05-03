import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCreateVideo } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Code, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminEmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function extractEmbedUrl(iframeCode: string): string | null {
  const match = iframeCode.match(/src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

export function AdminEmbedDialog({ open, onOpenChange }: AdminEmbedDialogProps) {
  const [embedCode, setEmbedCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [thumbnailStatus, setThumbnailStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const { data: categories } = useCategories();
  const { user } = useAuth();

  const extractedUrl = extractEmbedUrl(embedCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !extractedUrl || !title.trim()) return;

    setSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

      const { error } = await supabase.from('videos').insert({
        title: title.trim(),
        description: description.trim() || null,
        slug,
        user_id: user.id,
        embed_url: extractedUrl,
        category_id: categoryId && categoryId !== 'none' ? categoryId : null,
        thumbnail_url: thumbnailUrl.trim() || null,
        status: 'published' as const,
        published_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Embed video published successfully');
      setEmbedCode('');
      setTitle('');
      setDescription('');
      setCategoryId('');
      setThumbnailUrl('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating embed video:', error);
      toast.error('Failed to create embed video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Add Embed Video
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embedCode">Iframe Embed Code</Label>
            <Textarea
              id="embedCode"
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder='<iframe width="640" height="480" src="https://example.com/embed/123" frameborder="0" allowfullscreen></iframe>'
              rows={3}
              required
            />
            {embedCode && (
              <p className={`text-xs ${extractedUrl ? 'text-green-500' : 'text-destructive'}`}>
                {extractedUrl ? `✓ Extracted URL: ${extractedUrl}` : '✗ Could not extract src URL from iframe code'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-title">Title</Label>
            <Input
              id="embed-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-description">Description</Label>
            <Textarea
              id="embed-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-thumbnail">Thumbnail URL (optional)</Label>
            <Input
              id="embed-thumbnail"
              value={thumbnailUrl}
              onChange={(e) => {
                setThumbnailUrl(e.target.value);
                setThumbnailStatus(e.target.value ? 'loading' : 'idle');
              }}
              placeholder="https://example.com/thumbnail.jpg"
            />
            {thumbnailUrl && thumbnailStatus !== 'idle' && (
              <p className={`text-xs flex items-center gap-1 ${
                thumbnailStatus === 'ok' ? 'text-green-500' :
                thumbnailStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {thumbnailStatus === 'ok' && <><CheckCircle2 className="h-3 w-3" /> Thumbnail loaded</>}
                {thumbnailStatus === 'error' && <><XCircle className="h-3 w-3" /> Failed to load thumbnail</>}
                {thumbnailStatus === 'loading' && <><Loader2 className="h-3 w-3 animate-spin" /> Loading…</>}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>

          {/* Live preview panel */}
          <div className="space-y-3">
            <Label>Live Preview</Label>
            <div className="rounded-lg border border-border bg-muted/30 overflow-hidden aspect-video">
              {extractedUrl ? (
                <iframe
                  src={extractedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Embed preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                  Paste an iframe code to preview the embed
                </div>
              )}
            </div>

            <Label>Thumbnail Preview</Label>
            <div className="rounded-lg border border-border bg-muted/30 overflow-hidden aspect-video flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onLoad={() => setThumbnailStatus('ok')}
                  onError={() => setThumbnailStatus('error')}
                />
              ) : (
                <span className="text-sm text-muted-foreground">No thumbnail URL provided</span>
              )}
            </div>
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !extractedUrl || !title.trim()}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

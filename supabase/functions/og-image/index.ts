import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const videoId = url.searchParams.get('id')
  
  if (!videoId) {
    return new Response('Video ID required', { status: 400, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Fetching video:', videoId)

  const { data: video, error } = await supabase
    .from('videos')
    .select('title, description, thumbnail_url')
    .eq('id', videoId)
    .single()

  if (error || !video) {
    console.error('Video not found:', error)
    return new Response('Video not found', { status: 404, headers: corsHeaders })
  }

  console.log('Video found:', video.title, 'Thumbnail:', video.thumbnail_url)

  const escapeHtml = (str: string) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const defaultSiteUrl = 'https://xdxcfhdfjpdpfqyxtnwc.lovableproject.com'
  const siteParam = url.searchParams.get('site')
  let siteUrl = defaultSiteUrl
  if (siteParam) {
    try {
      const parsed = new URL(siteParam)
      siteUrl = `${parsed.protocol}//${parsed.host}`
    } catch {
      // ignore invalid site param
    }
  }

  const siteName = 'Vid Hub'
  const title = escapeHtml(video.title || 'Vid Hub Video')
  const description = escapeHtml(video.description?.substring(0, 200) || 'Watch this video on Vid Hub')
  const videoUrl = `${siteUrl}/video/${videoId}`
  const twitterDomain = (() => {
    try {
      return new URL(siteUrl).hostname
    } catch {
      return 'xdxcfhdfjpdpfqyxtnwc.lovableproject.com'
    }
  })()

  // Ensure thumbnail URL is absolute
  let thumbnailUrl = video.thumbnail_url || ''
  if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
    if (thumbnailUrl.startsWith('/storage/')) {
      thumbnailUrl = `${supabaseUrl}${thumbnailUrl}`
    } else {
      thumbnailUrl = `${siteUrl}${thumbnailUrl}`
    }
  }

  const ogImageType = thumbnailUrl.includes('.png') ? 'image/png' : 'image/jpeg'

  console.log('Final thumbnail URL:', thumbnailUrl)

  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Basic Meta -->
  <title>${title} - ${siteName}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${videoUrl}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.other">
  <meta property="og:title" content="${title}">
  <meta property="og:url" content="${videoUrl}">
  <meta property="og:description" content="${description}">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:image" content="${thumbnailUrl}">
  <meta property="og:image:secure_url" content="${thumbnailUrl}">
  <meta property="og:image:type" content="${ogImageType}">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="720">
  <meta property="og:image:alt" content="${title}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@TweetPrince12">
  <meta name="twitter:creator" content="@TweetPrince12">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${thumbnailUrl}">
  <meta name="twitter:image:src" content="${thumbnailUrl}">
  <meta name="twitter:image:alt" content="${title}">
  <meta name="twitter:domain" content="${twitterDomain}">
  <meta name="twitter:url" content="${videoUrl}">
  
  <!-- Redirect -->
  <meta http-equiv="refresh" content="0;url=${videoUrl}">
</head>
<body style="font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #0a0a0a; color: #fff;">
  <div style="text-align: center;">
    <h1>${title}</h1>
    <p>Redirecting to <a href="${videoUrl}" style="color: #8B5CF6;">Vid Hub</a>...</p>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})

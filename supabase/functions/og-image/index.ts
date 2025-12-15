import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const videoId = url.searchParams.get('id')
  
  if (!videoId) {
    return new Response('Video ID required', { status: 400, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: video, error } = await supabase
    .from('videos')
    .select('title, description, thumbnail_url')
    .eq('id', videoId)
    .single()

  if (error || !video) {
    return new Response('Video not found', { status: 404, headers: corsHeaders })
  }

  const escapeHtml = (str: string) => {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  const title = escapeHtml(video.title || 'Vid Hub Video')
  const description = escapeHtml(video.description?.substring(0, 200) || 'Watch this video on Vid Hub')
  const thumbnailUrl = video.thumbnail_url || ''
  const siteUrl = 'https://xdxcfhdfjpdpfqyxtnwc.lovableproject.com'
  const videoUrl = `${siteUrl}/video/${videoId}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - Vid Hub</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="video.other">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${thumbnailUrl}">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="720">
  <meta property="og:url" content="${videoUrl}">
  <meta property="og:site_name" content="Vid Hub">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@TweetPrince12">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${thumbnailUrl}">
  <meta http-equiv="refresh" content="0;url=${videoUrl}">
</head>
<body><p>Redirecting...</p></body>
</html>`

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
})

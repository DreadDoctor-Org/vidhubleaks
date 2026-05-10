const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Proxy external thumbnails so social crawlers (Twitter, Facebook, etc.)
// can fetch them even when the origin blocks hotlinking or bots.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const target = url.searchParams.get("url");
    if (!target) {
      return new Response("Missing url", { status: 400, headers: corsHeaders });
    }

    let parsed: URL;
    try {
      parsed = new URL(target);
    } catch {
      return new Response("Invalid url", { status: 400, headers: corsHeaders });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return new Response("Invalid scheme", { status: 400, headers: corsHeaders });
    }

    const upstream = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: `${parsed.protocol}//${parsed.host}/`,
      },
      redirect: "follow",
    });

    if (!upstream.ok) {
      return new Response(`Upstream ${upstream.status}`, {
        status: 502,
        headers: corsHeaders,
      });
    }

    const contentType =
      upstream.headers.get("content-type") || "image/jpeg";
    const buf = await upstream.arrayBuffer();

    return new Response(buf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      },
    });
  } catch (e) {
    console.error("thumb proxy error:", e);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
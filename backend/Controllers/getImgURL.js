const ALLOWED_IMAGE_HOSTS = new Set([
  "image.tmdb.org",
  "media.themoviedb.org",
]);

const DEFAULT_CONTENT_TYPE = "image/jpeg";

const isTrustedImageUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
};

export async function proxyMovieImage(req, res) {
  const { url: targetUrl } = req.query ?? {};
  if (!targetUrl || typeof targetUrl !== "string") {
    return res
      .status(400)
      .json({ ok: false, error: "Query parameter 'url' is required." });
  }

  if (!isTrustedImageUrl(targetUrl)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid image URL. Only TMDB image domains are permitted.",
    });
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: { Accept: "image/*" },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return res.status(upstreamResponse.status).json({
        ok: false,
        error: `Upstream image request failed with status ${upstreamResponse.status}.`,
      });
    }

    const contentType =
      upstreamResponse.headers.get("content-type") ?? DEFAULT_CONTENT_TYPE;

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");

    const arrayBuffer = await upstreamResponse.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("proxyMovieImage error:", error);
    return res.status(502).json({
      ok: false,
      error: "Failed to proxy image from TMDB.",
    });
  }
}

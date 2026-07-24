// Local, network-free placeholder images.
//
// The previous code relied on https://via.placeholder.com, but that service is
// now defunct (its DNS no longer resolves), so every fallback image broke.
// These helpers return inline SVG data-URIs instead — they always render and
// never make a network request.

/**
 * Build an inline SVG placeholder data-URI.
 * @param width  intrinsic width in px
 * @param height intrinsic height in px
 * @param text   optional label centered in the box
 */
export function placeholderImage(
  width = 400,
  height = 300,
  text = ''
): string {
  const label = text || `${width}×${height}`;
  const fontSize = Math.max(12, Math.round(Math.min(width, height) / 8));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#e5e7eb"/>
  <text x="50%" y="50%" fill="#9ca3af" font-family="system-ui, sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle" dominant-baseline="central">${escapeXml(
    label
  )}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

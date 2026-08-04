// Validation for admin image uploads.
//
// The `images` bucket is public and Supabase serves each object with the
// content type it was uploaded under, so an uploaded SVG or HTML file becomes
// live script on the storage domain. `accept="image/*"` on the file input is a
// picker filter only — it is trivially bypassed — so every rule that matters
// lives here.

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

// SVG is deliberately absent: it is an XML document that can carry <script>
// and event handlers, and it would be served as image/svg+xml from a public URL.
const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

// First bytes of each accepted format. Checked so a renamed .html or .svg
// cannot pass on its declared MIME type alone.
const SIGNATURES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  // RIFF....WEBP
  'image/webp': (b) =>
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  // ....ftyp — the ISO-BMFF box AVIF shares with HEIF/MP4.
  'image/avif': (b) =>
    b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70,
};

function mb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Checks a picked File. Resolves to an error string, or '' when the file is
 * acceptable. Async because the signature check has to read the first bytes.
 */
export async function validateImageFile(file) {
  const ext = ALLOWED[file.type];
  if (!ext) {
    if (file.type === 'image/svg+xml') {
      return 'SVG files are not allowed — they can contain scripts. Use JPG, PNG, WebP or AVIF.';
    }
    return `${file.type || 'This file type'} is not allowed. Use JPG, PNG, WebP or AVIF.`;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return `Image is ${mb(file.size)}. The limit is ${mb(MAX_UPLOAD_BYTES)}.`;
  }

  if (file.size === 0) return 'That file is empty.';

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (header.length < 12 || !SIGNATURES[file.type](header)) {
    return `This file is named as ${file.type} but its contents are not. Upload a real image.`;
  }

  return '';
}

/**
 * A random object path. The previous `${Date.now()}-${file.name}` scheme was
 * guessable and leaked the original filename; a UUID collides with nothing and
 * reveals nothing.
 */
export function uploadPath(file) {
  const ext = ALLOWED[file.type] ?? 'bin';
  return `${crypto.randomUUID()}.${ext}`;
}

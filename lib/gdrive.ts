/**
 * Converte qualquer URL do Google Drive para uma URL servida via proxy local.
 * O proxy (/api/image) faz o redirecionamento server-side, evitando bloqueios do browser.
 *
 * Formatos aceitos:
 *  - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *  - https://drive.google.com/file/d/FILE_ID/view
 *  - https://drive.google.com/open?id=FILE_ID
 *  - https://drive.google.com/uc?id=FILE_ID&...
 *
 * Se a URL não for do Google Drive, é retornada sem alteração.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return url;

  let fileId: string | null = null;

  // /file/d/FILE_ID/...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch) fileId = fileMatch[1];

  // ?id=FILE_ID  ou  &id=FILE_ID  (open, uc, etc.)
  if (!fileId) {
    const idMatch = url.match(/drive\.google\.com\/.*[?&]id=([^&]+)/);
    if (idMatch) fileId = idMatch[1];
  }

  if (fileId) {
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    return `/api/image?url=${encodeURIComponent(driveUrl)}`;
  }

  return url;
}

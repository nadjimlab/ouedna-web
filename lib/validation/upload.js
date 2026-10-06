const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export function validateImageFile(file, { maxBytes = MAX_IMAGE_BYTES } = {}) {
  if (!file || !IMAGE_TYPES.has(file.type) || file.size <= 0 || file.size > maxBytes) {
    return { error: "يرجى اختيار صورة JPG أو PNG أو WebP أو AVIF بحجم لا يتجاوز 8MB." };
  }
  return { extension: IMAGE_TYPES.get(file.type) };
}

export function imageUploadPath(prefix, file, unique = Date.now()) {
  const { extension } = validateImageFile(file);
  if (!extension) return null;
  return `${prefix}/${unique}-${crypto.randomUUID()}.${extension}`;
}

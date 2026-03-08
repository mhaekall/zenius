// ==========================================
// Utility Functions for OpenMenu
// ==========================================

/**
 * Format angka ke format Rupiah
 * @example formatRupiah(25000) => "Rp 25.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Build WhatsApp checkout URL
 */
export function buildWhatsAppUrl(
  waNumber: string,
  items: Array<{ name: string; qty: number; price: number }>,
  storeName: string,
  catalogUrl: string
): string {
  const itemList = items
    .map((item) => `• ${item.name} x${item.qty} = ${formatRupiah(item.price * item.qty)}`)
    .join('\n');
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const message = `Halo ${storeName}! 👋\n\nSaya ingin memesan:\n\n${itemList}\n\n*Total: ${formatRupiah(total)}*\n\n---\nDikirim dari katalog: ${catalogUrl}`;

  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Validate & sanitize slug (only a-z, 0-9, -)
 */
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate initials from name (for avatar placeholder)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Combine class names (simple utility)
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get public URL from Supabase storage path
 */
export function getStorageUrl(supabaseUrl: string, bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function createImageId(name: string) {
  const safeName = name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'asset';

  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().split('-')[0]
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  return `${safeName}-${suffix}`;
}

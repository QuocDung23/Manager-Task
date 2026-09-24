const AVATAR_BG_PALETTE: readonly string[] = [
  '1ABC9C', '2ECC71', '3498DB', '9B59B6', '34495E',
  'E67E22', 'E74C3C', 'F1C40F', '16A085', '27AE60',
  '2980B9', '8E44AD', '2C3E50', 'D35400', 'C0392B',
] as const;

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function nameToHexColor(name: string | null | undefined): string {
  const normalized = normalizeName(name ?? '');
  if (!normalized) {
    return AVATAR_BG_PALETTE[0];
  }
  const idx = fnv1a(normalized) % AVATAR_BG_PALETTE.length;
  return AVATAR_BG_PALETTE[idx];
}

export function buildDefaultAvatarUrl(name: string | null | undefined): string {
  const bg = nameToHexColor(name);
  const displayName = (name ?? '').trim() || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${bg}&color=fff&size=256`;
}

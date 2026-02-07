/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Avatar — Glass surface, neon ring for active state.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
'use client';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  ring?: boolean;
  fallback?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-micro',
  md: 'w-10 h-10 text-caption',
  lg: 'w-12 h-12 text-body',
  xl: 'w-16 h-16 text-title',
};

export default function Avatar({
  src,
  alt = 'User',
  size = 'md',
  ring = false,
  fallback,
}: AvatarProps) {
  const ringClass = ring
    ? 'ring-2 ring-neon-cyan ring-offset-2 ring-offset-obsidian'
    : '';

  return (
    <div
      className={`
        relative rounded-full overflow-hidden shrink-0
        ${sizeMap[size]} ${ringClass}
      `}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-neon-violet/20 text-neon-violet font-bold">
          {fallback ?? alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

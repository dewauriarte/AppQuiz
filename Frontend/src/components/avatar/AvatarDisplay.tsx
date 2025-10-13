/**
 * AvatarDisplay Component
 * Sprint 7: Display user avatar in different sizes
 */

import { cn } from '@/lib/utils';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarDisplayProps {
  avatarUrl?: string | null;
  frameUrl?: string | null;
  size?: AvatarSize;
  className?: string;
  showFrame?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  small: 'w-8 h-8',
  medium: 'w-16 h-16',
  large: 'w-24 h-24',
  xlarge: 'w-32 h-32',
};

const frameSizeClasses: Record<AvatarSize, string> = {
  small: 'w-10 h-10',
  medium: 'w-20 h-20',
  large: 'w-28 h-28',
  xlarge: 'w-36 h-36',
};

export function AvatarDisplay({
  avatarUrl = '/avatars/default.png',
  frameUrl,
  size = 'medium',
  className,
  showFrame = true,
}: AvatarDisplayProps) {
  const hasFrame = showFrame && frameUrl;

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Avatar Image */}
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800',
          sizeClasses[size],
          hasFrame && 'border-2 border-white dark:border-slate-900'
        )}
      >
        <img
          src={avatarUrl || '/avatars/default.png'}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/avatars/default.png';
          }}
        />
      </div>

      {/* Frame Overlay */}
      {hasFrame && (
        <div
          className={cn(
            'absolute inset-0 -m-1 pointer-events-none',
            frameSizeClasses[size]
          )}
        >
          <img
            src={frameUrl}
            alt="Frame"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}


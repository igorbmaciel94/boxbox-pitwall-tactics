import { TAG_COLORS, TAG_DISPLAY_NAMES } from '../../lib/constants';

interface BadgeProps {
  tag: string;
  size?: 'sm' | 'md';
}

export function Badge({ tag, size = 'sm' }: BadgeProps) {
  const colors = TAG_COLORS[tag] ?? { bg: 'bg-metal/50', text: 'text-metal-light', border: 'border-metal-light' };
  const displayName = TAG_DISPLAY_NAMES[tag] ?? tag;
  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-block rounded font-display font-semibold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border} ${sizeClass}`}
    >
      {displayName}
    </span>
  );
}

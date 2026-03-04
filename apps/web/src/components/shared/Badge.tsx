import { TAG_COLORS } from '../../lib/constants';
import { useI18n } from '../../i18n';

interface BadgeProps {
  tag: string;
  size?: 'sm' | 'md';
}

export function Badge({ tag, size = 'sm' }: BadgeProps) {
  const { getTagLabel } = useI18n();
  const colors = TAG_COLORS[tag] ?? { bg: 'bg-white/10', text: 'text-metal-light', border: 'border-white/10' };
  const displayName = getTagLabel(tag, tag);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-block rounded-full border font-display font-medium uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border} ${sizeClass}`}
    >
      {displayName}
    </span>
  );
}

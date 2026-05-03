import { useNavigate, useLocation } from 'react-router';
import { useI18n } from '../../i18n';

const NAV_ITEMS = [
  { path: '/', labelKey: 'nav.home', icon: 'HM' },
  { path: '/team', labelKey: 'nav.team', icon: 'TM' },
  { path: '/decks', labelKey: 'nav.decks', icon: 'DK' },
  { path: '/garage', labelKey: 'nav.garage', icon: 'GR' },
] as const;

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  if (location.pathname === '/race') return null;

  return (
    <nav className="safe-area-pb fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-[#0c1219]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors duration-150
                ${active ? 'text-apex-red' : 'text-metal-light hover:text-white/80'}`}
            >
              {active && (
                <span className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-apex-red" />
              )}
              <span className={`font-mono text-[11px] font-semibold tracking-wider ${active ? 'text-apex-red' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide">
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

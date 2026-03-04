import { useNavigate, useLocation } from 'react-router';

const NAV_ITEMS = [
  { path: '/', label: 'HOME', icon: '⌂' },
  { path: '/team', label: 'TEAM', icon: '◆' },
  { path: '/decks', label: 'DECKS', icon: '▦' },
  { path: '/garage', label: 'GARAGE', icon: '◈' },
] as const;

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide nav during active race
  if (location.pathname === '/race') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-metal-light/20 bg-carbon-mid/95 backdrop-blur-sm safe-area-pb">
      <div className="mx-auto flex max-w-lg">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors
                ${active ? 'text-hud-blue' : 'text-metal-light hover:text-white'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-display text-[8px] font-semibold uppercase tracking-widest">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

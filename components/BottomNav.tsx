'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Início' },
  { href: '/agente', label: 'Agente' },
  { href: '/agenda', label: 'Agenda' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-ink bg-cream-100 md:hidden"
    >
      <ul className="grid grid-cols-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`flex h-16 flex-col items-center justify-center text-xs font-medium no-underline transition-colors ${
                  active ? 'bg-tomato text-white' : 'text-ink-muted hover:bg-cream-200'
                }`}
              >
                <span className="font-display text-lg font-bold leading-none">
                  {link.label.slice(0, 1)}
                </span>
                <span className="mt-1">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

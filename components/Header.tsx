'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Início' },
  { href: '/agente', label: 'Agente' },
  { href: '/agenda', label: 'Agenda' },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 hidden border-b-2 border-ink bg-cream-100 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight no-underline">
          CampusPulse
        </Link>
        <nav aria-label="Principal">
          <ul className="flex items-center gap-8">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative text-sm font-medium no-underline transition-colors hover:text-tomato ${
                      active ? 'text-ink' : 'text-ink-muted'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute -bottom-1 left-0 h-1 w-full bg-tomato" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

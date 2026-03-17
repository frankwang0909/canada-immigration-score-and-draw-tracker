'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/ee', label: '联邦 EE 算分' },
  { href: '/bcpnp', label: 'BCPNP 算分' },
  { href: '/oinp', label: 'OINP 算分' },
  { href: '/ee-history', label: 'EE 邀请历史' },
  { href: '/bcpnp-history', label: 'BCPNP 邀请历史' },
  { href: '/oinp-history', label: 'OINP 邀请历史' }
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="tab-bar">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? 'active' : ''}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

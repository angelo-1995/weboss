import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grupos | WebOSS',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

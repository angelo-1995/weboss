import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestión de Predicaciones | WebOSS',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import { SideNav } from '@/components/layout/side-nav';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { TopBar } from '@/components/layout/top-bar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <SideNav />

      {/* Mobile sidebar (overlay) */}
      <MobileSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <div className="animate-in-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

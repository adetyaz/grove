import Sidebar, { SidebarProvider } from "@/components/sidebar";
import DashboardLayout from "@/components/dashboard-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
        <Sidebar />

        <DashboardLayout>{children}</DashboardLayout>
      </div>
    </SidebarProvider>
  );
}

import { ReactNode } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface AdminLayoutProps {
  children: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const AdminLayout = ({ children, breadcrumbs }: AdminLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          
          <main className="flex-1 p-6">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

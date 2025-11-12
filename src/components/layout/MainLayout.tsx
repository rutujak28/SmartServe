import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  showBottomNav?: boolean;
}

export const MainLayout = ({
  children,
  showSearch = false,
  onSearchChange,
  searchValue,
  showBottomNav = true,
}: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-base flex flex-col">
      <Header
        showSearch={showSearch}
        onSearchChange={onSearchChange}
        searchValue={searchValue}
      />
      <main className="flex-1 pb-20">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

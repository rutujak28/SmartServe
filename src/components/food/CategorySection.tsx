import { ReactNode } from 'react';

interface CategorySectionProps {
  title: string;
  children: ReactNode;
}

export const CategorySection = ({ title, children }: CategorySectionProps) => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 px-4">{title}</h2>
      <div className="grid grid-cols-3 gap-3 px-4">
        {children}
      </div>
    </section>
  );
};

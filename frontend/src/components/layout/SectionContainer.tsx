'use client';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  background?: string;
  padding?: string;
  id?: string;
}

export default function SectionContainer({
  children,
  className = '',
  background = 'bg-transparent',
  padding = 'py-20',
  id
}: SectionContainerProps) {
  return (
    <section id={id} className={`${background} ${padding} ${className}`}>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
}

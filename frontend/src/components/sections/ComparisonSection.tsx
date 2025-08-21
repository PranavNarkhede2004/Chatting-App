'use client';

import AppComparisonCard from '@/components/ui/AppComparisonCard';
import SectionContainer from '@/components/layout/SectionContainer';
import { AppComparison } from '@/types/homepage.types';

interface ComparisonSectionProps {
  apps: AppComparison[];
  title?: string;
  className?: string;
}

export default function ComparisonSection({ 
  apps, 
  title = "How We Compare",
  className = '' 
}: ComparisonSectionProps) {
  return (
    <SectionContainer 
      id="comparison" 
      className={className}
      background="bg-white/5"
    >
      <h3 className="text-4xl font-bold text-center text-white mb-12">{title}</h3>
      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {apps.map((app) => (
          <AppComparisonCard
            key={app.name}
            name={app.name}
            icon={app.icon}
            description={app.description}
            color={app.color}
            hasFeature={app.hasFeature}
          />
        ))}
      </div>
    </SectionContainer>
  );
}

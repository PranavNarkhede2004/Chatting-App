'use client';

import FeatureCard from '@/components/features/FeatureCard';
import SectionContainer from '@/components/layout/SectionContainer';
import { FeatureItem } from '@/types/homepage.types';

interface FeaturesSectionProps {
  features: FeatureItem[];
  title?: string;
  className?: string;
}

export default function FeaturesSection({ 
  features, 
  title = "Why Choose ChatFlow?",
  className = '' 
}: FeaturesSectionProps) {
  return (
    <SectionContainer 
      id="features" 
      className={className}
      background="bg-transparent"
    >
      <div className="max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-6">{title}</h3>
        <div className="space-y-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

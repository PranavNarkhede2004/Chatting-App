'use client';

import ComparisonSection from '@/components/sections/ComparisonSection';
import { homepageConfig } from '@/config/homepage.config';

export default function ComparisonGrid() {
  return (
    <ComparisonSection 
      apps={homepageConfig.comparison}
    />
  );
}

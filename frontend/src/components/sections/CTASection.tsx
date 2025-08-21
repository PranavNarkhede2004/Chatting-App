'use client';

import SectionContainer from '@/components/layout/SectionContainer';
import { CTAContent } from '@/types/homepage.types';

interface CTASectionProps {
  content: CTAContent;
  className?: string;
}

export default function CTASection({ content, className = '' }: CTASectionProps) {
  return (
    <SectionContainer 
      id="cta" 
      className={className}
      background="bg-gradient-to-r from-purple-600 to-pink-600"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {content.title}
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={content.primaryAction.href}
            onClick={content.primaryAction.onClick}
            className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {content.primaryAction.text}
          </a>
          {content.secondaryAction && (
            <a
              href={content.secondaryAction.href}
              onClick={content.secondaryAction.onClick}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {content.secondaryAction.text}
            </a>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}

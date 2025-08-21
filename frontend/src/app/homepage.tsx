'use client';

import Navigation from '@/components/layout/Navigation';
import HeroSection from '@/components/layout/HeroSection';
import AuthForm from '@/components/auth/AuthForm';
import FeaturesSection from '@/components/sections/FeaturesSection';
import ComparisonSection from '@/components/sections/ComparisonSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/hooks/useAuth';
import { useState } from 'react';
import { homepageConfig } from '@/config/homepage.config';

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
        <Navigation />
        
        <HeroSection />
        
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <AuthForm 
                isLogin={isLogin} 
                onToggleMode={() => setIsLogin(!isLogin)} 
              />
              
              <FeaturesSection 
                features={homepageConfig.features}
                title="Why Choose ChatFlow?"
              />
            </div>
          </div>
        </section>

        <ComparisonSection 
          apps={homepageConfig.comparison}
        />
        
        <CTASection 
          content={homepageConfig.cta}
        />
        
        <Footer />
      </div>
    </AuthProvider>
  );
}

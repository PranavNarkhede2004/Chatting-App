export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

export interface AppComparison {
  name: string;
  icon: string;
  description: string;
  color: string;
  hasFeature: boolean;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  apps: AppHighlight[];
}

export interface AppHighlight {
  icon: string;
  label: string;
  color: string;
}

export interface SectionConfig {
  id: string;
  title?: string;
  subtitle?: string;
  background?: string;
  padding?: string;
}

export interface HomepageConfig {
  hero: HeroContent;
  features: FeatureItem[];
  comparison: AppComparison[];
  cta: CTAContent;
}

export interface CTAContent {
  title: string;
  subtitle: string;
  primaryAction: ActionButton;
  secondaryAction?: ActionButton;
}

export interface ActionButton {
  text: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

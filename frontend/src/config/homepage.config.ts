import { HomepageConfig } from '@/types/homepage.types';

export const homepageConfig: HomepageConfig = {
  hero: {
    title: "The Future of",
    subtitle: "Experience the perfect blend of WhatsApp's simplicity, Telegram's speed, and Discord's community features in one powerful platform. Join millions who've made the switch to smarter communication.",
    apps: [
      {
        icon: "📱",
        label: "Like WhatsApp",
        color: "bg-green-500"
      },
      {
        icon: "✈️",
        label: "Faster than Telegram",
        color: "bg-blue-500"
      },
      {
        icon: "🎮",
        label: "Communities like Discord",
        color: "bg-purple-500"
      }
    ]
  },
  features: [
    {
      icon: "📱",
      title: "WhatsApp-Style Simplicity",
      description: "Clean, intuitive interface that feels familiar yet modern. No learning curve required.",
      gradient: "from-green-400 to-blue-500"
    },
    {
      icon: "⚡",
      title: "Telegram-Level Speed",
      description: "Lightning-fast message delivery with optimized servers worldwide.",
      gradient: "from-blue-400 to-purple-500"
    },
    {
      icon: "👥",
      title: "Discord-Style Communities",
      description: "Create groups, channels, and communities with advanced moderation tools.",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: "🔒",
      title: "Signal-Level Security",
      description: "End-to-end encryption, disappearing messages, and privacy-first design.",
      gradient: "from-yellow-400 to-red-500"
    }
  ],
  comparison: [
    {
      name: "WhatsApp",
      icon: "📱",
      description: "Simple & Familiar",
      color: "bg-green-500",
      hasFeature: true
    },
    {
      name: "Telegram",
      icon: "✈️",
      description: "Fast & Powerful",
      color: "bg-blue-500",
      hasFeature: true
    },
    {
      name: "Discord",
      icon: "🎮",
      description: "Communities & Voice",
      color: "bg-purple-500",
      hasFeature: true
    },
    {
      name: "Signal",
      icon: "🔒",
      description: "Privacy & Security",
      color: "bg-red-500",
      hasFeature: true
    }
  ],
  cta: {
    title: "Ready to Transform Your Communication?",
    subtitle: "Join millions of users who have already made the switch to ChatFlow.",
    primaryAction: {
      text: "Get Started Free",
      href: "/signup",
      variant: "primary"
    },
    secondaryAction: {
      text: "Learn More",
      href: "/features",
      variant: "secondary"
    }
  }
};

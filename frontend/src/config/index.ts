// Central configuration file
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 5000,
  },
  app: {
    name: 'Chatting Application',
    version: '1.0.0',
    description: 'A modern chatting application',
  },
  features: {
    enableNotifications: true,
    enableDarkMode: true,
    enableFileUpload: true,
  },
  ui: {
    theme: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
  },
};

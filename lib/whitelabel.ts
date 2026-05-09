// lib/whitelabel.ts
// Phase 7: White-Label Configuration - Custom branding per client

import { prisma } from '@/lib/prisma';

export interface WhiteLabelConfig {
  clientId: string;
  clientName: string;
  domain?: string;
  logo?: {
    url: string;
    width: number;
    height: number;
  };
  favicon?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  features: {
    enabled: string[];
    disabled: string[];
  };
  pricing?: {
    currency: string;
    plans: {
      name: string;
      price: number;
      features: string[];
    }[];
  };
  support?: {
    email?: string;
    website?: string;
    documentation?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function getWhiteLabelConfig(clientId: string): Promise<WhiteLabelConfig | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: `whitelabel:${clientId}` },
  });

  if (!setting) return null;

  try {
    return JSON.parse(setting.value) as WhiteLabelConfig;
  } catch {
    return null;
  }
}

export async function saveWhiteLabelConfig(
  clientId: string,
  config: Partial<WhiteLabelConfig>
): Promise<WhiteLabelConfig> {
  const existing = await getWhiteLabelConfig(clientId);
  const fullConfig: WhiteLabelConfig = {
    clientId,
    clientName: config.clientName || 'My Platform',
    domain: config.domain,
    logo: config.logo,
    favicon: config.favicon,
    colors: {
      primary: '#8b5cf6',
      secondary: '#6366f1',
      accent: '#d946ef',
      background: '#0a0a0c',
      surface: '#111111',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      border: '#27272a',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
      ...config.colors,
    },
    fonts: config.fonts,
    features: {
      enabled: config.features?.enabled || [],
      disabled: config.features?.disabled || [],
    },
    pricing: config.pricing,
    support: config.support,
    createdAt: existing?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  await prisma.systemSetting.upsert({
    where: { key: `whitelabel:${clientId}` },
    create: {
      key: `whitelabel:${clientId}`,
      value: JSON.stringify(fullConfig),
    },
    update: {
      value: JSON.stringify(fullConfig),
    },
  });

  return fullConfig;
}

// Generate CSS variables from white-label config
export function generateCSSVariables(config: WhiteLabelConfig): string {
  return `
    :root {
      --wl-primary: ${config.colors.primary};
      --wl-secondary: ${config.colors.secondary};
      --wl-accent: ${config.colors.accent};
      --wl-background: ${config.colors.background};
      --wl-surface: ${config.colors.surface};
      --wl-text: ${config.colors.text};
      --wl-text-secondary: ${config.colors.textSecondary};
      --wl-border: ${config.colors.border};
      --wl-error: ${config.colors.error};
      --wl-success: ${config.colors.success};
      --wl-warning: ${config.colors.warning};
      ${config.fonts?.heading ? `--wl-font-heading: '${config.fonts.heading}', sans-serif;` : ''}
      ${config.fonts?.body ? `--wl-font-body: '${config.fonts.body}', sans-serif;` : ''}
    }
  `;
}

// Check if feature is enabled for client
export async function isFeatureEnabled(clientId: string, feature: string): Promise<boolean> {
  const config = await getWhiteLabelConfig(clientId);
  if (!config) return true; // Default: all features enabled

  if (config.features.disabled.includes(feature)) return false;
  if (config.features.enabled.length > 0) {
    return config.features.enabled.includes(feature);
  }

  return true;
}

/**
 * Modelos de Dominio — Parametrización Global de la Plataforma
 */

export interface PlatformSettings {
  id: string;
  companyName: string;
  slogan: string;
  logoUrl?: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  physicalAddress: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    pinterest?: string;
  };
  footerText: string;
  copyrightText: string;
  currency: string;
  taxRatePct: number;
  updatedAt: string;
}

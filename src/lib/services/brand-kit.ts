// Brand Kit — Reusable brand profile system
// Editable without code changes, stored in database

export interface BrandKit {
  id: string;
  name: string;
  motto: string;
  logo?: string;
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  defaultMusic?: string;
  outro?: string;
  templates: string[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_BRAND_KIT: Omit<BrandKit, "id" | "name" | "createdAt" | "updatedAt"> = {
  motto: "Premium quality",
  fonts: { heading: "Playfair Display", body: "Inter" },
  colors: { primary: "#c9a96e", secondary: "#12121a", accent: "#e8e0d4", background: "#f5f0ea", text: "#12121a" },
  outro: "Thanks for watching!",
  templates: ["hook-value-close"],
};

export function createBrandKit(params: {
  name: string;
  motto?: string;
  colors?: Partial<BrandKit["colors"]>;
  fonts?: Partial<BrandKit["fonts"]>;
  defaultMusic?: string;
  outro?: string;
}): BrandKit {
  const now = new Date().toISOString();
  return {
    id: `brand_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: params.name,
    motto: params.motto || DEFAULT_BRAND_KIT.motto,
    logo: undefined,
    fonts: { ...DEFAULT_BRAND_KIT.fonts, ...params.fonts },
    colors: { ...DEFAULT_BRAND_KIT.colors, ...params.colors },
    defaultMusic: params.defaultMusic || DEFAULT_BRAND_KIT.defaultMusic,
    outro: params.outro || DEFAULT_BRAND_KIT.outro,
    templates: [...DEFAULT_BRAND_KIT.templates],
    createdAt: now,
    updatedAt: now,
  };
}

// Available music tracks (NOT hardcoded — users can replace)
export const AVAILABLE_MUSIC: Record<string, { name: string; genre: string; duration: string }> = {
  upbeat_corporate: { name: "Upbeat Corporate", genre: "corporate", duration: "30s" },
  chill_loft: { name: "Chill Loft", genre: "lo-fi", duration: "30s" },
  energetic_pop: { name: "Energetic Pop", genre: "pop", duration: "15s" },
  cinematic_drama: { name: "Cinematic Drama", genre: "cinematic", duration: "30s" },
  acoustic_warm: { name: "Acoustic Warm", genre: "acoustic", duration: "30s" },
  ambient_drone: { name: "Ambient Drone", genre: "ambient", duration: "60s" },
};
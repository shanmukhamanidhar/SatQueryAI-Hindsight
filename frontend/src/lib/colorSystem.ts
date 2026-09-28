/**
 * CANONICAL UNIFIED COLOR SYSTEM FOR SATQUERYAI
 * 
 * Synchronized across the entire application:
 * - Vegetation Growth / Regrowth / Canopy / Crops / Greening -> Green (#10b981)
 * - Construction / Urban Development / Built-up / Infrastructure -> Orange (#f97316)
 * - Water Bodies / Hydrology / Surface Water Dynamics -> Blue (#0284c7)
 * - Deforestation / Canopy Loss / Disturbance -> Red (#ef4444)
 * - Bare Soil / Barren Ground / Exposed Terrain -> Amber/Ochre (#d97706)
 * 
 * Rules:
 * 1. The meaning of each color remains consistent across the entire application.
 * 2. Categories NEVER mix colors.
 * 3. All maps, legends, cards, indicators, labels, and visualizations use this mapping.
 */

export type CategoryKey = 'vegetation' | 'urban' | 'water' | 'deforestation' | 'bare';

export interface CategoryColorConfig {
  key: CategoryKey;
  name: string;
  shortLabel: string;
  color: string; // Canonical Hex code
  rgb: string;   // R, G, B string
  badgeClass: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
  ringClass: string;
  thumbnail: string;
  description: string;
}

export const CATEGORY_COLOR_SYSTEM: Record<CategoryKey, CategoryColorConfig> = {
  vegetation: {
    key: 'vegetation',
    name: 'Vegetation Growth & Canopy',
    shortLabel: 'Vegetation',
    color: '#10b981', // Emerald Green (Strictly for vegetation / regrowth / biomass / crops)
    rgb: '16, 185, 129',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    ringClass: 'ring-emerald-500/25',
    thumbnail: '/thumbnails/category_vegetation.jpg',
    description: 'Photosynthetic biomass, vegetation greening, agricultural crops, and canopy regrowth.',
  },
  urban: {
    key: 'urban',
    name: 'Construction & Urban Development',
    shortLabel: 'Urban Growth',
    color: '#f97316', // Orange (Strictly for built environment / construction / roads / infrastructure)
    rgb: '249, 115, 22',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-700',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-50/60 dark:bg-orange-950/30',
    ringClass: 'ring-orange-500/25',
    thumbnail: '/thumbnails/category_urban.jpg',
    description: 'New building construction, asphalt road corridors, concrete, and urban development.',
  },
  water: {
    key: 'water',
    name: 'Water Bodies & Hydrology',
    shortLabel: 'Water',
    color: '#0284c7', // Ocean / Sky Blue (Strictly for water bodies / hydrology / reservoirs / rivers)
    rgb: '2, 132, 199',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-700',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50/60 dark:bg-blue-950/30',
    ringClass: 'ring-blue-500/25',
    thumbnail: '/thumbnails/category_water.jpg',
    description: 'Lakes, open reservoirs, river channels, coastlines, and surface water dynamics.',
  },
  deforestation: {
    key: 'deforestation',
    name: 'Deforestation & Canopy Loss',
    shortLabel: 'Deforestation',
    color: '#ef4444', // Crimson Red (Strictly for tree cover loss / canopy clearing / disturbance)
    rgb: '239, 68, 68',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50/60 dark:bg-rose-950/30',
    ringClass: 'ring-rose-500/25',
    thumbnail: '/thumbnails/category_deforestation.jpg',
    description: 'Canopy disturbance, tree-cover loss, forest clearing, and habitat fragmentation.',
  },
  bare: {
    key: 'bare',
    name: 'Bare Ground & Soil',
    shortLabel: 'Bare Soil',
    color: '#d97706', // Ochre Amber (Strictly for exposed soil / cleared barren terrain)
    rgb: '217, 119, 6',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50/60 dark:bg-amber-950/30',
    ringClass: 'ring-amber-500/25',
    thumbnail: '/thumbnails/category_agriculture.jpg',
    description: 'Exposed soil, non-vegetated terrain, and cleared barren parcels.',
  },
};

/**
 * Resolves any freeform category string into one of the canonical keys.
 * Ensures strictly zero color mixing between categories.
 */
export function resolveCategoryKey(categoryStr: string): CategoryKey {
  const c = (categoryStr || '').toLowerCase().trim();
  
  // 1. Deforestation / Canopy Loss / Disturbance (Red #ef4444)
  // Must be strictly for negative canopy loss/disturbance/clearing
  if (
    c.includes('deforest') ||
    c.includes('canopy loss') ||
    c.includes('tree loss') ||
    c.includes('forest loss') ||
    c.includes('clearing') ||
    (c.includes('loss') && !c.includes('water') && !c.includes('urban') && !c.includes('gain') && !c.includes('growth'))
  ) {
    return 'deforestation';
  }

  // 2. Vegetation Growth / Regrowth / Greening / Canopy Health / Crops / Agriculture / Biomass (Emerald Green #10b981)
  // Prioritized so all positive vegetation dynamics, crops, and agriculture map to Green
  if (
    c.includes('vegetation') ||
    c.includes('regrowth') ||
    c.includes('growth') ||
    c.includes('greening') ||
    c.includes('green') ||
    c.includes('crop') ||
    c.includes('cropland') ||
    c.includes('agriculture') ||
    c.includes('agri') ||
    c.includes('farm') ||
    c.includes('gain') ||
    c.includes('biomass') ||
    c.includes('canopy') ||
    c.includes('forest') ||
    c.includes('plantation') ||
    c.includes('afforestation')
  ) {
    return 'vegetation';
  }

  // 3. Water / Hydrology / Lakes / Rivers / Reservoirs (Blue #0284c7)
  if (
    c.includes('water') ||
    c.includes('hydro') ||
    c.includes('lake') ||
    c.includes('river') ||
    c.includes('reservoir') ||
    c.includes('ocean') ||
    c.includes('sea') ||
    c.includes('coastal') ||
    c.includes('wetland') ||
    c.includes('flood') ||
    (c.includes('dynamic') && !c.includes('urban') && !c.includes('veg'))
  ) {
    return 'water';
  }

  // 4. Urban / Built-up / Construction / Infrastructure (Orange #f97316)
  if (
    c.includes('urban') ||
    c.includes('built') ||
    c.includes('construct') ||
    c.includes('city') ||
    c.includes('infrastructure') ||
    c.includes('concrete') ||
    c.includes('pavement') ||
    c.includes('asphalt') ||
    c.includes('road') ||
    c.includes('building') ||
    (c.includes('development') && !c.includes('veg') && !c.includes('crop'))
  ) {
    return 'urban';
  }

  // 5. Bare Soil / Barren Ground (Amber #d97706)
  if (
    c.includes('bare') ||
    c.includes('soil') ||
    c.includes('sand') ||
    c.includes('rock') ||
    c.includes('barren') ||
    c.includes('quarry') ||
    c.includes('excavation')
  ) {
    return 'bare';
  }

  // Fallback default is vegetation (Green #10b981)
  return 'vegetation';
}

/**
 * Gets the synchronized CategoryColorConfig for any category name or description.
 */
export function getCategoryConfig(categoryStr: string): CategoryColorConfig {
  const key = resolveCategoryKey(categoryStr);
  return CATEGORY_COLOR_SYSTEM[key];
}

/**
 * Gets the synchronized canonical hex color for any category:
 * - Vegetation -> #10b981 (Green)
 * - Urban / Construction -> #f97316 (Orange)
 * - Water -> #0284c7 (Blue)
 * - Deforestation -> #ef4444 (Red)
 * - Bare Soil -> #d97706 (Amber)
 */
export function getCategoryColor(categoryStr: string): string {
  return getCategoryConfig(categoryStr).color;
}

export function getCategoryShortLabel(categoryStr: string): string {
  return getCategoryConfig(categoryStr).shortLabel;
}

export function getCategoryName(categoryStr: string): string {
  return getCategoryConfig(categoryStr).name;
}

export function getCategoryBadgeClass(categoryStr: string): string {
  return getCategoryConfig(categoryStr).badgeClass;
}

export function getCategoryBorderClass(categoryStr: string): string {
  return getCategoryConfig(categoryStr).borderClass;
}

export function getCategoryTextClass(categoryStr: string): string {
  return getCategoryConfig(categoryStr).textClass;
}

export function getCategoryBgClass(categoryStr: string): string {
  return getCategoryConfig(categoryStr).bgClass;
}

export function getCategoryHex(cat: string): string {
  return getCategoryColor(cat);
}

// ---------------------------------------------------------------------------
// Hotspot Severity System (Deterministic criteria based on physical area & index delta)
// ---------------------------------------------------------------------------
export interface HotspotSeverity {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  color: string;
  bg: string;
  border: string;
  criteria: string;
}

export function calculateHotspotSeverity(areaHa: number, deltaNdvi: number = 0, deltaNdbi: number = 0): HotspotSeverity {
  const absNdvi = Math.abs(deltaNdvi);
  const absNdbi = Math.abs(deltaNdbi);

  if (areaHa >= 150 || absNdvi >= 0.30 || absNdbi >= 0.25) {
    return {
      level: 'CRITICAL',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      criteria: 'Area ≥ 150 ha or |ΔIndex| ≥ 0.25 (Major physical land transformation)'
    };
  }
  if (areaHa >= 50 || absNdvi >= 0.20 || absNdbi >= 0.18) {
    return {
      level: 'HIGH',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.15)',
      border: 'rgba(249, 115, 22, 0.4)',
      criteria: 'Area ≥ 50 ha or |ΔIndex| ≥ 0.18 (Substantial land surface shift)'
    };
  }
  if (areaHa >= 15 || absNdvi >= 0.10 || absNdbi >= 0.10) {
    return {
      level: 'MODERATE',
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.4)',
      criteria: 'Area ≥ 15 ha or |ΔIndex| ≥ 0.10 (Measurable transition)'
    };
  }
  return {
    level: 'LOW',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    criteria: 'Area < 15 ha (Localized surface variation)'
  };
}

export function getCategoryRgb(categoryStr: string): string {
  return getCategoryConfig(categoryStr).rgb;
}

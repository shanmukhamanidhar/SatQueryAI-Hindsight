import { 
  CATEGORY_COLOR_SYSTEM, 
  CategoryKey, 
  resolveCategoryKey, 
  getCategoryColor,
  getCategoryConfig
} from './colorSystem';

export interface CategoryVisual {
  id: string;
  name: string;
  thumbnail: string;
  color: string;
  badgeClass: string;
  borderClass: string;
  description: string;
}

export const SATELLITE_CATEGORIES: Record<string, CategoryVisual> = {
  vegetation: {
    id: 'vegetation',
    name: 'Vegetation & Forests',
    thumbnail: '/thumbnails/category_vegetation.jpg',
    color: '#10b981', // Green
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    borderClass: 'border-emerald-500',
    description: 'Pristine forest canopy, dense woodland, and photosynthetic biomass.',
  },
  water: {
    id: 'water',
    name: 'Water Bodies & Reservoirs',
    thumbnail: '/thumbnails/category_water.jpg',
    color: '#0284c7', // Blue
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    borderClass: 'border-blue-500',
    description: 'Lakes, open reservoirs, coastal waters, and inland water bodies.',
  },
  urban: {
    id: 'urban',
    name: 'Urban Expansion & Built Environment',
    thumbnail: '/thumbnails/category_urban.jpg',
    color: '#f97316', // Orange
    badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    borderClass: 'border-orange-500',
    description: 'New building structures, paved road networks, and infrastructure sprawl.',
  },
  agriculture: {
    id: 'agriculture',
    name: 'Agricultural Productivity & Cropland',
    thumbnail: '/thumbnails/category_agriculture.jpg',
    color: '#10b981', // Green (Vegetation family)
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    borderClass: 'border-emerald-500',
    description: 'Rotational crop parcels, center-pivot fields, and cultivated arable land.',
  },
  deforestation: {
    id: 'deforestation',
    name: 'Deforestation & Canopy Loss',
    thumbnail: '/thumbnails/category_deforestation.jpg',
    color: '#ef4444', // Red
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    borderClass: 'border-rose-500',
    description: 'Disturbed vegetation, tree-cover clearing, and canopy fragmentation.',
  },
  water_dynamics: {
    id: 'water_dynamics',
    name: 'Water Surface Dynamics',
    thumbnail: '/thumbnails/category_water_dynamics.jpg',
    color: '#0284c7', // Blue
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    borderClass: 'border-blue-500',
    description: 'Fluctuating waterlines, riverbank migration, and seasonal sediment beds.',
  },
  regrowth: {
    id: 'regrowth',
    name: 'Canopy Regrowth & Re-vegetation',
    thumbnail: '/thumbnails/category_regrowth.jpg',
    color: '#10b981', // Green
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    borderClass: 'border-emerald-500',
    description: 'Secondary growth recovery, reforestation parcels, and canopy regeneration.',
  },
};

/**
 * Resolves any category string to its matching realistic satellite imagery thumbnail visual
 * with synchronized canonical colors.
 */
export function getCategoryVisual(categoryStr: string): CategoryVisual {
  const c = (categoryStr || '').toLowerCase();
  if (c.includes('deforest') || c.includes('canopy loss') || (c.includes('loss') && !c.includes('water')) || (c.includes('veg') && c.includes('loss'))) {
    return SATELLITE_CATEGORIES.deforestation;
  }
  if (c.includes('regrowth') || c.includes('gain') || c.includes('recovery')) {
    return SATELLITE_CATEGORIES.regrowth;
  }
  if (c.includes('crop') || c.includes('agri') || c.includes('farm') || c.includes('wheat')) {
    return SATELLITE_CATEGORIES.agriculture;
  }
  if (c.includes('dynamic') || c.includes('river') || c.includes('channel') || c.includes('shore')) {
    return SATELLITE_CATEGORIES.water_dynamics;
  }
  if (c.includes('water') || c.includes('reservoir') || c.includes('lake') || c.includes('hydrolog')) {
    return SATELLITE_CATEGORIES.water;
  }
  if (c.includes('urban') || c.includes('built') || c.includes('construct') || c.includes('develop')) {
    return SATELLITE_CATEGORIES.urban;
  }
  return SATELLITE_CATEGORIES.vegetation;
}

export { getCategoryColor, getCategoryConfig };

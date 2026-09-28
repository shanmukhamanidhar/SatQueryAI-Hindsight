/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Purposeful Color System
        // Blue (Hydrology, Primary Navigation, Scanner Actions)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Green (Canopy, Vegetation, Positive Evidence, High Confidence)
        canopy: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Orange (Urban Growth, Built-up Expansion, Infrastructure)
        urban: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Red (Deforestation, Environmental Disturbance, Live Alerts)
        hazard: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Water (Surface Moisture & Reservoirs)
        water: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },

        // Legacy compatibility mappings
        'electric-cyan': '#2563eb',
        'aqua': '#0284c7',
        'satellite-blue': '#3b82f6',
        'aurora-blue': '#2563eb',
        'aurora-violet': '#7c3aed',
        'soft-violet': '#8b5cf6',
        'emerald-env': '#16a34a',
        'forest-env': '#15803d',
        'alert-warning': '#ea580c',
        'alert-critical': '#dc2626',

        space: {
          950: '#09090b',
          900: '#121215',
          850: '#18181b',
          800: '#27272a',
          750: '#3f3f46',
          700: '#52525b',
        },
        orbit: {
          cyan: '#2563eb',
          emerald: '#16a34a',
          amber: '#ea580c',
          crimson: '#dc2626',
          violet: '#7c3aed',
          blue: '#0284c7',
        },
        earth: {
          veg: '#16a34a',
          water: '#0284c7',
          built: '#ea580c',
          crop: '#059669',
          bare: '#d97706',
          change: '#dc2626',
          stable: '#64748b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 12px 36px -8px rgba(0, 0, 0, 0.7)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.25)',
        'glow-green': '0 0 20px rgba(22, 163, 74, 0.25)',
        'glow-orange': '0 0 20px rgba(234, 88, 12, 0.25)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.25)',
      },
    },
  },
  plugins: [],
}

import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Layers, 
  Maximize2, 
  Minimize2,
  Eye, 
  Crosshair, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Square,
  Circle,
  Pencil,
  Shapes,
  X,
  Flame, 
  Info, 
  Plus, 
  Minus, 
  RotateCcw,
  MapPin,
  Tag,
  Activity,
  CheckCircle,
  Clock,
  Satellite,
  ChevronDown,
  Check,
  Search,
  Globe2,
  ArrowRight
} from 'lucide-react';
import { AnalysisContext, ChangeRegion } from '../lib/types';
import { AVAILABLE_LOCATIONS, AvailableLocation } from '../lib/availableLocations';
import { calculateHotspotSeverity, getCategoryColor, getCategoryConfig, resolveCategoryKey, CATEGORY_COLOR_SYSTEM } from '../lib/colorSystem';

interface MapViewerProps {
  context: AnalysisContext | null;
  selectedRegion: ChangeRegion | null;
  onSelectRegion: (region: ChangeRegion | null) => void;
  onExplainMap: () => void;
  filteredCategory: string | null;
  highlightedRegionIds: string[] | null;
  zoomTarget?: [number, number, number] | null;
  onFilterCategory?: (cat: string | null) => void;
  fromYear?: number | null;
  toYear?: number | null;
  fromImageData?: { year: number; date: string; imageUrl: string } | null;
  toImageData?: { year: number; date: string; imageUrl: string } | null;
  isLoadingFromYear?: boolean;
  isLoadingToYear?: boolean;
  onSelectFromYear?: (frame: any) => void;
  onSelectToYear?: (frame: any) => void;
  onResetYears?: () => void;
  isMapMaximized?: boolean;
  onToggleMaximizeMap?: () => void;
  timeDrawerOpen?: boolean;
  onToggleTimeDrawer?: () => void;
  onOpenRawSatelliteModal?: () => void;
  theme?: 'light' | 'dark';
  onSelectLocation?: (query: string) => void;
  isAnalyzing?: boolean;
  onAnalyzeCustomAoi?: (geometry: any, areaHa: number) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  context,
  selectedRegion,
  onSelectRegion,
  onExplainMap,
  filteredCategory,
  highlightedRegionIds,
  zoomTarget,
  onFilterCategory,
  fromYear,
  toYear,
  fromImageData,
  toImageData,
  isLoadingFromYear,
  isLoadingToYear,
  onSelectFromYear,
  onSelectToYear,
  onResetYears,
  isMapMaximized,
  onToggleMaximizeMap,
  timeDrawerOpen,
  onToggleTimeDrawer,
  onOpenRawSatelliteModal,
  theme,
  onSelectLocation,
  isAnalyzing,
  onAnalyzeCustomAoi,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Interactive Custom AOI Drawing Tool ('none' | 'rectangle' | 'polygon' | 'circle')
  const [drawMode, setDrawMode] = useState<'none' | 'rectangle' | 'polygon' | 'circle'>('none');
  const [drawMenuOpen, setDrawMenuOpen] = useState<boolean>(false);
  const [drawnCoordinates, setDrawnCoordinates] = useState<[number, number][]>([]);
  const [customAoiHectares, setCustomAoiHectares] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [polyVertices, setPolyVertices] = useState<[number, number][]>([]);
  const polyVerticesRef = useRef<[number, number][]>([]);
  polyVerticesRef.current = polyVertices;
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState<boolean>(false);
  const drawingStartRef = useRef<[number, number] | null>(null);
  const drawModeRef = useRef<'none' | 'rectangle' | 'polygon' | 'circle'>('none');
  drawModeRef.current = drawMode;

  // Layer toggles (indicators optional: default closed)
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);
  const [showAreaNames, setShowAreaNames] = useState<boolean>(true);
  const [activeLayerName, setActiveLayerName] = useState<string>('True-Color Satellite Composite');

  // Markers and Popups references
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const areaMarkersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Mouse telemetry
  const [mouseCoords, setMouseCoords] = useState<{ lon: number; lat: number } | null>(null);

  // Location Dropdown State (Directly beside Map Title at top-left)
  const [locationDropdownOpen, setLocationDropdownOpen] = useState<boolean>(false);
  const [locationFilter, setLocationFilter] = useState<'all' | 'states' | 'uts' | 'global'>('all');
  const [locationSearch, setLocationSearch] = useState<string>('');
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Close location dropdown on click-away
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setLocationDropdownOpen(false);
      }
    };
    if (locationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [locationDropdownOpen]);

  // Filter available locations based on tab & search
  const filteredLocations = useMemo(() => {
    return AVAILABLE_LOCATIONS.filter((loc) => {
      if (locationFilter === 'all' && !(loc.isState || loc.isUT)) return false;
      if (locationFilter === 'states' && !loc.isState) return false;
      if (locationFilter === 'uts' && !loc.isUT) return false;
      if (locationFilter === 'global' && loc.country === 'India' && (loc.isState || loc.isUT)) return false;

      if (locationSearch.trim()) {
        const q = locationSearch.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.region.toLowerCase().includes(q) ||
          loc.country.toLowerCase().includes(q) ||
          loc.tag.toLowerCase().includes(q) ||
          loc.focus.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [locationFilter, locationSearch]);

  const isLocationActive = (loc: AvailableLocation) => {
    if (!context?.location?.name) return false;
    const curr = context.location.name.toLowerCase();
    return curr.includes(loc.name.toLowerCase()) || loc.name.toLowerCase().includes(curr);
  };

function matchesCategory(regionCategory: string, filter: string | null): boolean {
  if (!filter || filter === 'all' || filter === 'ALL') return true;
  const rcKey = resolveCategoryKey(regionCategory);
  const fKey = resolveCategoryKey(filter);
  return rcKey === fKey;
}

  // Calculate indicator counts strictly per canonical category
  const indicatorCounts = useMemo(() => {
    if (!context?.change_regions) return { deforestation: 0, water: 0, urban: 0, vegetation: 0, total: 0 };
    let deforest = 0, wat = 0, urb = 0, veg = 0;
    context.change_regions.forEach((r) => {
      const key = resolveCategoryKey(r.category);
      if (key === 'deforestation') deforest++;
      else if (key === 'water') wat++;
      else if (key === 'urban') urb++;
      else veg++;
    });
    return { 
      deforestation: deforest, 
      water: wat, 
      urban: urb, 
      vegetation: veg, 
      total: context.change_regions.length 
    };
  }, [context]);

  // Organize and de-clutter indicators: smart spatial de-duplication to prevent overlapping markers
  const placedIndicators = useMemo(() => {
    if (!context?.change_regions || !context.location?.bounding_box) return [];
    const [w, s, e, n] = context.location.bounding_box;
    const pad = 0.08;

    const filtered = context.change_regions
      .filter((r) => {
        if (!matchesCategory(r.category, filteredCategory)) return false;
        // Verify hotspot centroid is strictly within active location bounding box
        const [lon, lat] = r.centroid;
        if (lon < w - pad || lon > e + pad || lat < s - pad || lat > n + pad) return false;
        // Verify location_id if present
        if (r.location_id && context.location.id && r.location_id !== context.location.id) return false;
        return true;
      })
      .sort((a, b) => b.area_hectares - a.area_hectares);

    const minDistanceDegrees = 0.012; // ~1.3 km minimum distance between pins to prevent crowding
    const placed: typeof filtered = [];

    for (const region of filtered) {
      if (placed.length >= 8) break; // Keep map clean and breathable with top 8 prominent spots
      const [lon, lat] = region.centroid;
      const tooClose = placed.some((p) => {
        const [pLon, pLat] = p.centroid;
        const dLon = lon - pLon;
        const dLat = lat - pLat;
        return Math.sqrt(dLon * dLon + dLat * dLat) < minDistanceDegrees;
      });
      if (!tooClose) {
        placed.push(region);
      }
    }
    return placed;
  }, [context, filteredCategory]);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const VITE_CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || '';
    const esriSatelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const cartoLabelsUrl = `https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png?key=${VITE_CARTO_API_KEY}`;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'satellite-base': {
            type: 'raster',
            tiles: [esriSatelliteUrl],
            tileSize: 256,
            maxzoom: 19,
            attribution: 'Esri, Maxar, Earthstar Geographics',
          },
          'carto-labels': {
            type: 'raster',
            tiles: [cartoLabelsUrl],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'satellite-base-layer',
            type: 'raster',
            source: 'satellite-base',
            minzoom: 0,
            maxzoom: 20,
          },
          {
            id: 'carto-labels-layer',
            type: 'raster',
            source: 'carto-labels',
            minzoom: 0,
            maxzoom: 20,
            paint: {
              'raster-opacity': showAreaNames ? 1.0 : 0.0,
            },
          },
        ],
      },
      center: context ? [context.location.longitude, context.location.latitude] : [83.292, 17.693],
      zoom: context ? 12 : 3,
      scrollZoom: true,
      boxZoom: true,
      dragRotate: false,
      dragPan: true,
      keyboard: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('mousemove', (e) => {
      setMouseCoords({
        lon: Number(e.lngLat.lng.toFixed(5)),
        lat: Number(e.lngLat.lat.toFixed(5)),
      });
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      areaMarkersRef.current.forEach((m) => m.remove());
      map.remove();
    };
  }, []);

  // Update map center & layers when context changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !context) return;

    const bbox = context.location.bounding_box; // [west, south, east, north]
    map.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      { padding: 40, duration: 1800 }
    );

    // Setup sources and layers when map style is loaded
    const updateLayers = () => {
      const layers = context.visual_layers;

      // 1. AOI Outline Source
      const aoiGeoJSON = context.location.geometry || {
        type: 'Polygon',
        coordinates: [
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[1]],
            [bbox[2], bbox[3]],
            [bbox[0], bbox[3]],
            [bbox[0], bbox[1]],
          ],
        ],
      };

      if (map.getSource('aoi-boundary')) {
        (map.getSource('aoi-boundary') as maplibregl.GeoJSONSource).setData(aoiGeoJSON as any);
      } else {
        map.addSource('aoi-boundary', {
          type: 'geojson',
          data: aoiGeoJSON as any,
        });
        map.addLayer({
          id: 'aoi-boundary-line',
          type: 'line',
          source: 'aoi-boundary',
          paint: {
            'line-color': '#00f0ff',
            'line-width': 2,
            'line-dasharray': [3, 2],
          },
        });
      }

      // 2. Before Imagery Raster (coordinates: [top-left, top-right, bottom-right, bottom-left])
      const imgCoordinates: [[number, number], [number, number], [number, number], [number, number]] = [
        [bbox[0], bbox[3]], // NW
        [bbox[2], bbox[3]], // NE
        [bbox[2], bbox[1]], // SE
        [bbox[0], bbox[1]], // SW
      ];

      // 2. Before Imagery Raster (coordinates: [top-left, top-right, bottom-right, bottom-left])
      const beforeUrl = fromImageData?.imageUrl || layers.before_rgb;
      if (beforeUrl) {
        if (map.getSource('before-imagery')) {
          map.removeLayer('before-imagery-layer');
          map.removeSource('before-imagery');
        }
        map.addSource('before-imagery', {
          type: 'image',
          url: beforeUrl,
          coordinates: imgCoordinates,
        });
        map.addLayer({
          id: 'before-imagery-layer',
          type: 'raster',
          source: 'before-imagery',
          paint: {
            'raster-opacity': 1.0,
            'raster-resampling': 'linear',
          },
        });
      }

      // 3. After Imagery Raster (or specific selected To Year satellite image)
      const afterUrl = toImageData?.imageUrl || layers.after_rgb;
      if (afterUrl) {
        if (map.getSource('after-imagery')) {
          map.removeLayer('after-imagery-layer');
          map.removeSource('after-imagery');
        }
        map.addSource('after-imagery', {
          type: 'image',
          url: afterUrl,
          coordinates: imgCoordinates,
        });
        const beforeLayerId = map.getLayer('aoi-boundary-line') ? 'aoi-boundary-line' : (map.getLayer('change-polygons-fill') ? 'change-polygons-fill' : undefined);
        map.addLayer({
          id: 'after-imagery-layer',
          type: 'raster',
          source: 'after-imagery',
          paint: {
            'raster-opacity': 1.0,
            'raster-resampling': 'linear',
          },
        }, beforeLayerId);
      }

      // 4. Change Heatmap Raster
      if (layers.change_heatmap) {
        if (map.getSource('heatmap-imagery')) {
          map.removeLayer('heatmap-imagery-layer');
          map.removeSource('heatmap-imagery');
        }
        map.addSource('heatmap-imagery', {
          type: 'image',
          url: layers.change_heatmap,
          coordinates: imgCoordinates,
        });
        const beforeLayerId = map.getLayer('aoi-boundary-line') ? 'aoi-boundary-line' : (map.getLayer('change-polygons-fill') ? 'change-polygons-fill' : undefined);
        map.addLayer({
          id: 'heatmap-imagery-layer',
          type: 'raster',
          source: 'heatmap-imagery',
          paint: {
            'raster-opacity': showHeatmap ? 0.75 : 0.0,
          },
        }, beforeLayerId);
      }

      // 5. Change Polygons GeoJSON Source
      const polygonFeatures = context.change_regions
        .filter((r) => matchesCategory(r.category, filteredCategory))
        .map((r) => ({
          type: 'Feature',
          id: r.id,
          geometry: r.geometry,
          properties: {
            id: r.id,
            category: r.category,
            user_label: r.user_label,
            color: (
              r.category.toLowerCase().includes('gain') || 
              r.user_label.toLowerCase().includes('regrowth') || 
              r.user_label.toLowerCase().includes('growth') || 
              (r.category.toLowerCase().includes('veg') && !r.category.toLowerCase().includes('loss') && !r.category.toLowerCase().includes('deforest')) ||
              r.delta_ndvi > 0.05
            ) ? '#10b981' : getCategoryColor(r.category),
            area_ha: r.area_hectares,
            delta_ndvi: r.delta_ndvi,
            delta_ndbi: r.delta_ndbi,
            confidence: r.confidence_pct,
            highlighted: highlightedRegionIds ? highlightedRegionIds.includes(r.id) : false,
          },
        }));

      const geojsonData = {
        type: 'FeatureCollection',
        features: polygonFeatures,
      };

      if (map.getSource('change-polygons')) {
        (map.getSource('change-polygons') as maplibregl.GeoJSONSource).setData(geojsonData as any);
      } else {
        map.addSource('change-polygons', {
          type: 'geojson',
          data: geojsonData as any,
        });

        // Polygon Fill
        map.addLayer({
          id: 'change-polygons-fill',
          type: 'fill',
          source: 'change-polygons',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': [
              'case',
              ['boolean', ['get', 'highlighted'], false],
              0.8,
              0.45,
            ],
          },
        });

        // Polygon Outline
        map.addLayer({
          id: 'change-polygons-line',
          type: 'line',
          source: 'change-polygons',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': [
              'case',
              ['boolean', ['get', 'highlighted'], false],
              3.5,
              1.8,
            ],
          },
        });

        // Click Polygon Handler
        map.on('click', 'change-polygons-fill', (e) => {
          if (drawModeRef.current !== 'none') return;
          if (!e.features || e.features.length === 0) return;
          const clickedId = e.features[0].properties.id;
          const match = context.change_regions.find((r) => r.id === clickedId);
          if (match) {
            onSelectRegion(match);
          }
        });

        // Cursor Pointer on hover
        map.on('mouseenter', 'change-polygons-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'change-polygons-fill', () => {
          map.getCanvas().style.cursor = '';
        });
      }

      // Ensure Carto Labels layer is present and moved above satellite raster imagery
      const VITE_CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || '';
      const cartoLabelsUrl = `https://basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png?key=${VITE_CARTO_API_KEY}`;
      if (!map.getSource('carto-labels')) {
        map.addSource('carto-labels', {
          type: 'raster',
          tiles: [cartoLabelsUrl],
          tileSize: 256,
        });
      }
      if (!map.getLayer('carto-labels-layer')) {
        map.addLayer({
          id: 'carto-labels-layer',
          type: 'raster',
          source: 'carto-labels',
          minzoom: 0,
          maxzoom: 20,
          paint: {
            'raster-opacity': showAreaNames ? 0.55 : 0.0,
          },
        });
      }

      // Custom Drawn AOI Layers
      if (!map.getSource('custom-aoi-source')) {
        map.addSource('custom-aoi-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });
      }
      if (!map.getLayer('custom-aoi-fill')) {
        map.addLayer({
          id: 'custom-aoi-fill',
          type: 'fill',
          source: 'custom-aoi-source',
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.22,
          },
        });
      }
      if (!map.getLayer('custom-aoi-line')) {
        map.addLayer({
          id: 'custom-aoi-line',
          type: 'line',
          source: 'custom-aoi-source',
          paint: {
            'line-color': '#2563eb',
            'line-width': 2.5,
            'line-dasharray': [3, 2],
          },
        });
      }

      // Guarantee labels and vector layers always render above raster imagery
      if (map.getLayer('carto-labels-layer')) {
        map.moveLayer('carto-labels-layer');
        map.setPaintProperty('carto-labels-layer', 'raster-opacity', showAreaNames ? 0.55 : 0.0);
      }
      if (map.getLayer('change-polygons-fill')) map.moveLayer('change-polygons-fill');
      if (map.getLayer('change-polygons-line')) map.moveLayer('change-polygons-line');
      if (map.getLayer('aoi-boundary-line')) map.moveLayer('aoi-boundary-line');
      if (map.getLayer('custom-aoi-fill')) map.moveLayer('custom-aoi-fill');
      if (map.getLayer('custom-aoi-line')) map.moveLayer('custom-aoi-line');
    };

    if (map.isStyleLoaded()) {
      updateLayers();
    } else {
      map.once('styledata', updateLayers);
    }
  }, [context, filteredCategory, highlightedRegionIds, fromImageData, toImageData]);

  // Resize MapLibre GL smoothly whenever layout or maximize state changes
  useEffect(() => {
    if (mapRef.current) {
      const t1 = setTimeout(() => mapRef.current?.resize(), 50);
      const t2 = setTimeout(() => mapRef.current?.resize(), 150);
      const t3 = setTimeout(() => mapRef.current?.resize(), 300);
      const t4 = setTimeout(() => mapRef.current?.resize(), 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isMapMaximized]);

  // Spherical Geodesic Hectare & Coordinate Generators
  function calculatePolygonAreaHectares(coords: [number, number][]): number {
    if (!coords || coords.length < 3) return 0;
    const RADIUS = 6378137;
    let area = 0;
    const len = coords.length;
    for (let i = 0; i < len; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % len];
      const radX1 = (p1[0] * Math.PI) / 180;
      const radY1 = (p1[1] * Math.PI) / 180;
      const radX2 = (p2[0] * Math.PI) / 180;
      const radY2 = (p2[1] * Math.PI) / 180;
      area += (radX2 - radX1) * (2 + Math.sin(radY1) + Math.sin(radY2));
    }
    area = Math.abs((area * RADIUS * RADIUS) / 2.0);
    return Math.max(0.1, Number((area / 10000).toFixed(1)));
  }

  function generateRectangleCoordinates(p1: [number, number], p2: [number, number]): [number, number][] {
    const minX = Math.min(p1[0], p2[0]);
    const maxX = Math.max(p1[0], p2[0]);
    const minY = Math.min(p1[1], p2[1]);
    const maxY = Math.max(p1[1], p2[1]);
    return [
      [minX, minY],
      [maxX, minY],
      [maxX, maxY],
      [minX, maxY],
      [minX, minY]
    ];
  }

  function generateCircleCoordinates(center: [number, number], edgePoint: [number, number], points: number = 36): [number, number][] {
    const [clon, clat] = center;
    const [elon, elat] = edgePoint;
    const dLat = ((elat - clat) * Math.PI) / 180;
    const dLon = ((elon - clon) * Math.PI) / 180;
    const lat1 = (clat * Math.PI) / 180;
    const lat2 = (elat * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const radiusMeters = Math.max(50, 6378137 * c);

    const coords: [number, number][] = [];
    const latRadius = (radiusMeters / 6378137) * (180 / Math.PI);
    const lonRadius = latRadius / Math.cos((clat * Math.PI) / 180);

    for (let i = 0; i <= points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const lon = clon + lonRadius * Math.cos(angle);
      const lat = clat + latRadius * Math.sin(angle);
      coords.push([Number(lon.toFixed(6)), Number(lat.toFixed(6))]);
    }
    return coords;
  }

  // Handle Map Drawing Events (Rectangle, Circle, Polygon)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (drawMode === 'none') {
      map.getCanvas().style.cursor = '';
      map.doubleClickZoom.enable();
      return;
    }

    map.getCanvas().style.cursor = 'crosshair';
    map.doubleClickZoom.disable();

    const updateLayerData = (coords: [number, number][]) => {
      if (!map.getSource('custom-aoi-source')) return;
      const src = map.getSource('custom-aoi-source') as maplibregl.GeoJSONSource;
      if (coords.length >= 3) {
        src.setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords],
          },
          properties: {},
        });
      } else {
        src.setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    };

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const pt: [number, number] = [Number(e.lngLat.lng.toFixed(6)), Number(e.lngLat.lat.toFixed(6))];

      if (drawModeRef.current === 'rectangle') {
        if (!drawingStartRef.current) {
          drawingStartRef.current = pt;
          setIsDrawing(true);
        } else {
          const rect = generateRectangleCoordinates(drawingStartRef.current, pt);
          setDrawnCoordinates(rect);
          setCustomAoiHectares(calculatePolygonAreaHectares(rect));
          updateLayerData(rect);
          drawingStartRef.current = null;
          setIsDrawing(false);
          setDrawMode('none');
          setDrawMenuOpen(false);
        }
      } else if (drawModeRef.current === 'circle') {
        if (!drawingStartRef.current) {
          drawingStartRef.current = pt;
          setIsDrawing(true);
        } else {
          const circ = generateCircleCoordinates(drawingStartRef.current, pt);
          setDrawnCoordinates(circ);
          setCustomAoiHectares(calculatePolygonAreaHectares(circ));
          updateLayerData(circ);
          drawingStartRef.current = null;
          setIsDrawing(false);
          setDrawMode('none');
          setDrawMenuOpen(false);
        }
      } else if (drawModeRef.current === 'polygon') {
        const next = [...polyVerticesRef.current, pt];
        polyVerticesRef.current = next;
        setPolyVertices(next);
        if (next.length >= 3) {
          const closed = [...next, next[0]];
          updateLayerData(closed);
          setCustomAoiHectares(calculatePolygonAreaHectares(closed));
        }
      }
    };

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      if (drawModeRef.current === 'rectangle' && drawingStartRef.current) {
        const rect = generateRectangleCoordinates(drawingStartRef.current, pt);
        updateLayerData(rect);
        setCustomAoiHectares(calculatePolygonAreaHectares(rect));
      } else if (drawModeRef.current === 'circle' && drawingStartRef.current) {
        const circ = generateCircleCoordinates(drawingStartRef.current, pt);
        updateLayerData(circ);
        setCustomAoiHectares(calculatePolygonAreaHectares(circ));
      } else if (drawModeRef.current === 'polygon' && polyVerticesRef.current.length > 0) {
        const preview = [...polyVerticesRef.current, pt, polyVerticesRef.current[0]];
        updateLayerData(preview);
      }
    };

    const handleDblClick = (e: maplibregl.MapMouseEvent) => {
      e.preventDefault();
      if (drawModeRef.current === 'polygon' && polyVerticesRef.current.length >= 3) {
        const pts = [...polyVerticesRef.current];
        if (pts.length > 3) {
          pts.pop(); // Remove duplicate point created right before dblclick
        }
        const closed = [...pts, pts[0]];
        setDrawnCoordinates(closed);
        setCustomAoiHectares(calculatePolygonAreaHectares(closed));
        updateLayerData(closed);
        polyVerticesRef.current = [];
        setPolyVertices([]);
        setDrawMode('none');
        setDrawMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancelDrawing();
      }
    };

    map.on('click', handleClick);
    map.on('mousemove', handleMouseMove);
    map.on('dblclick', handleDblClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      map.off('click', handleClick);
      map.off('mousemove', handleMouseMove);
      map.off('dblclick', handleDblClick);
      window.removeEventListener('keydown', handleKeyDown);
      map.getCanvas().style.cursor = '';
      map.doubleClickZoom.enable();
    };
  }, [drawMode]);

  const handleFinishPolygon = () => {
    const pts = polyVerticesRef.current.length >= 3 ? polyVerticesRef.current : polyVertices;
    if (pts.length >= 3) {
      const closed = [...pts, pts[0]];
      setDrawnCoordinates(closed);
      setCustomAoiHectares(calculatePolygonAreaHectares(closed));
      polyVerticesRef.current = [];
      setPolyVertices([]);
      setDrawMode('none');
      setDrawMenuOpen(false);
    }
  };

  const handleClearDrawnAoi = () => {
    setDrawnCoordinates([]);
    setCustomAoiHectares(0);
    drawingStartRef.current = null;
    polyVerticesRef.current = [];
    setPolyVertices([]);
    setIsDrawing(false);
    const map = mapRef.current;
    if (map && map.getSource('custom-aoi-source')) {
      (map.getSource('custom-aoi-source') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  };

  const handleCancelDrawing = () => {
    handleClearDrawnAoi();
    setDrawMode('none');
    setDrawMenuOpen(false);
    if (mapRef.current) {
      mapRef.current.doubleClickZoom.enable();
      mapRef.current.getCanvas().style.cursor = '';
    }
  };

  const handleAnalyzeDrawnAoi = () => {
    if (drawnCoordinates.length >= 3 && onAnalyzeCustomAoi) {
      const geojson = {
        type: 'Polygon',
        coordinates: [drawnCoordinates],
      };
      onAnalyzeCustomAoi(geojson, customAoiHectares);
    }
  };

  // Manage on-map indicator markers & click popups (Clean, Aligned, Organized)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up existing markers & popups
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    if (!showIndicators || !context || !context.change_regions || placedIndicators.length === 0) return;

    placedIndicators.forEach((region, idx) => {
      const isSelected = selectedRegion?.id === region.id;
      const isHighlighted = highlightedRegionIds ? highlightedRegionIds.includes(region.id) : false;
      const catLow = region.category.toLowerCase();
      const labelLow = region.user_label.toLowerCase();
      const isVeg = (
        catLow.includes('gain') || 
        labelLow.includes('regrowth') || 
        labelLow.includes('growth') || 
        labelLow.includes('crop') || 
        labelLow.includes('green') || 
        (catLow.includes('veg') && !catLow.includes('loss') && !catLow.includes('deforest')) ||
        region.delta_ndvi > 0.04
      );
      const isDeforest = (
        catLow.includes('deforest') ||
        catLow.includes('loss') ||
        labelLow.includes('loss') ||
        region.delta_ndvi < -0.08
      );
      const config = isVeg 
        ? CATEGORY_COLOR_SYSTEM.vegetation 
        : (isDeforest ? CATEGORY_COLOR_SYSTEM.deforestation : getCategoryConfig(region.category));
      const canonicalColor = config.color;

      // Create indicator DOM container
      const el = document.createElement('div');
      el.className = `satquery-map-indicator ${isSelected || isHighlighted ? 'active' : ''} ${drawMode !== 'none' ? 'pointer-events-none opacity-40' : ''}`;
      el.style.setProperty('--indicator-color', canonicalColor);
      el.style.setProperty('--indicator-glow', `${canonicalColor}77`);

      const haText = region.area_hectares < 100 
        ? `${region.area_hectares.toFixed(1)} ha` 
        : `${Math.round(region.area_hectares).toLocaleString()} ha`;

      const severity = calculateHotspotSeverity(region.area_hectares, region.delta_ndvi, region.delta_ndbi || 0);

      // Clean, organized color-based indicator capsule with category and mathematical severity badge (NO random numbers)
      el.innerHTML = `
        <div class="indicator-capsule" title="${config.shortLabel}: ${region.user_label} (${haText}) — Severity: ${severity.level} — Click to inspect">
          <span class="indicator-capsule-dot" style="background:${canonicalColor}; box-shadow:0 0 6px ${canonicalColor};"></span>
          <span class="indicator-capsule-label">${config.shortLabel}</span>
          <span class="indicator-capsule-severity" style="color: ${severity.color}; background: ${severity.bg}; border: 1px solid ${severity.border};">${severity.level}</span>
          <span class="indicator-capsule-ha">${haText}</span>
        </div>
      `;

      // Click: ONLY open alert card when explicitly pressed/clicked
      el.addEventListener('click', (e) => {
        if (drawModeRef.current !== 'none') return;
        e.stopPropagation();

        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }

        onSelectRegion(region);

        const isDark = document.documentElement.classList.contains('dark');
        const cardBg = isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)';
        const titleColor = isDark ? '#ffffff' : '#0f172a';
        const subColor = isDark ? '#cbd5e1' : '#475569';
        const metaBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
        const metaBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
        const closeColor = isDark ? '#94a3b8' : '#64748b';

        const popupHtml = `
          <div style="background: ${cardBg}; border: 1.5px solid ${canonicalColor}; border-radius: 14px; padding: 14px; min-width: 250px; color: ${titleColor}; box-shadow: 0 16px 40px rgba(0,0,0,0.25); backdrop-filter: blur(16px); font-family: Inter, sans-serif;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10.5px; font-weight: 800; color: ${canonicalColor}; text-transform: uppercase; letter-spacing: 0.06em; font-family: monospace;">${config.shortLabel.toUpperCase()}</span>
                <span style="font-size: 9px; font-weight: 800; color: ${severity.color}; background: ${severity.bg}; border: 1px solid ${severity.border}; padding: 1px 5px; border-radius: 4px; font-family: monospace;">${severity.level}</span>
              </div>
              <button id="close-ind-popup-${region.id}" style="background: none; border: none; color: ${closeColor}; font-size: 15px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Close">✕</button>
            </div>
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: ${titleColor}; line-height: 1.35;">${region.user_label}</div>
            <div style="font-size: 10px; color: ${subColor}; font-family: monospace; margin-bottom: 8px; line-height: 1.3;">${severity.criteria}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; font-family: monospace; background: ${metaBg}; padding: 7px; border-radius: 8px; border: 1px solid ${metaBorder}; margin-bottom: 8px;">
              <div>Area: <strong style="color: ${canonicalColor};">${haText}</strong></div>
              <div>ΔNDVI: <strong style="color: ${region.delta_ndvi < 0 ? '#ef4444' : '#10b981'};">${region.delta_ndvi > 0 ? '+' : ''}${region.delta_ndvi.toFixed(3)}</strong></div>
            </div>
            <div style="font-size: 10.5px; color: ${subColor}; margin-bottom: 10px; line-height: 1.4;">${region.simple_explanation || region.technical_evidence || ''}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: ${closeColor}; font-family: monospace; padding-top: 6px; border-top: 1px solid ${metaBorder};">
              <span>Confidence: <strong style="color: #10b981;">${region.confidence_pct}%</strong></span>
              <span style="color: ${canonicalColor}; font-weight: 700;">ACTIVE HOTSPOT</span>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 16,
          closeButton: false,
          closeOnClick: true,
        })
          .setLngLat(region.centroid)
          .setHTML(popupHtml)
          .addTo(map);

        popupRef.current = popup;

        // Close button listener
        setTimeout(() => {
          const closeBtn = document.getElementById(`close-ind-popup-${region.id}`);
          if (closeBtn) {
            closeBtn.onclick = (ce) => {
              ce.stopPropagation();
              if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
              }
            };
          }
        }, 50);

        map.flyTo({
          center: region.centroid,
          zoom: 14.5,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(region.centroid)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [context, showIndicators, placedIndicators, selectedRegion, highlightedRegionIds]);

  // Manage Area Names & Place Labels overlay on satellite map (Organized, spaced, non-overlapping)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Toggle Carto labels raster layer opacity on satellite imagery (soft, non-intrusive)
    if (map.isStyleLoaded() && map.getLayer('carto-labels-layer')) {
      map.setPaintProperty('carto-labels-layer', 'raster-opacity', showAreaNames ? 0.55 : 0.0);
    }

    // 2. Clean up previous area badges
    areaMarkersRef.current.forEach((m) => m.remove());
    areaMarkersRef.current = [];

    if (!showAreaNames || !context) return;

    // A. Main AOI Representation Badge (pinned cleanly near top center of AOI with safe margin)
    const bbox = context.location.bounding_box;
    const aoiTopCenter: [number, number] = [
      (bbox[0] + bbox[2]) / 2,
      bbox[3] - (bbox[3] - bbox[1]) * 0.04, // clean safe inset from top boundary
    ];

    const aoiBadgeEl = document.createElement('div');
    aoiBadgeEl.className = 'satquery-area-badge';
    aoiBadgeEl.title = `${context.location.name} (${Math.round(context.total_aoi_hectares || 0).toLocaleString()} ha) — Click to frame AOI`;
    aoiBadgeEl.innerHTML = `
      <span class="satquery-badge-dot"></span>
      <span class="satquery-badge-name">${context.location.name}</span>
      <span class="satquery-badge-ha">
        ${Math.round(context.total_aoi_hectares || 0).toLocaleString()} HA
      </span>
    `;
    aoiBadgeEl.addEventListener('click', () => {
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 40, duration: 1200 }
      );
    });

    const aoiMarker = new maplibregl.Marker({
      element: aoiBadgeEl,
      anchor: 'top',
    })
      .setLngLat(aoiTopCenter)
      .addTo(map);

    areaMarkersRef.current.push(aoiMarker);

    // B. Real Specific Places & Landmarks: Max 4, spatially spaced, avoiding overlap
    const isDarkMode = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    const rawPlaces = context.location.landmarks || [];

    // Filter to at most 4 places with minimum spatial separation so names never crowd
    const minSeparation = Math.max(
      (bbox[2] - bbox[0]) * 0.18,
      (bbox[3] - bbox[1]) * 0.18
    );
    const spacedPlaces: typeof rawPlaces = [];

    for (const place of rawPlaces) {
      if (spacedPlaces.length >= 4) break;
      const isCloseToExisting = spacedPlaces.some((sp) => {
        const dx = sp.longitude - place.longitude;
        const dy = sp.latitude - place.latitude;
        return Math.sqrt(dx * dx + dy * dy) < minSeparation;
      });
      // Also ensure distance from the AOI top center badge
      const dToAoiTop = Math.sqrt(
        Math.pow(place.longitude - aoiTopCenter[0], 2) +
        Math.pow(place.latitude - aoiTopCenter[1], 2)
      );
      if (!isCloseToExisting && dToAoiTop > minSeparation * 0.5) {
        spacedPlaces.push(place);
      }
    }

    spacedPlaces.forEach((place) => {
      const placeBadgeEl = document.createElement('div');
      placeBadgeEl.className = 'satquery-place-badge';
      const catLabel = place.category || 'landmark';
      placeBadgeEl.title = `${place.name} (${catLabel}) — Click to zoom`;

      const dotColor = place.category === 'waterbody' 
        ? '#0284c7' 
        : place.category === 'suburb' 
        ? (isDarkMode ? '#a78bfa' : '#7c3aed') 
        : (isDarkMode ? '#38bdf8' : '#2563eb');

      placeBadgeEl.innerHTML = `
        <span class="satquery-place-dot" style="background:${dotColor}; box-shadow: 0 0 5px ${dotColor};"></span>
        <span class="satquery-place-name">${place.name}</span>
      `;

      placeBadgeEl.addEventListener('click', () => {
        map.flyTo({
          center: [place.longitude, place.latitude],
          zoom: 14.8,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      const placeMarker = new maplibregl.Marker({
        element: placeBadgeEl,
        anchor: 'center',
      })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      areaMarkersRef.current.push(placeMarker);
    });
  }, [showAreaNames, context, theme]);

  // Update polygon visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('change-polygons-fill')) {
      map.setLayoutProperty('change-polygons-fill', 'visibility', showPolygons ? 'visible' : 'none');
    }
    if (map.getLayer('change-polygons-line')) {
      map.setLayoutProperty('change-polygons-line', 'visibility', showPolygons ? 'visible' : 'none');
    }
    if (map.getLayer('heatmap-imagery-layer')) {
      map.setPaintProperty('heatmap-imagery-layer', 'raster-opacity', showHeatmap ? 0.75 : 0.0);
    }
  }, [showPolygons, showHeatmap]);



  // Smooth camera flyTo on region selection or AI zoom target
  // Strict rule: SELECTED LOCATION !== SELECTED HOTSPOT.
  // Never fly camera outside the active location's bounding box.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !context?.location?.bounding_box) return;

    const [w, s, e, n] = context.location.bounding_box;
    const pad = 0.08;

    if (zoomTarget) {
      const [zLon, zLat] = [zoomTarget[0], zoomTarget[1]];
      // Verify zoomTarget is inside the active location bounds before flying
      if (zLon >= w - pad && zLon <= e + pad && zLat >= s - pad && zLat <= n + pad) {
        map.flyTo({
          center: [zLon, zLat],
          zoom: zoomTarget[2] || 14.2,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      } else {
        console.warn('MapViewer: blocked camera flyTo to stale zoomTarget outside active location bounds:', zoomTarget);
      }
    } else if (selectedRegion) {
      const [rLon, rLat] = selectedRegion.centroid;
      if (rLon >= w - pad && rLon <= e + pad && rLat >= s - pad && rLat <= n + pad) {
        map.flyTo({
          center: [rLon, rLat],
          zoom: 14.2,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      } else {
        console.warn('MapViewer: blocked camera flyTo to selectedRegion outside active location bounds:', selectedRegion);
      }
    }
  }, [selectedRegion, zoomTarget, context]);

  // Zoom control helpers
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn({ duration: 250 });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut({ duration: 250 });
    }
  };

  const handleResetView = () => {
    if (mapRef.current && context) {
      const bbox = context.location.bounding_box;
      mapRef.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 40, duration: 800 }
      );
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-100 dark:bg-zinc-950">
      {/* Primary Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />



      {/* On-Map Observation Telemetry HUD Indicator Bar */}
      {context && (
        <div className={`absolute top-4 left-4 ${locationDropdownOpen ? 'z-50' : 'z-20'} flex flex-col space-y-1.5 pointer-events-none max-w-[calc(100%-120px)]`}>
          {/* Top Status & Scale Indicator Badge */}
          <div className="relative px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-zinc-800 shadow-xl backdrop-blur-xl flex items-center space-x-3 pointer-events-auto text-slate-800 dark:text-slate-100 z-50">
            {/* Interactive Location Name & Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className={`group flex items-center space-x-2 px-2.5 py-1 -my-1 rounded-xl transition-all border cursor-pointer select-none ${
                  locationDropdownOpen
                    ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700/80 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-transparent hover:bg-slate-100/90 dark:hover:bg-zinc-800/80 border-transparent hover:border-slate-200 dark:hover:border-zinc-700'
                }`}
                title="Click to select another satellite observation location"
                aria-haspopup="true"
                aria-expanded={locationDropdownOpen}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="font-telemetry font-bold text-xs uppercase tracking-wider truncate max-w-[130px] sm:max-w-[200px] text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {context.location.name}
                </span>
                <span className="text-[9.5px] font-telemetry px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 uppercase font-semibold shrink-0">
                  {context.location.location_type || 'AOI'}
                </span>

                {/* Clear Dropdown Arrow immediately beside location name */}
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 group-hover:bg-blue-100 dark:bg-zinc-800 dark:group-hover:bg-blue-950 text-slate-600 group-hover:text-blue-600 dark:text-zinc-300 dark:group-hover:text-blue-400 transition-all shrink-0 ml-0.5">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${locationDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                </span>

                {isAnalyzing && (
                  <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin shrink-0 ml-1" />
                )}
              </button>

              {/* Floating Location Dropdown Menu */}
              {locationDropdownOpen && (
                <div
                  ref={locationDropdownRef}
                  className="absolute top-full left-0 mt-2 z-50 w-88 sm:w-[440px] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl backdrop-blur-2xl p-3.5 font-sans animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100 pointer-events-auto"
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Globe2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <span>India-Wide Satellite Registry</span>
                          <span className="text-[10px] font-normal text-slate-400">🇮🇳</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-telemetry">
                          All 28 States &amp; 8 Union Territories
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 font-semibold">
                      {filteredLocations.length} Places
                    </span>
                  </div>

                  {/* Search Filter Bar */}
                  <div className="relative mb-2.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      placeholder="Search any State, UT, capital, or landmark..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-sans"
                      autoFocus
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center space-x-1 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'all', label: 'All India (36)' },
                      { id: 'states', label: 'States (28)' },
                      { id: 'uts', label: 'Union Territories (8)' },
                      { id: 'global', label: 'Global (6)' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLocationFilter(tab.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono whitespace-nowrap transition-all cursor-pointer ${
                          locationFilter === tab.id
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Locations Scroll List */}
                  <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredLocations.map((loc) => {
                      const isActive = isLocationActive(loc);
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            if (!isAnalyzing && onSelectLocation) {
                              onSelectLocation(loc.query);
                              setLocationDropdownOpen(false);
                            }
                          }}
                          disabled={isAnalyzing}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                            isActive
                              ? 'bg-blue-50/90 dark:bg-blue-950/50 border border-blue-400 dark:border-blue-700 shadow-xs'
                              : 'hover:bg-slate-50 dark:hover:bg-zinc-800/80 border border-transparent'
                          } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <img
                              src={loc.thumbnail}
                              alt={loc.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0 shadow-xs"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {loc.name}
                                </span>
                                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold shrink-0 ${
                                  loc.isState
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : loc.isUT
                                    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                                }`}>
                                  {loc.tag}
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 truncate flex items-center space-x-1 mt-0.5">
                                <span>{loc.flag}</span>
                                <span className="font-medium text-slate-600 dark:text-zinc-300">{loc.region}</span>
                                <span>•</span>
                                <span className="truncate">{loc.focus}</span>
                              </div>
                            </div>
                          </div>

                          {isActive ? (
                            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-500/20 px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0 ml-2 border border-blue-200 dark:border-blue-500/30">
                              <Check className="w-3 h-3" />
                              <span>CURRENT</span>
                            </span>
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}

                    {filteredLocations.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                        No locations match "{locationSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-3 w-px bg-slate-200 dark:bg-zinc-700 hidden sm:block" />

            <div className="hidden sm:flex items-center space-x-3 text-[11px] font-telemetry text-slate-600 dark:text-slate-300">
              <span title="Total AOI Area">
                📐 <strong className="text-slate-900 dark:text-white">{context.total_aoi_hectares.toLocaleString()} ha</strong>
              </span>
              <span title="Satellite Sensor">
                🛰️ <span className="text-slate-500 dark:text-slate-400">Sentinel-2 (10m)</span>
              </span>
              <span title="Active Detected Change Indicators">
                📍 <strong className="text-blue-600 dark:text-blue-400">{indicatorCounts.total}</strong> Indicators on Map
              </span>
            </div>
          </div>

          {/* Temporal Baseline & Observation Strip - Hidden when location dropdown is open so it NEVER overlaps */}
          {!locationDropdownOpen && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] font-telemetry text-slate-600 dark:text-slate-400 pointer-events-auto animate-in fade-in duration-150">
              {(fromYear || toYear) ? (
                <div className="px-3 py-1 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-blue-300 dark:border-blue-500/60 text-blue-700 dark:text-blue-300 shadow-md backdrop-blur-md flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>
                    PASSES: <strong className="text-slate-900 dark:text-white font-mono text-xs">{fromYear || (context.actual_before_date ? context.actual_before_date.slice(0, 4) : 2021)}</strong> {fromImageData ? `(${fromImageData.date})` : ''} ➔ <strong className="text-slate-900 dark:text-white font-mono text-xs">{toYear || (context.actual_after_date ? context.actual_after_date.slice(0, 4) : 2026)}</strong> {toImageData ? `(${toImageData.date})` : ''}
                  </span>
                  {(isLoadingFromYear || isLoadingToYear) && (
                    <Activity className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  )}
                  {onResetYears && (
                    <button
                      type="button"
                      onClick={onResetYears}
                      className="ml-2 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/30 text-[10px] border border-rose-200 dark:border-rose-500/40 font-bold transition-all"
                      title="Return to initial analysis baseline vs comparative observation"
                    >
                      ✕ Reset View
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <span className="px-2 py-0.5 rounded-md bg-white/95 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Baseline:</span>
                    <strong className="text-slate-900 dark:text-white">{context.actual_before_date}</strong>
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono">➔</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/95 dark:bg-zinc-900/90 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-400 shadow-sm backdrop-blur-md flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    <span>Pass:</span>
                    <strong className="text-slate-900 dark:text-white">{context.actual_after_date}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/95 dark:bg-zinc-900/90 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-md hidden md:inline-flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>100% Usable Clear Pixels</span>
                  </span>
                </>
              )}
            </div>
          )}

          {/* Row 3: Category Color Legend Bar — Hidden when dropdown is open to ensure 100% clean view */}
          {!locationDropdownOpen && (
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-zinc-800 backdrop-blur-xl shadow-xl text-[11px] font-mono text-slate-700 dark:text-slate-300 pointer-events-auto animate-in fade-in duration-150">
              <span className="text-[10px] text-slate-400 uppercase px-2 font-bold font-telemetry">CATEGORIES:</span>

              {/* 1. Deforestation / Loss (Red #ef4444) */}
              <button
                type="button"
                onClick={() => onFilterCategory?.(filteredCategory === 'deforestation' ? null : 'deforestation')}
                className={`flex items-center space-x-2 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                  filteredCategory === 'deforestation' 
                    ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-700 font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-transparent'
                }`}
                title="Filter to Deforestation / Canopy Loss (Red)"
              >
                <div className="relative shrink-0">
                  <img 
                    src="/thumbnails/category_deforestation.jpg" 
                    alt="Deforestation" 
                    className="w-5 h-5 rounded-md object-cover border border-rose-500 shadow-xs" 
                  />
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white dark:ring-zinc-900" />
                </div>
                <span>Deforestation ({indicatorCounts.deforestation})</span>
              </button>

              {/* 2. Urban Growth / Construction (Orange #f97316) */}
              <button
                type="button"
                onClick={() => onFilterCategory?.(filteredCategory === 'urban' ? null : 'urban')}
                className={`flex items-center space-x-2 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                  filteredCategory === 'urban' 
                    ? 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-700 font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-transparent'
                }`}
                title="Filter to Urban Expansion & Construction (Orange)"
              >
                <div className="relative shrink-0">
                  <img 
                    src="/thumbnails/category_urban.jpg" 
                    alt="Urban Growth" 
                    className="w-5 h-5 rounded-md object-cover border border-orange-500 shadow-xs" 
                  />
                  <span className="w-2 h-2 rounded-full bg-orange-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white dark:ring-zinc-900" />
                </div>
                <span>Urban ({indicatorCounts.urban})</span>
              </button>

              {/* 3. Water Bodies / Hydrology (Blue #0284c7) */}
              <button
                type="button"
                onClick={() => onFilterCategory?.(filteredCategory === 'water' ? null : 'water')}
                className={`flex items-center space-x-2 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                  filteredCategory === 'water' 
                    ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-700 font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-transparent'
                }`}
                title="Filter to Water Bodies & Hydrology (Blue)"
              >
                <div className="relative shrink-0">
                  <img 
                    src="/thumbnails/category_water.jpg" 
                    alt="Water" 
                    className="w-5 h-5 rounded-md object-cover border border-blue-500 shadow-xs" 
                  />
                  <span className="w-2 h-2 rounded-full bg-blue-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white dark:ring-zinc-900" />
                </div>
                <span>Water ({indicatorCounts.water})</span>
              </button>

              {/* 4. Vegetation Growth / Regrowth (Green #10b981) */}
              <button
                type="button"
                onClick={() => onFilterCategory?.(filteredCategory === 'vegetation' ? null : 'vegetation')}
                className={`flex items-center space-x-2 px-2.5 py-1 rounded-xl transition-all cursor-pointer border ${
                  filteredCategory === 'vegetation' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700 font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-transparent'
                }`}
                title="Filter to Vegetation Regrowth & Crops (Green)"
              >
                <div className="relative shrink-0">
                  <img 
                    src="/thumbnails/category_regrowth.jpg" 
                    alt="Vegetation Regrowth" 
                    className="w-5 h-5 rounded-md object-cover border border-emerald-500 shadow-xs" 
                  />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1 ring-white dark:ring-zinc-900" />
                </div>
                <span>Vegetation ({indicatorCounts.vegetation})</span>
              </button>

              {filteredCategory && (
                <button
                  type="button"
                  onClick={() => onFilterCategory?.(null)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-slate-200 dark:border-zinc-700 ml-1"
                >
                  RESET
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Prominent Floating Exit Fullscreen Button in Top-Right when Maximized */}
      {isMapMaximized && onToggleMaximizeMap && (
        <div className="absolute top-4 right-4 z-50 animate-in fade-in duration-150">
          <button
            type="button"
            onClick={onToggleMaximizeMap}
            aria-label="Restore map"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold shadow-2xl border border-blue-400/60 backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Restore Map to Normal Studio Layout (Esc)"
          >
            <Minimize2 className="w-4 h-4 text-white" />
            <span>RESTORE MAP [ ↙ ]</span>
            <span className="hidden sm:inline text-[10px] opacity-80 font-normal">(ESC)</span>
          </button>
        </div>
      )}

      {/* Floating Zoom & Maximize Controls Toolbar */}
      <div className="absolute top-16 right-4 z-30 flex flex-col space-y-1 bg-white/95 dark:bg-zinc-900/95 p-1 rounded-2xl shadow-xl border border-slate-200/80 dark:border-zinc-800 backdrop-blur-xl">
        {onToggleMaximizeMap && (
          <button
            type="button"
            onClick={onToggleMaximizeMap}
            aria-label={isMapMaximized ? "Restore map" : "Maximize map"}
            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all ${
              isMapMaximized
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            title={isMapMaximized ? "Restore sidebars (Normal view)" : "Maximize Map Area (Full width & height)"}
          >
            {isMapMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={handleZoomIn}
          className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors"
          title="Reset View to AOI"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Draw AOI Tool Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDrawMenuOpen(!drawMenuOpen);
              if (drawMode !== 'none') {
                setDrawMode('none');
              }
            }}
            className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              drawMode !== 'none' || drawMenuOpen
                ? 'bg-blue-600 text-white shadow-md font-bold'
                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            title="Draw Area of Interest to Analyze (Rectangle, Circle, Polygon)"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Expanded Drawing Tools Menu */}
          {drawMenuOpen && (
            <div className="absolute top-0 right-10 z-40 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-1.5 flex items-center space-x-1 backdrop-blur-xl animate-in fade-in slide-in-from-right-2 duration-150">
              <button
                type="button"
                onClick={() => {
                  handleClearDrawnAoi();
                  setDrawMode('rectangle');
                  setDrawMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  drawMode === 'rectangle'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
                title="Draw Box / Rectangle AOI"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Box</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClearDrawnAoi();
                  setDrawMode('polygon');
                  setDrawMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  drawMode === 'polygon'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
                title="Draw Multi-point Polygon AOI"
              >
                <Shapes className="w-3.5 h-3.5" />
                <span>Poly</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClearDrawnAoi();
                  setDrawMode('circle');
                  setDrawMenuOpen(false);
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  drawMode === 'circle'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
                title="Draw Radius Circle AOI"
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Circle</span>
              </button>
              {drawnCoordinates.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    handleClearDrawnAoi();
                    setDrawMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Clear Drawn AOI"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Banner when Drawing is Active */}
      {drawMode !== 'none' && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl font-mono text-xs font-bold flex items-center space-x-3 backdrop-blur-xl">
          <div className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
          <span>
            {drawMode === 'rectangle' && 'Click 1st corner, then 2nd corner to box region'}
            {drawMode === 'circle' && 'Click center point, then click outer edge for circle'}
            {drawMode === 'polygon' && `Click points on map (${polyVertices.length} placed) · Double-click to complete`}
          </span>
          {drawMode === 'polygon' && polyVertices.length >= 3 && (
            <button
              type="button"
              onClick={handleFinishPolygon}
              className="px-2.5 py-0.5 rounded-lg bg-white text-blue-700 hover:bg-blue-50 text-[11px] font-bold shadow-xs cursor-pointer"
            >
              Complete
            </button>
          )}
          <button
            type="button"
            onClick={handleCancelDrawing}
            className="text-white/80 hover:text-white cursor-pointer ml-1 text-sm font-bold"
            title="Cancel Drawing (Esc)"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Action Banner when Custom AOI is Drawn */}
      {drawnCoordinates.length >= 3 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-zinc-900/95 border border-blue-500/60 rounded-2xl shadow-2xl p-3 sm:px-4 flex items-center space-x-3 sm:space-x-4 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center space-x-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase font-semibold">SELECTED AOI</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                ~{customAoiHectares.toLocaleString()} Hectares
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeDrawnAoi}
            disabled={isAnalyzing}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'ANALYZING...' : 'ANALYZE SELECTED REGION'}</span>
          </button>
          <button
            type="button"
            onClick={handleClearDrawnAoi}
            className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/40 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            title="Clear drawn area"
          >
            Clear
          </button>
        </div>
      )}

      {/* Prominent "EXPLAIN THIS MAP" Button */}
      <div className="absolute top-4 right-16 z-20 hidden md:block">
        <button
          type="button"
          onClick={onExplainMap}
          className="group px-4 py-2 rounded-full bg-white/95 dark:bg-zinc-900/95 hover:bg-blue-50 dark:hover:bg-zinc-800 border border-blue-200 dark:border-blue-500/40 hover:border-blue-500 text-blue-600 dark:text-blue-400 shadow-lg flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 backdrop-blur-xl"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping group-hover:scale-125" />
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-telemetry font-bold text-xs tracking-wider text-slate-900 dark:text-white">
            EXPLAIN THIS MAP
          </span>
        </button>
      </div>

      {/* Floating Map Controls Toolbar */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col space-y-2">
        {/* Layer Toggles Panel */}
        <div className="rounded-2xl p-2 flex items-center space-x-2 shadow-2xl border border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl text-slate-700 dark:text-slate-300">

          {/* Prominent Interactive Time / Year Selector (with In-Place Popover) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTimePopoverOpen(!isTimePopoverOpen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-telemetry flex items-center space-x-1.5 transition-all cursor-pointer ${
                isTimePopoverOpen || timeDrawerOpen
                  ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50 shadow-sm font-bold ring-1 ring-orange-400/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 bg-white/80 dark:bg-zinc-900/80 shadow-xs'
              }`}
              title="Interactive Time / Year Selector (2020–2026)"
            >
              <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span className="font-bold">TIME CHANGES:</span>
              <span className="font-mono text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-500/25 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-500/40 font-bold">
                {fromYear || (context?.actual_before_date ? context.actual_before_date.slice(0, 4) : 2021)}➔{toYear || (context?.actual_after_date ? context.actual_after_date.slice(0, 4) : 2026)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-orange-600/70 dark:text-orange-400/70" />
            </button>

            {/* In-Place Time Machine Popover */}
            {isTimePopoverOpen && (
              <div className="absolute bottom-12 left-0 z-50 w-72 sm:w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="font-telemetry font-bold text-xs uppercase tracking-wider">Time Selector (2020–2026)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTimePopoverOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="mb-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                    Quick Comparison Presets:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    {[
                      { from: 2021, to: 2026, label: '2021 ➔ 2026' },
                      { from: 2020, to: 2023, label: '2020 ➔ 2023' },
                      { from: 2023, to: 2026, label: '2023 ➔ 2026' },
                      { from: 2020, to: 2026, label: '2020 ➔ 2026' },
                    ].map((p) => {
                      const curFrom = fromYear || (context?.actual_before_date ? parseInt(context.actual_before_date.slice(0, 4)) : 2021);
                      const curTo = toYear || (context?.actual_after_date ? parseInt(context.actual_after_date.slice(0, 4)) : 2026);
                      const isSel = curFrom === p.from && curTo === p.to;

                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            if (context?.timeline) {
                              const f1 = context.timeline.find(f => f.year === p.from);
                              const f2 = context.timeline.find(f => f.year === p.to);
                              if (f1 && onSelectFromYear) onSelectFromYear(f1);
                              if (f2 && onSelectToYear) onSelectToYear(f2);
                            }
                          }}
                          className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-orange-500 text-white font-bold border-orange-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Dropdown Year Selectors */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      Start Year (Baseline)
                    </label>
                    <select
                      value={fromYear || (context?.actual_before_date ? parseInt(context.actual_before_date.slice(0, 4)) : 2021)}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value);
                        if (context?.timeline && onSelectFromYear) {
                          const f = context.timeline.find(item => item.year === yr) || {
                            year: yr,
                            date: `${yr}-03-15`,
                            imageUrl: '',
                            metrics: { vegetation_ndvi: 0.45, urban_ndbi: 0.12, water_ndwi: 0.05 },
                            description: `${yr} Sentinel-2 observation pass`
                          };
                          onSelectFromYear(f);
                        }
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold"
                    >
                      {[2020, 2021, 2022, 2023, 2024, 2025].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                      End Year (Comparison)
                    </label>
                    <select
                      value={toYear || (context?.actual_after_date ? parseInt(context.actual_after_date.slice(0, 4)) : 2026)}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value);
                        if (context?.timeline && onSelectToYear) {
                          const f = context.timeline.find(item => item.year === yr) || {
                            year: yr,
                            date: `${yr}-03-15`,
                            imageUrl: '',
                            metrics: { vegetation_ndvi: 0.45, urban_ndbi: 0.12, water_ndwi: 0.05 },
                            description: `${yr} Sentinel-2 observation pass`
                          };
                          onSelectToYear(f);
                        }
                      }}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold"
                    >
                      {[2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Popover Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  {onToggleTimeDrawer && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimePopoverOpen(false);
                        onToggleTimeDrawer();
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-telemetry font-bold transition-all text-center cursor-pointer shadow-xs"
                    >
                      Detailed Timeline Drawer ➔
                    </button>
                  )}
                  {onResetYears && (fromYear || toYear) && (
                    <button
                      type="button"
                      onClick={() => {
                        onResetYears();
                        setIsTimePopoverOpen(false);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 text-xs font-mono cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated Option Button: Raw Satellite Timeline Studio (Side-by-Side) */}
          {onOpenRawSatelliteModal && (
            <button
              type="button"
              onClick={onOpenRawSatelliteModal}
              className="px-3 py-1.5 rounded-xl text-xs font-telemetry flex items-center space-x-1.5 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm font-bold active:scale-95"
              title="Open Raw Satellite Timeline Studio: Side-by-side pure optical satellite imagery with timeline and place choice"
            >
              <Satellite className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="hidden sm:inline">RAW SATELLITE (SIDE-BY-SIDE)</span>
              <span className="sm:hidden">RAW SATS</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700 mx-1" />

          {/* On-Map Indicators Toggle Button */}
          <button
            type="button"
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-3 py-1.5 rounded-xl text-xs font-telemetry flex items-center space-x-1.5 transition-all ${
              showIndicators
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/50 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle On-Map Indicator Pins & Badges"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">INDICATORS ({indicatorCounts.total})</span>
          </button>

          {/* Change Heatmap Toggle */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-telemetry flex items-center space-x-1.5 transition-all ${
              showHeatmap
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle Continuous Change Heatmap"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline font-semibold">HEATMAP</span>
          </button>

          {/* Polygons Toggle */}
          <button
            type="button"
            onClick={() => setShowPolygons(!showPolygons)}
            className={`px-3 py-1.5 rounded-xl text-xs font-telemetry flex items-center space-x-1.5 transition-all ${
              showPolygons
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/50 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle Vector Change Polygons"
          >
            <Square className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline font-semibold">POLYGONS</span>
          </button>

          {/* Quick Raw Optical Only Mode (hides heatmap, polygons, and indicators) */}
          <button
            type="button"
            onClick={() => {
              if (showPolygons || showHeatmap || showIndicators) {
                setShowPolygons(false);
                setShowHeatmap(false);
                setShowIndicators(false);
              } else {
                setShowPolygons(true);
                setShowHeatmap(true);
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-telemetry flex items-center space-x-1.5 transition-all ${
              !showPolygons && !showHeatmap && !showIndicators
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/25 dark:text-emerald-300 dark:border-emerald-400/60 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle Pure Raw Satellite View (hide all polygon and heatmap masks on the map)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-semibold">RAW ONLY</span>
          </button>

          {/* Area Names Toggle (Beside Polygons) */}
          <button
            type="button"
            onClick={() => setShowAreaNames(!showAreaNames)}
            className={`px-3 py-1.5 rounded-xl text-xs font-telemetry flex items-center space-x-1.5 transition-all ${
              showAreaNames
                ? 'bg-slate-100 text-slate-900 border border-slate-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle Area Names & Place Labels on Satellite Map"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">AREA NAMES</span>
          </button>
        </div>
      </div>

      {/* Organized Aligned Hotspots Dock (Clean, Horizontally Aligned & Spaced Indicator Bar) */}
      {showIndicators && placedIndicators.length > 0 && (
        <div className="absolute bottom-20 left-4 right-4 z-20 flex items-center justify-start sm:justify-center pointer-events-none">
          <div className="flex items-center space-x-2 p-2 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-zinc-800 shadow-2xl backdrop-blur-xl pointer-events-auto max-w-full overflow-x-auto custom-scrollbar">
            <div className="flex items-center space-x-1.5 px-2 text-[10.5px] font-telemetry uppercase font-bold text-slate-500 dark:text-zinc-400 shrink-0 border-r border-slate-200 dark:border-zinc-800 pr-3">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>ALIGNED HOTSPOTS ({placedIndicators.length}):</span>
            </div>
            {placedIndicators.map((pin, idx) => {
              const config = getCategoryConfig(pin.category);
              const isSelected = selectedRegion?.id === pin.id;
              const haText = pin.area_hectares < 100 
                ? `${pin.area_hectares.toFixed(1)} ha` 
                : `${Math.round(pin.area_hectares).toLocaleString()} ha`;
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => {
                    onSelectRegion(pin);
                    if (mapRef.current) {
                      mapRef.current.flyTo({ center: pin.centroid, zoom: 14.5, duration: 800 });
                    }
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-telemetry transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800 font-bold shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/60 border-transparent'
                  }`}
                  style={{
                    borderColor: isSelected ? config.color : 'transparent',
                  }}
                  title={`Focus on #${idx + 1} ${config.shortLabel}: ${pin.user_label} (${haText})`}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 font-mono shadow-xs"
                    style={{ backgroundColor: config.color }}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {config.shortLabel}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    {haText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mouse Crosshair Telemetry Display */}
      {mouseCoords && (
        <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/80 dark:border-zinc-800 text-[10.5px] font-telemetry text-slate-700 dark:text-slate-300 hidden lg:flex items-center space-x-2 backdrop-blur-xl shadow-md">
          <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{mouseCoords.lat > 0 ? `${mouseCoords.lat.toFixed(4)}°N` : `${Math.abs(mouseCoords.lat).toFixed(4)}°S`}</span>
          <span>{mouseCoords.lon > 0 ? `${mouseCoords.lon.toFixed(4)}°E` : `${Math.abs(mouseCoords.lon).toFixed(4)}°W`}</span>
        </div>
      )}
    </div>
  );
};

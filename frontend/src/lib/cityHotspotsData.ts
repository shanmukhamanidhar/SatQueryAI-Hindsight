// Authoritative, Empirical Hotspot Datasets for 8 Featured Exploration Cities & Regions
// Generated from Copernicus Sentinel-2 Level-2A Multi-Spectral Observation Engine.
import { ChangeRegion } from './types';

export interface HotspotCityData {
  id: string;
  name: string;
  query: string;
  type: 'city' | 'region';
  parentLocation: string;
  latitude: number;
  longitude: number;
  bounding_box: [number, number, number, number];
  hotspotsCount: number;
  hotspots: ChangeRegion[];
  summaryNote?: string;
}

export const HOTSPOT_CITIES_REGISTRY: HotspotCityData[] = [
  {
    "id": "visakhapatnam",
    "name": "Visakhapatnam",
    "query": "Analyze Visakhapatnam between 2021 and 2026",
    "type": "city",
    "parentLocation": "Andhra Pradesh",
    "latitude": 17.6935526,
    "longitude": 83.2921297,
    "bounding_box": [
      83.22213,
      17.62355,
      83.36213,
      17.76355
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 1,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 8888.14,
        "centroid": [
          83.319533,
          17.665387
        ],
        "delta_ndvi": -0.009,
        "delta_ndbi": 0.593,
        "delta_ndwi": -0.044,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.593, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.232521,
                17.761089
              ],
              [
                83.319533,
                17.761089
              ],
              [
                83.361583,
                17.692593
              ],
              [
                83.361583,
                17.624097
              ],
              [
                83.319533,
                17.624097
              ],
              [
                83.232521,
                17.692593
              ],
              [
                83.232521,
                17.761089
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 2,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 4277.87,
        "centroid": [
          83.318897,
          17.68377
        ],
        "delta_ndvi": -0.373,
        "delta_ndbi": 0.563,
        "delta_ndwi": 0.043,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.373, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.233068,
                17.761089
              ],
              [
                83.318897,
                17.761089
              ],
              [
                83.361583,
                17.692593
              ],
              [
                83.361583,
                17.624097
              ],
              [
                83.318897,
                17.624097
              ],
              [
                83.233068,
                17.692593
              ],
              [
                83.233068,
                17.761089
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 3,
        "severity_level": "CRITICAL",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 3784.45,
        "centroid": [
          83.328481,
          17.646219
        ],
        "delta_ndvi": 0.338,
        "delta_ndbi": 0.595,
        "delta_ndwi": -0.037,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.338, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.263966,
                17.690816
              ],
              [
                83.328481,
                17.690816
              ],
              [
                83.361583,
                17.657456500000002
              ],
              [
                83.361583,
                17.624097
              ],
              [
                83.328481,
                17.624097
              ],
              [
                83.263966,
                17.657456500000002
              ],
              [
                83.263966,
                17.690816
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 4,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 846.67,
        "centroid": [
          83.337933,
          17.705071
        ],
        "delta_ndvi": -0.392,
        "delta_ndbi": 0.323,
        "delta_ndwi": 0.061,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.061, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.315646,
                17.743042
              ],
              [
                83.337933,
                17.743042
              ],
              [
                83.361583,
                17.706674999999997
              ],
              [
                83.361583,
                17.670308
              ],
              [
                83.337933,
                17.670308
              ],
              [
                83.315646,
                17.706674999999997
              ],
              [
                83.315646,
                17.743042
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 5,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 790.01,
        "centroid": [
          83.26528,
          17.718616
        ],
        "delta_ndvi": -0.141,
        "delta_ndbi": 0.161,
        "delta_ndwi": 0.027,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.161, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.228146,
                17.735386
              ],
              [
                83.26528,
                17.735386
              ],
              [
                83.29131,
                17.7181595
              ],
              [
                83.29131,
                17.700933
              ],
              [
                83.26528,
                17.700933
              ],
              [
                83.228146,
                17.7181595
              ],
              [
                83.228146,
                17.735386
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 6,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 462.71,
        "centroid": [
          83.261102,
          17.664816
        ],
        "delta_ndvi": -0.111,
        "delta_ndbi": 0.138,
        "delta_ndwi": 0.012,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.138, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.243185,
                17.681792
              ],
              [
                83.261102,
                17.681792
              ],
              [
                83.278458,
                17.662925
              ],
              [
                83.278458,
                17.644058
              ],
              [
                83.261102,
                17.644058
              ],
              [
                83.243185,
                17.662925
              ],
              [
                83.243185,
                17.681792
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 7,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 159.87,
        "centroid": [
          83.258584,
          17.712946
        ],
        "delta_ndvi": -0.179,
        "delta_ndbi": 0.212,
        "delta_ndwi": 0.036,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.179, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.244825,
                17.721167
              ],
              [
                83.258584,
                17.721167
              ],
              [
                83.268068,
                17.713921
              ],
              [
                83.268068,
                17.706675
              ],
              [
                83.258584,
                17.706675
              ],
              [
                83.244825,
                17.713921
              ],
              [
                83.244825,
                17.721167
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 8,
        "severity_level": "CRITICAL",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 149.48,
        "centroid": [
          83.321499,
          17.671485
        ],
        "delta_ndvi": 0.312,
        "delta_ndbi": 0.825,
        "delta_ndwi": -0.278,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.312, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.309903,
                17.685894
              ],
              [
                83.321499,
                17.685894
              ],
              [
                83.331232,
                17.674136
              ],
              [
                83.331232,
                17.662378
              ],
              [
                83.321499,
                17.662378
              ],
              [
                83.309903,
                17.674136
              ],
              [
                83.309903,
                17.685894
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 9,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 131.45,
        "centroid": [
          83.274293,
          17.714098
        ],
        "delta_ndvi": -0.158,
        "delta_ndbi": 0.169,
        "delta_ndwi": 0.035,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.158, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.267247,
                17.723628
              ],
              [
                83.274293,
                17.723628
              ],
              [
                83.280646,
                17.7136475
              ],
              [
                83.280646,
                17.703667
              ],
              [
                83.274293,
                17.703667
              ],
              [
                83.267247,
                17.7136475
              ],
              [
                83.267247,
                17.723628
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 10,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 97.4,
        "centroid": [
          83.263854,
          17.675761
        ],
        "delta_ndvi": -0.165,
        "delta_ndbi": 0.21,
        "delta_ndwi": 0.019,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.165, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.254396,
                17.681245
              ],
              [
                83.263854,
                17.681245
              ],
              [
                83.274903,
                17.67646
              ],
              [
                83.274903,
                17.671675
              ],
              [
                83.263854,
                17.671675
              ],
              [
                83.254396,
                17.67646
              ],
              [
                83.254396,
                17.681245
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 11,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 95.02,
        "centroid": [
          83.28547,
          17.726537
        ],
        "delta_ndvi": -0.187,
        "delta_ndbi": 0.202,
        "delta_ndwi": 0.033,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.187, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.278732,
                17.732652
              ],
              [
                83.28547,
                17.732652
              ],
              [
                83.291036,
                17.726499500000003
              ],
              [
                83.291036,
                17.720347
              ],
              [
                83.28547,
                17.720347
              ],
              [
                83.278732,
                17.726499500000003
              ],
              [
                83.278732,
                17.732652
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 12,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 59.04,
        "centroid": [
          83.265727,
          17.660048
        ],
        "delta_ndvi": -0.15,
        "delta_ndbi": 0.183,
        "delta_ndwi": 0.019,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.150, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.258497,
                17.664019
              ],
              [
                83.265727,
                17.664019
              ],
              [
                83.274083,
                17.6603275
              ],
              [
                83.274083,
                17.656636
              ],
              [
                83.265727,
                17.656636
              ],
              [
                83.258497,
                17.6603275
              ],
              [
                83.258497,
                17.664019
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 13,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 56.4,
        "centroid": [
          83.305612,
          17.659938
        ],
        "delta_ndvi": 0.069,
        "delta_ndbi": 1.112,
        "delta_ndwi": -0.754,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.754, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.298419,
                17.66648
              ],
              [
                83.305612,
                17.66648
              ],
              [
                83.312091,
                17.660463999999997
              ],
              [
                83.312091,
                17.654448
              ],
              [
                83.305612,
                17.654448
              ],
              [
                83.298419,
                17.660463999999997
              ],
              [
                83.298419,
                17.66648
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 14,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 53.41,
        "centroid": [
          83.286105,
          17.70446
        ],
        "delta_ndvi": -0.183,
        "delta_ndbi": 0.21,
        "delta_ndwi": 0.027,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.183, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.28338,
                17.71187
              ],
              [
                83.286105,
                17.71187
              ],
              [
                83.289396,
                17.7043505
              ],
              [
                83.289396,
                17.696831
              ],
              [
                83.286105,
                17.696831
              ],
              [
                83.28338,
                17.7043505
              ],
              [
                83.28338,
                17.71187
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 15,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 41.44,
        "centroid": [
          83.272038,
          17.686765
        ],
        "delta_ndvi": -0.12,
        "delta_ndbi": 0.148,
        "delta_ndwi": 0.029,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.148, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.266974,
                17.690542
              ],
              [
                83.272038,
                17.690542
              ],
              [
                83.277911,
                17.686714000000002
              ],
              [
                83.277911,
                17.682886
              ],
              [
                83.272038,
                17.682886
              ],
              [
                83.266974,
                17.686714000000002
              ],
              [
                83.266974,
                17.690542
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "visakhapatnam",
        "location_name": "Visakhapatnam",
        "indicator_number": 16,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 38.54,
        "centroid": [
          83.287839,
          17.678073
        ],
        "delta_ndvi": -0.144,
        "delta_ndbi": 0.184,
        "delta_ndwi": 0.026,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.144, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                83.282286,
                17.681519
              ],
              [
                83.287839,
                17.681519
              ],
              [
                83.29213,
                17.677691000000003
              ],
              [
                83.29213,
                17.673863
              ],
              [
                83.287839,
                17.673863
              ],
              [
                83.282286,
                17.677691000000003
              ],
              [
                83.282286,
                17.681519
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in Visakhapatnam using Sentinel-2 L2A observations."
  },
  {
    "id": "krishna-river-vijayawada",
    "name": "Krishna River (Vijayawada)",
    "query": "Krishna River in Vijayawada between 2021 and 2026",
    "type": "region",
    "parentLocation": "Andhra Pradesh",
    "latitude": 16.5075,
    "longitude": 80.6125,
    "bounding_box": [
      80.56,
      16.48,
      80.665,
      16.535
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 1,
        "severity_level": "HIGH",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 424.42,
        "centroid": [
          80.577276,
          16.524319
        ],
        "delta_ndvi": 0.474,
        "delta_ndbi": -0.452,
        "delta_ndwi": -0.029,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.474, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.560205,
                16.534893
              ],
              [
                80.577276,
                16.534893
              ],
              [
                80.595684,
                16.524365500000002
              ],
              [
                80.595684,
                16.513838
              ],
              [
                80.577276,
                16.513838
              ],
              [
                80.560205,
                16.524365500000002
              ],
              [
                80.560205,
                16.534893
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 2,
        "severity_level": "HIGH",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 424.08,
        "centroid": [
          80.595107,
          16.497106
        ],
        "delta_ndvi": 0.327,
        "delta_ndbi": -0.372,
        "delta_ndwi": -0.022,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.327, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.576406,
                16.516094
              ],
              [
                80.595107,
                16.516094
              ],
              [
                80.616807,
                16.4981545
              ],
              [
                80.616807,
                16.480215
              ],
              [
                80.595107,
                16.480215
              ],
              [
                80.576406,
                16.4981545
              ],
              [
                80.576406,
                16.516094
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 3,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 302.4,
        "centroid": [
          80.589509,
          16.510955
        ],
        "delta_ndvi": -0.46,
        "delta_ndbi": 0.127,
        "delta_ndwi": 0.268,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.460, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.566562,
                16.523721
              ],
              [
                80.589509,
                16.523721
              ],
              [
                80.601016,
                16.512226499999997
              ],
              [
                80.601016,
                16.500732
              ],
              [
                80.589509,
                16.500732
              ],
              [
                80.566562,
                16.512226499999997
              ],
              [
                80.566562,
                16.523721
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 4,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 204.96,
        "centroid": [
          80.583887,
          16.508485
        ],
        "delta_ndvi": -0.299,
        "delta_ndbi": 0.34,
        "delta_ndwi": 0.019,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.340, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.566152,
                16.516523
              ],
              [
                80.583887,
                16.516523
              ],
              [
                80.59999,
                16.5088965
              ],
              [
                80.59999,
                16.50127
              ],
              [
                80.583887,
                16.50127
              ],
              [
                80.566152,
                16.5088965
              ],
              [
                80.566152,
                16.516523
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 5,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 130.06,
        "centroid": [
          80.593257,
          16.51773
        ],
        "delta_ndvi": -0.284,
        "delta_ndbi": -0.479,
        "delta_ndwi": 0.77,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.770, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.584609,
                16.529199
              ],
              [
                80.593257,
                16.529199
              ],
              [
                80.600605,
                16.519531
              ],
              [
                80.600605,
                16.509863
              ],
              [
                80.593257,
                16.509863
              ],
              [
                80.584609,
                16.519531
              ],
              [
                80.584609,
                16.529199
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 6,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 116.88,
        "centroid": [
          80.60596,
          16.523881
        ],
        "delta_ndvi": 0.291,
        "delta_ndbi": -0.223,
        "delta_ndwi": -0.113,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.291, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.600811,
                16.534893
              ],
              [
                80.60596,
                16.534893
              ],
              [
                80.613525,
                16.524795
              ],
              [
                80.613525,
                16.514697
              ],
              [
                80.60596,
                16.514697
              ],
              [
                80.600811,
                16.524795
              ],
              [
                80.600811,
                16.534893
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 7,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 111.35,
        "centroid": [
          80.650051,
          16.513926
        ],
        "delta_ndvi": 0.23,
        "delta_ndbi": -0.208,
        "delta_ndwi": -0.079,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.230, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.63752,
                16.521143
              ],
              [
                80.650051,
                16.521143
              ],
              [
                80.660488,
                16.5137305
              ],
              [
                80.660488,
                16.506318
              ],
              [
                80.650051,
                16.506318
              ],
              [
                80.63752,
                16.5137305
              ],
              [
                80.63752,
                16.521143
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 8,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 38.95,
        "centroid": [
          80.590955,
          16.510575
        ],
        "delta_ndvi": 0.384,
        "delta_ndbi": -0.419,
        "delta_ndwi": 0.015,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.384, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.586045,
                16.51416
              ],
              [
                80.590955,
                16.51416
              ],
              [
                80.596709,
                16.510991
              ],
              [
                80.596709,
                16.507822
              ],
              [
                80.590955,
                16.507822
              ],
              [
                80.586045,
                16.510991
              ],
              [
                80.586045,
                16.51416
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 9,
        "severity_level": "MODERATE",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 37.39,
        "centroid": [
          80.621697,
          16.496819
        ],
        "delta_ndvi": -0.061,
        "delta_ndbi": 0.012,
        "delta_ndwi": 0.125,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.125, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.614961,
                16.500732
              ],
              [
                80.621697,
                16.500732
              ],
              [
                80.628701,
                16.4962205
              ],
              [
                80.628701,
                16.491709
              ],
              [
                80.621697,
                16.491709
              ],
              [
                80.614961,
                16.4962205
              ],
              [
                80.614961,
                16.500732
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 10,
        "severity_level": "MODERATE",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 34.49,
        "centroid": [
          80.582387,
          16.491411
        ],
        "delta_ndvi": 0.518,
        "delta_ndbi": -0.606,
        "delta_ndwi": -0.11,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.110, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.579277,
                16.495791
              ],
              [
                80.582387,
                16.495791
              ],
              [
                80.58625,
                16.491548
              ],
              [
                80.58625,
                16.487305
              ],
              [
                80.582387,
                16.487305
              ],
              [
                80.579277,
                16.491548
              ],
              [
                80.579277,
                16.495791
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 11,
        "severity_level": "MODERATE",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 28.46,
        "centroid": [
          80.635127,
          16.488146
        ],
        "delta_ndvi": 0.165,
        "delta_ndbi": -0.15,
        "delta_ndwi": -0.133,
        "confidence_pct": 95,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.133, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.632188,
                16.491387
              ],
              [
                80.635127,
                16.491387
              ],
              [
                80.638135,
                16.487251
              ],
              [
                80.638135,
                16.483115
              ],
              [
                80.635127,
                16.483115
              ],
              [
                80.632188,
                16.487251
              ],
              [
                80.632188,
                16.491387
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 12,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 24.71,
        "centroid": [
          80.580021,
          16.499781
        ],
        "delta_ndvi": -0.112,
        "delta_ndbi": 0.151,
        "delta_ndwi": 0.01,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.151, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.576611,
                16.502559
              ],
              [
                80.580021,
                16.502559
              ],
              [
                80.584199,
                16.499658500000002
              ],
              [
                80.584199,
                16.496758
              ],
              [
                80.580021,
                16.496758
              ],
              [
                80.576611,
                16.499658500000002
              ],
              [
                80.576611,
                16.502559
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 13,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 24.03,
        "centroid": [
          80.637429,
          16.50459
        ],
        "delta_ndvi": 0.179,
        "delta_ndbi": -0.185,
        "delta_ndwi": -0.058,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.179, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.634033,
                16.509434
              ],
              [
                80.637429,
                16.509434
              ],
              [
                80.640391,
                16.504976
              ],
              [
                80.640391,
                16.500518
              ],
              [
                80.637429,
                16.500518
              ],
              [
                80.634033,
                16.504976
              ],
              [
                80.634033,
                16.509434
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 14,
        "severity_level": "MODERATE",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 22.18,
        "centroid": [
          80.602177,
          16.504802
        ],
        "delta_ndvi": 0.803,
        "delta_ndbi": -0.924,
        "delta_ndwi": 0.298,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.298, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.599785,
                16.509648
              ],
              [
                80.602177,
                16.509648
              ],
              [
                80.604707,
                16.505083
              ],
              [
                80.604707,
                16.500518
              ],
              [
                80.602177,
                16.500518
              ],
              [
                80.599785,
                16.505083
              ],
              [
                80.599785,
                16.509648
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 15,
        "severity_level": "MODERATE",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 21.65,
        "centroid": [
          80.57431,
          16.51996
        ],
        "delta_ndvi": 0.824,
        "delta_ndbi": -0.909,
        "delta_ndwi": -0.107,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.107, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.571484,
                16.522217
              ],
              [
                80.57431,
                16.522217
              ],
              [
                80.577432,
                16.519961000000002
              ],
              [
                80.577432,
                16.517705
              ],
              [
                80.57431,
                16.517705
              ],
              [
                80.571484,
                16.519961000000002
              ],
              [
                80.571484,
                16.522217
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "krishna-river-vijayawada",
        "location_name": "Krishna River (Vijayawada)",
        "indicator_number": 16,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 21.58,
        "centroid": [
          80.575036,
          16.495171
        ],
        "delta_ndvi": -0.157,
        "delta_ndbi": 0.197,
        "delta_ndwi": 0.019,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.197, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                80.571895,
                16.497295
              ],
              [
                80.575036,
                16.497295
              ],
              [
                80.578662,
                16.494878
              ],
              [
                80.578662,
                16.492461
              ],
              [
                80.575036,
                16.492461
              ],
              [
                80.571895,
                16.494878
              ],
              [
                80.571895,
                16.497295
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in Krishna River (Vijayawada) using Sentinel-2 L2A observations."
  },
  {
    "id": "hyderabad",
    "name": "Hyderabad",
    "query": "Analyze Hyderabad, Telangana between 2021 and 2026",
    "type": "city",
    "parentLocation": "Telangana",
    "latitude": 17.385,
    "longitude": 78.4867,
    "bounding_box": [
      78.386,
      17.285,
      78.586,
      17.485
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 1,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 378.98,
        "centroid": [
          78.474878,
          17.422651
        ],
        "delta_ndvi": -0.511,
        "delta_ndbi": -0.256,
        "delta_ndwi": 0.626,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.511, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.462953,
                17.433438
              ],
              [
                78.474878,
                17.433438
              ],
              [
                78.486391,
                17.4215235
              ],
              [
                78.486391,
                17.409609
              ],
              [
                78.474878,
                17.409609
              ],
              [
                78.462953,
                17.4215235
              ],
              [
                78.462953,
                17.433438
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 2,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 309.73,
        "centroid": [
          78.473865,
          17.422416
        ],
        "delta_ndvi": -0.497,
        "delta_ndbi": -0.431,
        "delta_ndwi": 0.808,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.808, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.462953,
                17.433828
              ],
              [
                78.473865,
                17.433828
              ],
              [
                78.485609,
                17.421914
              ],
              [
                78.485609,
                17.41
              ],
              [
                78.473865,
                17.41
              ],
              [
                78.462953,
                17.421914
              ],
              [
                78.462953,
                17.433828
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 3,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 51.26,
        "centroid": [
          78.477269,
          17.429641
        ],
        "delta_ndvi": -0.314,
        "delta_ndbi": 0.313,
        "delta_ndwi": 0.005,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.313, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.471938,
                17.433047
              ],
              [
                78.477269,
                17.433047
              ],
              [
                78.483266,
                17.429336
              ],
              [
                78.483266,
                17.425625
              ],
              [
                78.477269,
                17.425625
              ],
              [
                78.471938,
                17.429336
              ],
              [
                78.471938,
                17.433047
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 4,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 49.28,
        "centroid": [
          78.440974,
          17.345947
        ],
        "delta_ndvi": -0.295,
        "delta_ndbi": -0.706,
        "delta_ndwi": 0.831,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.831, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.436781,
                17.351406
              ],
              [
                78.440974,
                17.351406
              ],
              [
                78.444984,
                17.345937499999998
              ],
              [
                78.444984,
                17.340469
              ],
              [
                78.440974,
                17.340469
              ],
              [
                78.436781,
                17.345937499999998
              ],
              [
                78.436781,
                17.351406
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 5,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 38.67,
        "centroid": [
          78.437771,
          17.348408
        ],
        "delta_ndvi": -0.565,
        "delta_ndbi": -0.229,
        "delta_ndwi": 0.563,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.565, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.434438,
                17.352188
              ],
              [
                78.437771,
                17.352188
              ],
              [
                78.441078,
                17.3488675
              ],
              [
                78.441078,
                17.345547
              ],
              [
                78.437771,
                17.345547
              ],
              [
                78.434438,
                17.3488675
              ],
              [
                78.434438,
                17.352188
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 6,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 36.87,
        "centroid": [
          78.513715,
          17.438561
        ],
        "delta_ndvi": -0.161,
        "delta_ndbi": 0.183,
        "delta_ndwi": 0.017,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.183, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.510609,
                17.441641
              ],
              [
                78.513715,
                17.441641
              ],
              [
                78.519203,
                17.437734499999998
              ],
              [
                78.519203,
                17.433828
              ],
              [
                78.513715,
                17.433828
              ],
              [
                78.510609,
                17.437734499999998
              ],
              [
                78.510609,
                17.441641
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 7,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 36.87,
        "centroid": [
          78.434049,
          17.400734
        ],
        "delta_ndvi": 0.358,
        "delta_ndbi": -0.403,
        "delta_ndwi": 0.015,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.358, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.428188,
                17.405312
              ],
              [
                78.434049,
                17.405312
              ],
              [
                78.438344,
                17.4010155
              ],
              [
                78.438344,
                17.396719
              ],
              [
                78.434049,
                17.396719
              ],
              [
                78.428188,
                17.4010155
              ],
              [
                78.428188,
                17.405312
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 8,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 34.89,
        "centroid": [
          78.548836,
          17.416578
        ],
        "delta_ndvi": -0.211,
        "delta_ndbi": 0.278,
        "delta_ndwi": -0.064,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.278, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.545766,
                17.420547
              ],
              [
                78.548836,
                17.420547
              ],
              [
                78.553188,
                17.4166405
              ],
              [
                78.553188,
                17.412734
              ],
              [
                78.548836,
                17.412734
              ],
              [
                78.545766,
                17.4166405
              ],
              [
                78.545766,
                17.420547
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 9,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 32.38,
        "centroid": [
          78.426486,
          17.400627
        ],
        "delta_ndvi": 0.444,
        "delta_ndbi": -0.477,
        "delta_ndwi": 0.008,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.444, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.421547,
                17.404141
              ],
              [
                78.426486,
                17.404141
              ],
              [
                78.431312,
                17.401016
              ],
              [
                78.431312,
                17.397891
              ],
              [
                78.426486,
                17.397891
              ],
              [
                78.421547,
                17.401016
              ],
              [
                78.421547,
                17.404141
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 10,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 31.3,
        "centroid": [
          78.426385,
          17.417801
        ],
        "delta_ndvi": 0.34,
        "delta_ndbi": -0.4,
        "delta_ndwi": -0.034,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.340, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.423109,
                17.420938
              ],
              [
                78.426385,
                17.420938
              ],
              [
                78.429359,
                17.4182035
              ],
              [
                78.429359,
                17.415469
              ],
              [
                78.426385,
                17.415469
              ],
              [
                78.423109,
                17.4182035
              ],
              [
                78.423109,
                17.420938
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 11,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 31.12,
        "centroid": [
          78.5134,
          17.323107
        ],
        "delta_ndvi": 0.412,
        "delta_ndbi": -0.414,
        "delta_ndwi": -0.052,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.412, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.507094,
                17.326016
              ],
              [
                78.5134,
                17.326016
              ],
              [
                78.519594,
                17.323672000000002
              ],
              [
                78.519594,
                17.321328
              ],
              [
                78.5134,
                17.321328
              ],
              [
                78.507094,
                17.323672000000002
              ],
              [
                78.507094,
                17.326016
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 12,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 25.72,
        "centroid": [
          78.52662,
          17.378551
        ],
        "delta_ndvi": -0.401,
        "delta_ndbi": 0.469,
        "delta_ndwi": 0.045,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.469, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.521156,
                17.380312
              ],
              [
                78.52662,
                17.380312
              ],
              [
                78.530531,
                17.3785545
              ],
              [
                78.530531,
                17.376797
              ],
              [
                78.52662,
                17.376797
              ],
              [
                78.521156,
                17.3785545
              ],
              [
                78.521156,
                17.380312
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 13,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 25.54,
        "centroid": [
          78.527519,
          17.355654
        ],
        "delta_ndvi": -0.199,
        "delta_ndbi": 0.245,
        "delta_ndwi": 0.032,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.245, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.524672,
                17.357656
              ],
              [
                78.527519,
                17.357656
              ],
              [
                78.530141,
                17.3555075
              ],
              [
                78.530141,
                17.353359
              ],
              [
                78.527519,
                17.353359
              ],
              [
                78.524672,
                17.3555075
              ],
              [
                78.524672,
                17.357656
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 14,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 25.36,
        "centroid": [
          78.528207,
          17.404481
        ],
        "delta_ndvi": 0.024,
        "delta_ndbi": 0.495,
        "delta_ndwi": -0.363,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.495, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.526234,
                17.408047
              ],
              [
                78.528207,
                17.408047
              ],
              [
                78.530531,
                17.4039455
              ],
              [
                78.530531,
                17.399844
              ],
              [
                78.528207,
                17.399844
              ],
              [
                78.526234,
                17.4039455
              ],
              [
                78.526234,
                17.408047
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 15,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 24.64,
        "centroid": [
          78.467661,
          17.417961
        ],
        "delta_ndvi": -0.467,
        "delta_ndbi": 0.458,
        "delta_ndwi": 0.024,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.458, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.465688,
                17.421328
              ],
              [
                78.467661,
                17.421328
              ],
              [
                78.469594,
                17.418203
              ],
              [
                78.469594,
                17.415078
              ],
              [
                78.467661,
                17.415078
              ],
              [
                78.465688,
                17.418203
              ],
              [
                78.465688,
                17.421328
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "hyderabad",
        "location_name": "Hyderabad",
        "indicator_number": 16,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 21.94,
        "centroid": [
          78.527579,
          17.378555
        ],
        "delta_ndvi": -0.498,
        "delta_ndbi": 0.506,
        "delta_ndwi": 0.103,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.498, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                78.523109,
                17.379922
              ],
              [
                78.527579,
                17.379922
              ],
              [
                78.531703,
                17.378555
              ],
              [
                78.531703,
                17.377188
              ],
              [
                78.527579,
                17.377188
              ],
              [
                78.523109,
                17.378555
              ],
              [
                78.523109,
                17.379922
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in Hyderabad using Sentinel-2 L2A observations."
  },
  {
    "id": "bengaluru",
    "name": "Bengaluru",
    "query": "Analyze Bengaluru, Karnataka between 2021 and 2026",
    "type": "city",
    "parentLocation": "Karnataka",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "bounding_box": [
      77.494,
      12.871,
      77.694,
      13.071
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 1,
        "severity_level": "HIGH",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 189.36,
        "centroid": [
          77.663954,
          12.934868
        ],
        "delta_ndvi": 0.521,
        "delta_ndbi": -0.189,
        "delta_ndwi": -0.326,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.521, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.65025,
                12.940141
              ],
              [
                77.663954,
                12.940141
              ],
              [
                77.676812,
                12.9344765
              ],
              [
                77.676812,
                12.928812
              ],
              [
                77.663954,
                12.928812
              ],
              [
                77.65025,
                12.9344765
              ],
              [
                77.65025,
                12.940141
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 2,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 121.59,
        "centroid": [
          77.649394,
          12.929297
        ],
        "delta_ndvi": -0.24,
        "delta_ndbi": 0.322,
        "delta_ndwi": 0.014,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.322, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.641656,
                12.933891
              ],
              [
                77.649394,
                12.933891
              ],
              [
                77.658453,
                12.929008
              ],
              [
                77.658453,
                12.924125
              ],
              [
                77.649394,
                12.924125
              ],
              [
                77.641656,
                12.929008
              ],
              [
                77.641656,
                12.933891
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 3,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 76.04,
        "centroid": [
          77.650718,
          12.929345
        ],
        "delta_ndvi": -0.328,
        "delta_ndbi": 0.394,
        "delta_ndwi": 0.055,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.328, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.644781,
                12.933891
              ],
              [
                77.650718,
                12.933891
              ],
              [
                77.657281,
                12.9293985
              ],
              [
                77.657281,
                12.924906
              ],
              [
                77.650718,
                12.924906
              ],
              [
                77.644781,
                12.9293985
              ],
              [
                77.644781,
                12.933891
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 4,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 67.77,
        "centroid": [
          77.616832,
          12.908098
        ],
        "delta_ndvi": 0.259,
        "delta_ndbi": 0.438,
        "delta_ndwi": -0.582,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.438, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.611969,
                12.913969
              ],
              [
                77.616832,
                12.913969
              ],
              [
                77.620953,
                12.9081095
              ],
              [
                77.620953,
                12.90225
              ],
              [
                77.616832,
                12.90225
              ],
              [
                77.611969,
                12.9081095
              ],
              [
                77.611969,
                12.913969
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 5,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 59.32,
        "centroid": [
          77.65796,
          12.917611
        ],
        "delta_ndvi": 0.255,
        "delta_ndbi": -0.311,
        "delta_ndwi": 0.001,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.255, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.653375,
                12.922953
              ],
              [
                77.65796,
                12.922953
              ],
              [
                77.663531,
                12.917874999999999
              ],
              [
                77.663531,
                12.912797
              ],
              [
                77.65796,
                12.912797
              ],
              [
                77.653375,
                12.917874999999999
              ],
              [
                77.653375,
                12.922953
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 6,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 46.47,
        "centroid": [
          77.586861,
          13.046581
        ],
        "delta_ndvi": 0.268,
        "delta_ndbi": 0.635,
        "delta_ndwi": -0.63,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.635, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.583062,
                13.049906
              ],
              [
                77.586861,
                13.049906
              ],
              [
                77.590875,
                13.046781
              ],
              [
                77.590875,
                13.043656
              ],
              [
                77.586861,
                13.043656
              ],
              [
                77.583062,
                13.046781
              ],
              [
                77.583062,
                13.049906
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 7,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 43.16,
        "centroid": [
          77.663432,
          12.933447
        ],
        "delta_ndvi": 0.624,
        "delta_ndbi": 0.124,
        "delta_ndwi": -0.657,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.657, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.658453,
                12.937797
              ],
              [
                77.663432,
                12.937797
              ],
              [
                77.665875,
                12.933695499999999
              ],
              [
                77.665875,
                12.929594
              ],
              [
                77.663432,
                12.929594
              ],
              [
                77.658453,
                12.933695499999999
              ],
              [
                77.658453,
                12.937797
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 8,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 42.06,
        "centroid": [
          77.664067,
          12.936801
        ],
        "delta_ndvi": 0.359,
        "delta_ndbi": 0.35,
        "delta_ndwi": -0.538,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.350, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.661188,
                12.941703
              ],
              [
                77.664067,
                12.941703
              ],
              [
                77.667828,
                12.9368205
              ],
              [
                77.667828,
                12.931938
              ],
              [
                77.664067,
                12.931938
              ],
              [
                77.661188,
                12.9368205
              ],
              [
                77.661188,
                12.941703
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 9,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 40.77,
        "centroid": [
          77.61771,
          12.90947
        ],
        "delta_ndvi": 0.603,
        "delta_ndbi": 0.375,
        "delta_ndwi": -0.817,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.817, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.614703,
                12.913578
              ],
              [
                77.61771,
                12.913578
              ],
              [
                77.620562,
                12.909866999999998
              ],
              [
                77.620562,
                12.906156
              ],
              [
                77.61771,
                12.906156
              ],
              [
                77.614703,
                12.909866999999998
              ],
              [
                77.614703,
                12.913578
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 10,
        "severity_level": "CRITICAL",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 39.12,
        "centroid": [
          77.617749,
          12.909422
        ],
        "delta_ndvi": 0.646,
        "delta_ndbi": 0.361,
        "delta_ndwi": -0.825,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.646, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.614703,
                12.913578
              ],
              [
                77.617749,
                12.913578
              ],
              [
                77.620562,
                12.909866999999998
              ],
              [
                77.620562,
                12.906156
              ],
              [
                77.617749,
                12.906156
              ],
              [
                77.614703,
                12.909866999999998
              ],
              [
                77.614703,
                12.913578
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 11,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 33.79,
        "centroid": [
          77.586472,
          13.047
        ],
        "delta_ndvi": 0.368,
        "delta_ndbi": 0.713,
        "delta_ndwi": -0.771,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.771, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.583062,
                13.049516
              ],
              [
                77.586472,
                13.049516
              ],
              [
                77.590484,
                13.047172
              ],
              [
                77.590484,
                13.044828
              ],
              [
                77.586472,
                13.044828
              ],
              [
                77.583062,
                13.047172
              ],
              [
                77.583062,
                13.049516
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 12,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 33.06,
        "centroid": [
          77.653034,
          13.046059
        ],
        "delta_ndvi": -0.197,
        "delta_ndbi": 0.338,
        "delta_ndwi": -0.06,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.338, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.647906,
                13.049125
              ],
              [
                77.653034,
                13.049125
              ],
              [
                77.6565,
                13.045609500000001
              ],
              [
                77.6565,
                13.042094
              ],
              [
                77.653034,
                13.042094
              ],
              [
                77.647906,
                13.045609500000001
              ],
              [
                77.647906,
                13.049125
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 13,
        "severity_level": "CRITICAL",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 31.77,
        "centroid": [
          77.586386,
          13.047
        ],
        "delta_ndvi": 0.387,
        "delta_ndbi": 0.678,
        "delta_ndwi": -0.746,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.387, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.583062,
                13.049516
              ],
              [
                77.586386,
                13.049516
              ],
              [
                77.590484,
                13.047172
              ],
              [
                77.590484,
                13.044828
              ],
              [
                77.586386,
                13.044828
              ],
              [
                77.583062,
                13.047172
              ],
              [
                77.583062,
                13.049516
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 14,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 29.57,
        "centroid": [
          77.578783,
          12.898785
        ],
        "delta_ndvi": 0.313,
        "delta_ndbi": -0.351,
        "delta_ndwi": -0.114,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.313, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.576031,
                12.901469
              ],
              [
                77.578783,
                12.901469
              ],
              [
                77.5815,
                12.898539
              ],
              [
                77.5815,
                12.895609
              ],
              [
                77.578783,
                12.895609
              ],
              [
                77.576031,
                12.898539
              ],
              [
                77.576031,
                12.901469
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 15,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 27.18,
        "centroid": [
          77.647064,
          12.938161
        ],
        "delta_ndvi": -0.259,
        "delta_ndbi": 0.314,
        "delta_ndwi": 0.055,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.314, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.644,
                12.940531
              ],
              [
                77.647064,
                12.940531
              ],
              [
                77.649469,
                12.937992000000001
              ],
              [
                77.649469,
                12.935453
              ],
              [
                77.647064,
                12.935453
              ],
              [
                77.644,
                12.937992000000001
              ],
              [
                77.644,
                12.940531
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "bengaluru",
        "location_name": "Bengaluru",
        "indicator_number": 16,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 27.0,
        "centroid": [
          77.661448,
          13.047
        ],
        "delta_ndvi": -0.699,
        "delta_ndbi": -0.238,
        "delta_ndwi": 0.787,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.787, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                77.656891,
                13.048734
              ],
              [
                77.661448,
                13.048734
              ],
              [
                77.664703,
                13.047171500000001
              ],
              [
                77.664703,
                13.045609
              ],
              [
                77.661448,
                13.045609
              ],
              [
                77.656891,
                13.047171500000001
              ],
              [
                77.656891,
                13.048734
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in Bengaluru using Sentinel-2 L2A observations."
  },
  {
    "id": "gujarat-coast",
    "name": "Gujarat Coast",
    "query": "Analyze Gujarat, India between 2021 and 2026",
    "type": "region",
    "parentLocation": "Gujarat",
    "latitude": 23.0225,
    "longitude": 72.5714,
    "bounding_box": [
      72.471,
      22.922,
      72.671,
      23.122
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 1,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 297.84,
        "centroid": [
          72.519208,
          22.947208
        ],
        "delta_ndvi": -0.198,
        "delta_ndbi": 0.277,
        "delta_ndwi": 0.004,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.277, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.493656,
                22.955984
              ],
              [
                72.519208,
                22.955984
              ],
              [
                72.545219,
                22.946414
              ],
              [
                72.545219,
                22.936844
              ],
              [
                72.519208,
                22.936844
              ],
              [
                72.493656,
                22.946414
              ],
              [
                72.493656,
                22.955984
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 2,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 151.26,
        "centroid": [
          72.616804,
          23.090004
        ],
        "delta_ndvi": -0.597,
        "delta_ndbi": 0.014,
        "delta_ndwi": 0.475,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.597, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.601078,
                23.095828
              ],
              [
                72.616804,
                23.095828
              ],
              [
                72.641313,
                23.086453
              ],
              [
                72.641313,
                23.077078
              ],
              [
                72.616804,
                23.077078
              ],
              [
                72.601078,
                23.086453
              ],
              [
                72.601078,
                23.095828
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 3,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 103.38,
        "centroid": [
          72.540095,
          22.98196
        ],
        "delta_ndvi": -0.238,
        "delta_ndbi": 0.323,
        "delta_ndwi": 0.008,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.323, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.524906,
                22.988797
              ],
              [
                72.540095,
                22.988797
              ],
              [
                72.556547,
                22.9817655
              ],
              [
                72.556547,
                22.974734
              ],
              [
                72.540095,
                22.974734
              ],
              [
                72.524906,
                22.9817655
              ],
              [
                72.524906,
                22.988797
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 4,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 88.12,
        "centroid": [
          72.616006,
          23.091059
        ],
        "delta_ndvi": -0.543,
        "delta_ndbi": -0.159,
        "delta_ndwi": 0.616,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.616, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.601859,
                23.094266
              ],
              [
                72.616006,
                23.094266
              ],
              [
                72.629594,
                23.089578500000002
              ],
              [
                72.629594,
                23.084891
              ],
              [
                72.616006,
                23.084891
              ],
              [
                72.601859,
                23.089578500000002
              ],
              [
                72.601859,
                23.094266
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 5,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 59.15,
        "centroid": [
          72.609321,
          23.083749
        ],
        "delta_ndvi": 0.334,
        "delta_ndbi": -0.372,
        "delta_ndwi": -0.033,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.334, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.604203,
                23.088797
              ],
              [
                72.609321,
                23.088797
              ],
              [
                72.615922,
                23.083719000000002
              ],
              [
                72.615922,
                23.078641
              ],
              [
                72.609321,
                23.078641
              ],
              [
                72.604203,
                23.083719000000002
              ],
              [
                72.604203,
                23.088797
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 6,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 56.03,
        "centroid": [
          72.551572,
          22.98687
        ],
        "delta_ndvi": -0.444,
        "delta_ndbi": 0.349,
        "delta_ndwi": 0.142,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.444, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.544828,
                22.991531
              ],
              [
                72.551572,
                22.991531
              ],
              [
                72.558109,
                22.987625
              ],
              [
                72.558109,
                22.983719
              ],
              [
                72.551572,
                22.983719
              ],
              [
                72.544828,
                22.987625
              ],
              [
                72.544828,
                22.991531
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 7,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 55.51,
        "centroid": [
          72.544745,
          22.9681
        ],
        "delta_ndvi": -0.168,
        "delta_ndbi": 0.205,
        "delta_ndwi": 0.044,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.205, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.542484,
                22.975906
              ],
              [
                72.544745,
                22.975906
              ],
              [
                72.547953,
                22.966921999999997
              ],
              [
                72.547953,
                22.957938
              ],
              [
                72.544745,
                22.957938
              ],
              [
                72.542484,
                22.966921999999997
              ],
              [
                72.542484,
                22.975906
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 8,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 49.78,
        "centroid": [
          72.503064,
          22.951255
        ],
        "delta_ndvi": -0.339,
        "delta_ndbi": 0.242,
        "delta_ndwi": 0.132,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.339, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.497562,
                22.956766
              ],
              [
                72.503064,
                22.956766
              ],
              [
                72.507719,
                22.951102
              ],
              [
                72.507719,
                22.945438
              ],
              [
                72.503064,
                22.945438
              ],
              [
                72.497562,
                22.951102
              ],
              [
                72.497562,
                22.956766
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 9,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 49.26,
        "centroid": [
          72.571345,
          22.950495
        ],
        "delta_ndvi": -0.167,
        "delta_ndbi": 0.184,
        "delta_ndwi": 0.052,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.184, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.566313,
                22.955203
              ],
              [
                72.571345,
                22.955203
              ],
              [
                72.575688,
                22.950711
              ],
              [
                72.575688,
                22.946219
              ],
              [
                72.571345,
                22.946219
              ],
              [
                72.566313,
                22.950711
              ],
              [
                72.566313,
                22.955203
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 10,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 48.22,
        "centroid": [
          72.521402,
          22.95574
        ],
        "delta_ndvi": 0.224,
        "delta_ndbi": -0.234,
        "delta_ndwi": -0.097,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.224, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.517094,
                22.959109
              ],
              [
                72.521402,
                22.959109
              ],
              [
                72.526078,
                22.9555935
              ],
              [
                72.526078,
                22.952078
              ],
              [
                72.521402,
                22.952078
              ],
              [
                72.517094,
                22.9555935
              ],
              [
                72.517094,
                22.959109
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 11,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 45.79,
        "centroid": [
          72.530798,
          22.977632
        ],
        "delta_ndvi": -0.349,
        "delta_ndbi": 0.304,
        "delta_ndwi": 0.12,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.349, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.523734,
                22.981766
              ],
              [
                72.530798,
                22.981766
              ],
              [
                72.536625,
                22.9778595
              ],
              [
                72.536625,
                22.973953
              ],
              [
                72.530798,
                22.973953
              ],
              [
                72.523734,
                22.9778595
              ],
              [
                72.523734,
                22.981766
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 12,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 45.62,
        "centroid": [
          72.501083,
          22.962542
        ],
        "delta_ndvi": 0.585,
        "delta_ndbi": -0.53,
        "delta_ndwi": -0.096,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.585, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.498734,
                22.967313
              ],
              [
                72.501083,
                22.967313
              ],
              [
                72.505375,
                22.9622345
              ],
              [
                72.505375,
                22.957156
              ],
              [
                72.501083,
                22.957156
              ],
              [
                72.498734,
                22.9622345
              ],
              [
                72.498734,
                22.967313
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 13,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 41.11,
        "centroid": [
          72.519571,
          22.947748
        ],
        "delta_ndvi": -0.309,
        "delta_ndbi": 0.389,
        "delta_ndwi": 0.037,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.309, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.515531,
                22.950516
              ],
              [
                72.519571,
                22.950516
              ],
              [
                72.525297,
                22.947586
              ],
              [
                72.525297,
                22.944656
              ],
              [
                72.519571,
                22.944656
              ],
              [
                72.515531,
                22.947586
              ],
              [
                72.515531,
                22.950516
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 14,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 40.59,
        "centroid": [
          72.538917,
          22.948796
        ],
        "delta_ndvi": -0.284,
        "delta_ndbi": 0.325,
        "delta_ndwi": 0.061,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.284, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.532328,
                22.951688
              ],
              [
                72.538917,
                22.951688
              ],
              [
                72.544828,
                22.948563
              ],
              [
                72.544828,
                22.945438
              ],
              [
                72.538917,
                22.945438
              ],
              [
                72.532328,
                22.948563
              ],
              [
                72.532328,
                22.951688
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 15,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 39.55,
        "centroid": [
          72.567863,
          22.959983
        ],
        "delta_ndvi": 0.214,
        "delta_ndbi": -0.244,
        "delta_ndwi": -0.059,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.214, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.565141,
                22.96575
              ],
              [
                72.567863,
                22.96575
              ],
              [
                72.571781,
                22.960281000000002
              ],
              [
                72.571781,
                22.954812
              ],
              [
                72.567863,
                22.954812
              ],
              [
                72.565141,
                22.960281000000002
              ],
              [
                72.565141,
                22.96575
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "gujarat-coast",
        "location_name": "Gujarat Coast",
        "indicator_number": 16,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 38.51,
        "centroid": [
          72.547621,
          22.979814
        ],
        "delta_ndvi": 0.57,
        "delta_ndbi": -0.464,
        "delta_ndwi": -0.145,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.570, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.544438,
                22.983719
              ],
              [
                72.547621,
                22.983719
              ],
              [
                72.551469,
                22.980203500000002
              ],
              [
                72.551469,
                22.976688
              ],
              [
                72.547621,
                22.976688
              ],
              [
                72.544438,
                22.980203500000002
              ],
              [
                72.544438,
                22.983719
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in Gujarat Coast using Sentinel-2 L2A observations."
  },
  {
    "id": "mumbai",
    "name": "Mumbai",
    "query": "Analyze Mumbai, Maharashtra between 2021 and 2026",
    "type": "city",
    "parentLocation": "Maharashtra",
    "latitude": 19.076,
    "longitude": 72.8777,
    "bounding_box": [
      72.777,
      18.976,
      72.977,
      19.176
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 1,
        "severity_level": "CRITICAL",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 4672.57,
        "centroid": [
          72.803923,
          19.056789
        ],
        "delta_ndvi": 0.343,
        "delta_ndbi": -0.416,
        "delta_ndwi": -0.059,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.343, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.777391,
                19.131859
              ],
              [
                72.803923,
                19.131859
              ],
              [
                72.835203,
                19.054319999999997
              ],
              [
                72.835203,
                18.976781
              ],
              [
                72.803923,
                18.976781
              ],
              [
                72.777391,
                19.054319999999997
              ],
              [
                72.777391,
                19.131859
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 2,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 2675.43,
        "centroid": [
          72.809894,
          19.057094
        ],
        "delta_ndvi": 0.328,
        "delta_ndbi": -0.385,
        "delta_ndwi": -0.132,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.132, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.793797,
                19.114672
              ],
              [
                72.809894,
                19.114672
              ],
              [
                72.828953,
                19.0457265
              ],
              [
                72.828953,
                18.976781
              ],
              [
                72.809894,
                18.976781
              ],
              [
                72.793797,
                19.0457265
              ],
              [
                72.793797,
                19.114672
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 3,
        "severity_level": "HIGH",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 276.63,
        "centroid": [
          72.874206,
          19.144614
        ],
        "delta_ndvi": 0.171,
        "delta_ndbi": -0.203,
        "delta_ndwi": -0.021,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.171, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.859422,
                19.156078
              ],
              [
                72.874206,
                19.156078
              ],
              [
                72.887547,
                19.144750000000002
              ],
              [
                72.887547,
                19.133422
              ],
              [
                72.874206,
                19.133422
              ],
              [
                72.859422,
                19.144750000000002
              ],
              [
                72.859422,
                19.156078
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 4,
        "severity_level": "HIGH",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 212.86,
        "centroid": [
          72.882041,
          19.020266
        ],
        "delta_ndvi": 0.183,
        "delta_ndbi": -0.213,
        "delta_ndwi": -0.034,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.183, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.872703,
                19.037328
              ],
              [
                72.882041,
                19.037328
              ],
              [
                72.889891,
                19.022093499999997
              ],
              [
                72.889891,
                19.006859
              ],
              [
                72.882041,
                19.006859
              ],
              [
                72.872703,
                19.022093499999997
              ],
              [
                72.872703,
                19.037328
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 5,
        "severity_level": "HIGH",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 177.59,
        "centroid": [
          72.816126,
          19.147229
        ],
        "delta_ndvi": 0.209,
        "delta_ndbi": -0.244,
        "delta_ndwi": -0.032,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.209, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.805516,
                19.157641
              ],
              [
                72.816126,
                19.157641
              ],
              [
                72.825438,
                19.144555
              ],
              [
                72.825438,
                19.131469
              ],
              [
                72.816126,
                19.131469
              ],
              [
                72.805516,
                19.144555
              ],
              [
                72.805516,
                19.157641
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 6,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 130.92,
        "centroid": [
          72.936091,
          19.032332
        ],
        "delta_ndvi": 0.169,
        "delta_ndbi": -0.196,
        "delta_ndwi": -0.032,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.169, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.925828,
                19.039281
              ],
              [
                72.936091,
                19.039281
              ],
              [
                72.943797,
                19.0326405
              ],
              [
                72.943797,
                19.026
              ],
              [
                72.936091,
                19.026
              ],
              [
                72.925828,
                19.0326405
              ],
              [
                72.925828,
                19.039281
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 7,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 125.4,
        "centroid": [
          72.832027,
          19.042041
        ],
        "delta_ndvi": 0.007,
        "delta_ndbi": 0.371,
        "delta_ndwi": -0.513,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.371, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.824656,
                19.049047
              ],
              [
                72.832027,
                19.049047
              ],
              [
                72.837547,
                19.042797
              ],
              [
                72.837547,
                19.036547
              ],
              [
                72.832027,
                19.036547
              ],
              [
                72.824656,
                19.042797
              ],
              [
                72.824656,
                19.049047
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 8,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 123.44,
        "centroid": [
          72.912546,
          19.029171
        ],
        "delta_ndvi": 0.181,
        "delta_ndbi": -0.212,
        "delta_ndwi": -0.03,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.181, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.905906,
                19.038891
              ],
              [
                72.912546,
                19.038891
              ],
              [
                72.918016,
                19.029320499999997
              ],
              [
                72.918016,
                19.01975
              ],
              [
                72.912546,
                19.01975
              ],
              [
                72.905906,
                19.029320499999997
              ],
              [
                72.905906,
                19.038891
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 9,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 114.53,
        "centroid": [
          72.904066,
          19.126835
        ],
        "delta_ndvi": 0.983,
        "delta_ndbi": -0.406,
        "delta_ndwi": -0.411,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.983, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.897703,
                19.133031
              ],
              [
                72.904066,
                19.133031
              ],
              [
                72.909422,
                19.1263905
              ],
              [
                72.909422,
                19.11975
              ],
              [
                72.904066,
                19.11975
              ],
              [
                72.897703,
                19.1263905
              ],
              [
                72.897703,
                19.133031
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 10,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 111.51,
        "centroid": [
          72.852602,
          19.05117
        ],
        "delta_ndvi": 0.319,
        "delta_ndbi": -0.33,
        "delta_ndwi": -0.059,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.319, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.840281,
                19.059594
              ],
              [
                72.852602,
                19.059594
              ],
              [
                72.864891,
                19.052758
              ],
              [
                72.864891,
                19.045922
              ],
              [
                72.852602,
                19.045922
              ],
              [
                72.840281,
                19.052758
              ],
              [
                72.840281,
                19.059594
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 11,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 101.71,
        "centroid": [
          72.949986,
          19.104801
        ],
        "delta_ndvi": 0.135,
        "delta_ndbi": -0.155,
        "delta_ndwi": -0.023,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.135, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.938719,
                19.114672
              ],
              [
                72.949986,
                19.114672
              ],
              [
                72.957859,
                19.1068595
              ],
              [
                72.957859,
                19.099047
              ],
              [
                72.949986,
                19.099047
              ],
              [
                72.938719,
                19.1068595
              ],
              [
                72.938719,
                19.114672
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 12,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 98.5,
        "centroid": [
          72.912442,
          19.011521
        ],
        "delta_ndvi": 0.165,
        "delta_ndbi": -0.191,
        "delta_ndwi": -0.025,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.165, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.907078,
                19.020531
              ],
              [
                72.912442,
                19.020531
              ],
              [
                72.919188,
                19.012327999999997
              ],
              [
                72.919188,
                19.004125
              ],
              [
                72.912442,
                19.004125
              ],
              [
                72.907078,
                19.012327999999997
              ],
              [
                72.907078,
                19.020531
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 13,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 70.18,
        "centroid": [
          72.832722,
          19.042623
        ],
        "delta_ndvi": 0.208,
        "delta_ndbi": 0.379,
        "delta_ndwi": -0.812,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.812, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.828172,
                19.047094
              ],
              [
                72.832722,
                19.047094
              ],
              [
                72.837156,
                19.0426015
              ],
              [
                72.837156,
                19.038109
              ],
              [
                72.832722,
                19.038109
              ],
              [
                72.828172,
                19.0426015
              ],
              [
                72.828172,
                19.047094
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 14,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 68.76,
        "centroid": [
          72.880835,
          19.000692
        ],
        "delta_ndvi": -0.151,
        "delta_ndbi": 0.224,
        "delta_ndwi": -0.002,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.151, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.877,
                19.005688
              ],
              [
                72.880835,
                19.005688
              ],
              [
                72.884422,
                19.000999999999998
              ],
              [
                72.884422,
                18.996312
              ],
              [
                72.880835,
                18.996312
              ],
              [
                72.877,
                19.000999999999998
              ],
              [
                72.877,
                19.005688
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 15,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 67.87,
        "centroid": [
          72.856689,
          19.070681
        ],
        "delta_ndvi": 0.196,
        "delta_ndbi": -0.221,
        "delta_ndwi": -0.041,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.196, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.851609,
                19.074828
              ],
              [
                72.856689,
                19.074828
              ],
              [
                72.861375,
                19.070531000000003
              ],
              [
                72.861375,
                19.066234
              ],
              [
                72.856689,
                19.066234
              ],
              [
                72.851609,
                19.070531000000003
              ],
              [
                72.851609,
                19.074828
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "mumbai",
        "location_name": "Mumbai",
        "indicator_number": 16,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 55.4,
        "centroid": [
          72.951358,
          19.131155
        ],
        "delta_ndvi": 0.154,
        "delta_ndbi": -0.185,
        "delta_ndwi": -0.022,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.154, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                72.946531,
                19.136938
              ],
              [
                72.951358,
                19.136938
              ],
              [
                72.954734,
                19.13225
              ],
              [
                72.954734,
                19.127562
              ],
              [
                72.951358,
                19.127562
              ],
              [
                72.946531,
                19.13225
              ],
              [
                72.946531,
                19.136938
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in Mumbai using Sentinel-2 L2A observations."
  },
  {
    "id": "tokyo",
    "name": "Tokyo",
    "query": "Analyze Tokyo, Japan between 2021 and 2026",
    "type": "city",
    "parentLocation": "Japan",
    "latitude": 35.6768601,
    "longitude": 139.7638947,
    "bounding_box": [
      139.53889,
      35.45186,
      139.98889,
      35.90186
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 1,
        "severity_level": "CRITICAL",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 18959.15,
        "centroid": [
          139.880408,
          35.528165
        ],
        "delta_ndvi": 0.462,
        "delta_ndbi": -0.395,
        "delta_ndwi": 0.071,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.462, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.752464,
                35.685649
              ],
              [
                139.880408,
                35.685649
              ],
              [
                139.987132,
                35.569633499999995
              ],
              [
                139.987132,
                35.453618
              ],
              [
                139.880408,
                35.453618
              ],
              [
                139.752464,
                35.569633499999995
              ],
              [
                139.752464,
                35.685649
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 2,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 3583.96,
        "centroid": [
          139.904459,
          35.528262
        ],
        "delta_ndvi": 0.487,
        "delta_ndbi": -0.706,
        "delta_ndwi": 0.728,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.728, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.834202,
                35.593364
              ],
              [
                139.904459,
                35.593364
              ],
              [
                139.951097,
                35.523491
              ],
              [
                139.951097,
                35.453618
              ],
              [
                139.904459,
                35.453618
              ],
              [
                139.834202,
                35.523491
              ],
              [
                139.834202,
                35.593364
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 3,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 3256.1,
        "centroid": [
          139.875092,
          35.559622
        ],
        "delta_ndvi": -0.331,
        "delta_ndbi": 0.19,
        "delta_ndwi": 0.01,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.331, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.85266,
                35.607426
              ],
              [
                139.875092,
                35.607426
              ],
              [
                139.901878,
                35.549858
              ],
              [
                139.901878,
                35.49229
              ],
              [
                139.875092,
                35.49229
              ],
              [
                139.85266,
                35.549858
              ],
              [
                139.85266,
                35.607426
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 4,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 1505.97,
        "centroid": [
          139.879923,
          35.579948
        ],
        "delta_ndvi": -0.378,
        "delta_ndbi": 0.221,
        "delta_ndwi": 0.009,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.221, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.854417,
                35.607426
              ],
              [
                139.879923,
                35.607426
              ],
              [
                139.901878,
                35.5766645
              ],
              [
                139.901878,
                35.545903
              ],
              [
                139.879923,
                35.545903
              ],
              [
                139.854417,
                35.5766645
              ],
              [
                139.854417,
                35.607426
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 5,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 1223.85,
        "centroid": [
          139.868663,
          35.520734
        ],
        "delta_ndvi": -0.233,
        "delta_ndbi": 0.292,
        "delta_ndwi": 0.002,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.292, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.855296,
                35.554692
              ],
              [
                139.868663,
                35.554692
              ],
              [
                139.887816,
                35.5190965
              ],
              [
                139.887816,
                35.483501
              ],
              [
                139.868663,
                35.483501
              ],
              [
                139.855296,
                35.5190965
              ],
              [
                139.855296,
                35.554692
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 6,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 264.3,
        "centroid": [
          139.890669,
          35.816163
        ],
        "delta_ndvi": -0.191,
        "delta_ndbi": 0.265,
        "delta_ndwi": 0.034,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.265, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.885179,
                35.8377
              ],
              [
                139.890669,
                35.8377
              ],
              [
                139.901878,
                35.815287999999995
              ],
              [
                139.901878,
                35.792876
              ],
              [
                139.890669,
                35.792876
              ],
              [
                139.885179,
                35.815287999999995
              ],
              [
                139.885179,
                35.8377
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 7,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 235.62,
        "centroid": [
          139.634379,
          35.813111
        ],
        "delta_ndvi": -0.185,
        "delta_ndbi": 0.239,
        "delta_ndwi": 0.055,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.239, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.625902,
                35.830669
              ],
              [
                139.634379,
                35.830669
              ],
              [
                139.649632,
                35.8148485
              ],
              [
                139.649632,
                35.799028
              ],
              [
                139.634379,
                35.799028
              ],
              [
                139.625902,
                35.8148485
              ],
              [
                139.625902,
                35.830669
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 8,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 173.62,
        "centroid": [
          139.934441,
          35.559871
        ],
        "delta_ndvi": -0.522,
        "delta_ndbi": -0.535,
        "delta_ndwi": 0.82,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.522, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.926488,
                35.567876
              ],
              [
                139.934441,
                35.567876
              ],
              [
                139.941429,
                35.560405
              ],
              [
                139.941429,
                35.552934
              ],
              [
                139.934441,
                35.552934
              ],
              [
                139.926488,
                35.560405
              ],
              [
                139.926488,
                35.567876
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 9,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 162.77,
        "centroid": [
          139.737983,
          35.783266
        ],
        "delta_ndvi": -0.058,
        "delta_ndbi": 0.141,
        "delta_ndwi": -0.009,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.141, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.726097,
                35.793755
              ],
              [
                139.737983,
                35.793755
              ],
              [
                139.751585,
                35.7818895
              ],
              [
                139.751585,
                35.770024
              ],
              [
                139.737983,
                35.770024
              ],
              [
                139.726097,
                35.7818895
              ],
              [
                139.726097,
                35.793755
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 10,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 134.86,
        "centroid": [
          139.70321,
          35.794224
        ],
        "delta_ndvi": -0.126,
        "delta_ndbi": 0.17,
        "delta_ndwi": 0.016,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.170, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.690941,
                35.800786
              ],
              [
                139.70321,
                35.800786
              ],
              [
                139.71555,
                35.7946335
              ],
              [
                139.71555,
                35.788481
              ],
              [
                139.70321,
                35.788481
              ],
              [
                139.690941,
                35.7946335
              ],
              [
                139.690941,
                35.800786
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 11,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 109.29,
        "centroid": [
          139.617599,
          35.81521
        ],
        "delta_ndvi": -0.148,
        "delta_ndbi": 0.27,
        "delta_ndwi": -0.013,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.270, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.608324,
                35.82188
              ],
              [
                139.617599,
                35.82188
              ],
              [
                139.625902,
                35.816167
              ],
              [
                139.625902,
                35.810454
              ],
              [
                139.617599,
                35.810454
              ],
              [
                139.608324,
                35.816167
              ],
              [
                139.608324,
                35.82188
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 12,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 106.96,
        "centroid": [
          139.613871,
          35.833942
        ],
        "delta_ndvi": -0.169,
        "delta_ndbi": 0.22,
        "delta_ndwi": 0.043,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.220, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.605687,
                35.839458
              ],
              [
                139.613871,
                35.839458
              ],
              [
                139.622386,
                35.8333055
              ],
              [
                139.622386,
                35.827153
              ],
              [
                139.613871,
                35.827153
              ],
              [
                139.605687,
                35.8333055
              ],
              [
                139.605687,
                35.839458
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 13,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 99.98,
        "centroid": [
          139.891652,
          35.820265
        ],
        "delta_ndvi": -0.245,
        "delta_ndbi": 0.323,
        "delta_ndwi": 0.05,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.245, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.885179,
                35.828032
              ],
              [
                139.891652,
                35.828032
              ],
              [
                139.901878,
                35.820561
              ],
              [
                139.901878,
                35.81309
              ],
              [
                139.891652,
                35.81309
              ],
              [
                139.885179,
                35.820561
              ],
              [
                139.885179,
                35.828032
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 14,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 91.46,
        "centroid": [
          139.750915,
          35.685225
        ],
        "delta_ndvi": -0.101,
        "delta_ndbi": 0.139,
        "delta_ndwi": 0.025,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.139, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.744554,
                35.691801
              ],
              [
                139.750915,
                35.691801
              ],
              [
                139.758617,
                35.68477
              ],
              [
                139.758617,
                35.677739
              ],
              [
                139.750915,
                35.677739
              ],
              [
                139.744554,
                35.68477
              ],
              [
                139.744554,
                35.691801
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 15,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 82.93,
        "centroid": [
          139.774051,
          35.757949
        ],
        "delta_ndvi": -0.016,
        "delta_ndbi": 0.188,
        "delta_ndwi": -0.073,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.188, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.762132,
                35.761235
              ],
              [
                139.774051,
                35.761235
              ],
              [
                139.784984,
                35.7577195
              ],
              [
                139.784984,
                35.754204
              ],
              [
                139.774051,
                35.754204
              ],
              [
                139.762132,
                35.7577195
              ],
              [
                139.762132,
                35.761235
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "tokyo",
        "location_name": "Tokyo",
        "indicator_number": 16,
        "severity_level": "MODERATE",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 82.93,
        "centroid": [
          139.760095,
          35.566274
        ],
        "delta_ndvi": 0.278,
        "delta_ndbi": -0.267,
        "delta_ndwi": -0.036,
        "confidence_pct": 95,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.278, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                139.751585,
                35.570512
              ],
              [
                139.760095,
                35.570512
              ],
              [
                139.767406,
                35.566557
              ],
              [
                139.767406,
                35.562602
              ],
              [
                139.760095,
                35.562602
              ],
              [
                139.751585,
                35.566557
              ],
              [
                139.751585,
                35.570512
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in Tokyo using Sentinel-2 L2A observations."
  },
  {
    "id": "london",
    "name": "London",
    "query": "Analyze London, United Kingdom between 2021 and 2026",
    "type": "city",
    "parentLocation": "United Kingdom",
    "latitude": 51.5074456,
    "longitude": -0.1277653,
    "bounding_box": [
      -0.35277,
      51.28245,
      0.09723,
      51.73245
    ],
    "hotspotsCount": 16,
    "hotspots": [
      {
        "id": "cr-1",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 1,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 1737.68,
        "centroid": [
          -0.212218,
          51.656989
        ],
        "delta_ndvi": -0.242,
        "delta_ndbi": 0.291,
        "delta_ndwi": 0.045,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.291, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.25609,
                51.690262
              ],
              [
                -0.212218,
                51.690262
              ],
              [
                -0.163805,
                51.650272
              ],
              [
                -0.163805,
                51.610282
              ],
              [
                -0.212218,
                51.610282
              ],
              [
                -0.25609,
                51.650272
              ],
              [
                -0.25609,
                51.690262
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-2",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 2,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 1117.68,
        "centroid": [
          -0.213967,
          51.660634
        ],
        "delta_ndvi": -0.285,
        "delta_ndbi": 0.345,
        "delta_ndwi": 0.057,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.285, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.253454,
                51.689384
              ],
              [
                -0.213967,
                51.689384
              ],
              [
                -0.164684,
                51.653788
              ],
              [
                -0.164684,
                51.618192
              ],
              [
                -0.213967,
                51.618192
              ],
              [
                -0.253454,
                51.653788
              ],
              [
                -0.253454,
                51.689384
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-3",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 3,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 300.5,
        "centroid": [
          -0.268762,
          51.444438
        ],
        "delta_ndvi": -0.221,
        "delta_ndbi": 0.292,
        "delta_ndwi": 0.005,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.292, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.285973,
                51.455595
              ],
              [
                -0.268762,
                51.455595
              ],
              [
                -0.251696,
                51.443290000000005
              ],
              [
                -0.251696,
                51.430985
              ],
              [
                -0.268762,
                51.430985
              ],
              [
                -0.285973,
                51.443290000000005
              ],
              [
                -0.285973,
                51.455595
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-4",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 4,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 260.71,
        "centroid": [
          -0.134941,
          51.655483
        ],
        "delta_ndvi": -0.283,
        "delta_ndbi": 0.331,
        "delta_ndwi": 0.021,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.331, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.154137,
                51.663016
              ],
              [
                -0.134941,
                51.663016
              ],
              [
                -0.108434,
                51.655106
              ],
              [
                -0.108434,
                51.647196
              ],
              [
                -0.134941,
                51.647196
              ],
              [
                -0.154137,
                51.655106
              ],
              [
                -0.154137,
                51.663016
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-5",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 5,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 253.59,
        "centroid": [
          -0.132774,
          51.677202
        ],
        "delta_ndvi": -0.283,
        "delta_ndbi": 0.325,
        "delta_ndwi": 0.065,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.283, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.148864,
                51.687626
              ],
              [
                -0.132774,
                51.687626
              ],
              [
                -0.11986,
                51.6766395
              ],
              [
                -0.11986,
                51.665653
              ],
              [
                -0.132774,
                51.665653
              ],
              [
                -0.148864,
                51.6766395
              ],
              [
                -0.148864,
                51.687626
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-6",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 6,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 242.9,
        "centroid": [
          -0.284454,
          51.634541
        ],
        "delta_ndvi": -0.33,
        "delta_ndbi": 0.392,
        "delta_ndwi": 0.052,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.330, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.298278,
                51.644559
              ],
              [
                -0.284454,
                51.644559
              ],
              [
                -0.269274,
                51.6340125
              ],
              [
                -0.269274,
                51.623466
              ],
              [
                -0.284454,
                51.623466
              ],
              [
                -0.298278,
                51.6340125
              ],
              [
                -0.298278,
                51.644559
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-7",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 7,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 238.74,
        "centroid": [
          -0.021759,
          51.640014
        ],
        "delta_ndvi": 0.544,
        "delta_ndbi": 0.365,
        "delta_ndwi": -0.778,
        "confidence_pct": 96,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: -0.778, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.032848,
                51.66038
              ],
              [
                -0.021759,
                51.66038
              ],
              [
                -0.011754,
                51.6397255
              ],
              [
                -0.011754,
                51.619071
              ],
              [
                -0.021759,
                51.619071
              ],
              [
                -0.032848,
                51.6397255
              ],
              [
                -0.032848,
                51.66038
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-8",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 8,
        "severity_level": "CRITICAL",
        "category": "Vegetation gain",
        "user_label": "Vegetation Regrowth & Crops",
        "color": "#10b981",
        "area_hectares": 215.58,
        "centroid": [
          -0.021306,
          51.639807
        ],
        "delta_ndvi": 0.655,
        "delta_ndbi": 0.314,
        "delta_ndwi": -0.767,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation regrowth or seasonal agricultural crop intensification detected.",
        "technical_evidence": "NDVI increase: +0.655, NIR canopy vigor elevation.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.031969,
                51.66038
              ],
              [
                -0.021306,
                51.66038
              ],
              [
                -0.011754,
                51.6397255
              ],
              [
                -0.011754,
                51.619071
              ],
              [
                -0.021306,
                51.619071
              ],
              [
                -0.031969,
                51.6397255
              ],
              [
                -0.031969,
                51.66038
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-9",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 9,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 206.08,
        "centroid": [
          -0.167901,
          51.564619
        ],
        "delta_ndvi": -0.244,
        "delta_ndbi": 0.391,
        "delta_ndwi": -0.131,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.391, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.181383,
                51.574247
              ],
              [
                -0.167901,
                51.574247
              ],
              [
                -0.155895,
                51.565458
              ],
              [
                -0.155895,
                51.556669
              ],
              [
                -0.167901,
                51.556669
              ],
              [
                -0.181383,
                51.565458
              ],
              [
                -0.181383,
                51.574247
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-10",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 10,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 182.91,
        "centroid": [
          -0.135366,
          51.655035
        ],
        "delta_ndvi": -0.303,
        "delta_ndbi": 0.357,
        "delta_ndwi": 0.018,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.303, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.150622,
                51.663016
              ],
              [
                -0.135366,
                51.663016
              ],
              [
                -0.118102,
                51.6555455
              ],
              [
                -0.118102,
                51.648075
              ],
              [
                -0.135366,
                51.648075
              ],
              [
                -0.150622,
                51.6555455
              ],
              [
                -0.150622,
                51.663016
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-11",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 11,
        "severity_level": "CRITICAL",
        "category": "Deforestation",
        "user_label": "Deforestation & Canopy Loss",
        "color": "#ef4444",
        "area_hectares": 120.56,
        "centroid": [
          -0.260991,
          51.444073
        ],
        "delta_ndvi": -0.259,
        "delta_ndbi": 0.319,
        "delta_ndwi": 0.016,
        "confidence_pct": 96,
        "simple_explanation": "Vegetation loss and canopy disturbance detected via reduced NDVI.",
        "technical_evidence": "NDVI drop: -0.259, Red-edge / NIR reflectance loss confirmed.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.269274,
                51.453837
              ],
              [
                -0.260991,
                51.453837
              ],
              [
                -0.251696,
                51.4446085
              ],
              [
                -0.251696,
                51.43538
              ],
              [
                -0.260991,
                51.43538
              ],
              [
                -0.269274,
                51.4446085
              ],
              [
                -0.269274,
                51.453837
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-12",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 12,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 117.59,
        "centroid": [
          -0.260676,
          51.637559
        ],
        "delta_ndvi": -0.303,
        "delta_ndbi": 0.443,
        "delta_ndwi": -0.07,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.443, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.269274,
                51.645438
              ],
              [
                -0.260676,
                51.645438
              ],
              [
                -0.251696,
                51.637088500000004
              ],
              [
                -0.251696,
                51.628739
              ],
              [
                -0.260676,
                51.628739
              ],
              [
                -0.269274,
                51.637088500000004
              ],
              [
                -0.269274,
                51.645438
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-13",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 13,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 112.84,
        "centroid": [
          -0.027542,
          51.628101
        ],
        "delta_ndvi": 0.368,
        "delta_ndbi": 0.432,
        "delta_ndwi": -0.644,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.432, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.034606,
                51.637528
              ],
              [
                -0.027542,
                51.637528
              ],
              [
                -0.021422,
                51.62786
              ],
              [
                -0.021422,
                51.618192
              ],
              [
                -0.027542,
                51.618192
              ],
              [
                -0.034606,
                51.62786
              ],
              [
                -0.034606,
                51.637528
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-14",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 14,
        "severity_level": "CRITICAL",
        "category": "Water change",
        "user_label": "Water Surface Dynamics",
        "color": "#0284c7",
        "area_hectares": 112.84,
        "centroid": [
          -0.169666,
          51.678009
        ],
        "delta_ndvi": -0.179,
        "delta_ndbi": 0.204,
        "delta_ndwi": 0.062,
        "confidence_pct": 95,
        "simple_explanation": "Surface water moisture and water-body boundary fluctuation detected.",
        "technical_evidence": "NDWI shift: +0.062, Green-NIR band divergence.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.183141,
                51.681473
              ],
              [
                -0.169666,
                51.681473
              ],
              [
                -0.156774,
                51.676638999999994
              ],
              [
                -0.156774,
                51.671805
              ],
              [
                -0.169666,
                51.671805
              ],
              [
                -0.183141,
                51.676638999999994
              ],
              [
                -0.183141,
                51.681473
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-15",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 15,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 105.71,
        "centroid": [
          -0.068947,
          51.366731
        ],
        "delta_ndvi": -0.19,
        "delta_ndbi": 0.218,
        "delta_ndwi": 0.018,
        "confidence_pct": 95,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.218, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.077672,
                51.372098
              ],
              [
                -0.068947,
                51.372098
              ],
              [
                -0.058336,
                51.365946
              ],
              [
                -0.058336,
                51.359794
              ],
              [
                -0.068947,
                51.359794
              ],
              [
                -0.077672,
                51.365946
              ],
              [
                -0.077672,
                51.372098
              ]
            ]
          ]
        }
      },
      {
        "id": "cr-16",
        "location_id": "london",
        "location_name": "London",
        "indicator_number": 16,
        "severity_level": "CRITICAL",
        "category": "Urban development",
        "user_label": "Urban Growth & Built-up",
        "color": "#f97316",
        "area_hectares": 84.33,
        "centroid": [
          -0.018408,
          51.648496
        ],
        "delta_ndvi": 0.576,
        "delta_ndbi": 0.423,
        "delta_ndwi": -0.755,
        "confidence_pct": 96,
        "simple_explanation": "New concrete, asphalt, or built-up infrastructure expansion detected.",
        "technical_evidence": "NDBI elevation: +0.423, SWIR surface reflectance increase.",
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                -0.024059,
                51.659501
              ],
              [
                -0.018408,
                51.659501
              ],
              [
                -0.014391,
                51.6493935
              ],
              [
                -0.014391,
                51.639286
              ],
              [
                -0.018408,
                51.639286
              ],
              [
                -0.024059,
                51.6493935
              ],
              [
                -0.024059,
                51.659501
              ]
            ]
          ]
        }
      }
    ],
    "summaryNote": "16 verified multispectral anomaly clusters detected in London using Sentinel-2 L2A observations."
  }
];

export const getHotspotCityById = (id: string): HotspotCityData | undefined => {
  const cleanId = id.toLowerCase().trim();
  return HOTSPOT_CITIES_REGISTRY.find(c => 
    c.id === cleanId || 
    c.name.toLowerCase().includes(cleanId) ||
    cleanId.includes(c.id)
  );
};

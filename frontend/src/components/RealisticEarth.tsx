import React, { useEffect, useRef, useState } from 'react';

interface RealisticEarthProps {
  className?: string;
}

export const RealisticEarth: React.FC<RealisticEarthProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mediaQuery.matches;
    const motionListener = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', motionListener);

    // Initialize WebGL context
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { 
        alpha: true, 
        antialias: true, 
        powerPreference: 'high-performance' 
      });
    } catch (e) {
      gl = null;
    }

    if (!gl) {
      setWebGlSupported(false);
      return () => mediaQuery.removeEventListener('change', motionListener);
    }

    // Vertex Shader: Fullscreen quad
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Ray-Sphere intersection with realistic Rayleigh limb atmosphere,
    // smooth day/night terminator, specular ocean glint, and cloud layer.
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_earthTexture;
      uniform sampler2D u_cloudTexture;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_lightDir;
      uniform float u_rotation;

      #define PI 3.14159265359

      void main() {
        // Normalized screen coords (-1.0 to 1.0, aspect ratio preserved)
        vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        
        float dist = length(st);
        float radius = 0.42; // Sphere radius in clip space

        // Outer Space / Atmospheric Outer Glow
        if (dist > radius) {
          // Thin, delicate Rayleigh atmospheric limb haze (0.42 to 0.46)
          float limbDist = dist - radius;
          if (limbDist < 0.055) {
            float hazeFactor = pow(1.0 - (limbDist / 0.055), 2.8);
            // Directional sunlit haze
            vec3 hazeColor = vec3(0.38, 0.65, 0.98);
            float sunFacing = max(0.0, dot(normalize(vec3(st, 0.0)), u_lightDir.xy) * 0.5 + 0.5);
            gl_FragColor = vec4(hazeColor * sunFacing * 0.55 * hazeFactor, hazeFactor * 0.45 * sunFacing);
          } else {
            gl_FragColor = vec4(0.0);
          }
          return;
        }

        // Ray-Sphere intersection: calculate 3D sphere surface normal
        float z = sqrt(max(0.0, radius * radius - dist * dist));
        vec3 N = normalize(vec3(st.x, st.y, z));

        // View vector (camera looking down +Z)
        vec3 V = vec3(0.0, 0.0, 1.0);

        // Axial tilt (23.4 degrees)
        float tilt = 0.38; // ~22 degrees tilt
        mat3 tiltMatrix = mat3(
          cos(tilt), -sin(tilt), 0.0,
          sin(tilt),  cos(tilt), 0.0,
          0.0,        0.0,       1.0
        );
        vec3 tiltedN = tiltMatrix * N;

        // Spherical UV mapping (lat/long)
        float lat = asin(clamp(tiltedN.y, -1.0, 1.0));
        float lon = atan(tiltedN.x, tiltedN.z);

        // Longitude texture coordinate with continuous slow rotation
        // India/Asia offset: centered at ~77°E longitude
        float u_surf = fract((lon + u_rotation + 1.25) / (2.0 * PI));
        float v_surf = clamp(0.5 - lat / PI, 0.001, 0.999);

        // Sample base earth surface
        vec4 earthColor = texture2D(u_earthTexture, vec2(u_surf, v_surf));

        // Sample cloud layer with differential rotation (clouds drift slightly faster)
        float u_cld = fract((lon + u_rotation * 1.15 + 1.25) / (2.0 * PI));
        vec4 cloudSample = texture2D(u_cloudTexture, vec2(u_cld, v_surf));
        float cloudAlpha = clamp(cloudSample.r * 0.72, 0.0, 1.0);

        // Directional sunlight and soft terminator
        float NdotL = dot(N, u_lightDir);
        // Realistic smooth terminator roll-off (twilight zone between -0.12 and +0.22)
        float daylight = smoothstep(-0.12, 0.25, NdotL);

        // Night side ambient illumination (city glow and starlight)
        float nightAmbient = 0.04;
        float lightIntensity = daylight * 0.96 + nightAmbient;

        // Specular ocean reflection glint on water (only where daylight > 0)
        vec3 R = reflect(-u_lightDir, N);
        float spec = pow(max(0.0, dot(R, V)), 22.0) * daylight;
        // Check if ocean pixel (blue dominant in base texture)
        float isOcean = step(0.08, earthColor.b - earthColor.r);
        vec3 specularGlint = vec3(0.9, 0.95, 1.0) * spec * isOcean * 0.35 * (1.0 - cloudAlpha);

        // Surface composite with clouds
        vec3 surfaceWithClouds = mix(earthColor.rgb, vec3(0.96, 0.97, 1.0), cloudAlpha * daylight);

        // Realistic Rayleigh atmospheric edge scattering (Fresnel rim)
        float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.2);
        vec3 atmosphereGlow = vec3(0.35, 0.62, 0.95) * fresnel * (daylight * 0.7 + 0.15);

        // Final color assembly
        vec3 finalColor = surfaceWithClouds * lightIntensity + specularGlint + atmosphereGlow;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // Shader compiler helper
    const createShader = (type: number, source: string) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) {
      setWebGlSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      setWebGlSupported(false);
      return;
    }

    gl.useProgram(program);

    // Fullscreen quad buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Texture loaders with authentic procedural fallbacks
    const earthTexture = gl.createTexture();
    const cloudTexture = gl.createTexture();

    const initProceduralTexture = (tex: WebGLTexture, isCloud: boolean) => {
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      const w = 512;
      const h = 256;
      const canvasTmp = document.createElement('canvas');
      canvasTmp.width = w;
      canvasTmp.height = h;
      const ctx = canvasTmp.getContext('2d');
      if (ctx) {
        if (!isCloud) {
          // Deep authentic natural ocean gradient
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, '#0c2340');
          grad.addColorStop(0.5, '#103058');
          grad.addColorStop(1, '#08172c');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Natural continents: Asia / India / Africa / Eurasia
          ctx.fillStyle = '#2d5a27'; // Natural olive vegetation
          // Asia / Indian subcontinent
          ctx.beginPath();
          ctx.moveTo(w * 0.58, h * 0.42); // Himalayas
          ctx.lineTo(w * 0.63, h * 0.58); // East coast India
          ctx.lineTo(w * 0.60, h * 0.65); // Cape Comorin
          ctx.lineTo(w * 0.57, h * 0.58); // West coast
          ctx.lineTo(w * 0.55, h * 0.45); // Indus
          ctx.closePath();
          ctx.fill();

          // Desert belt (Thar / Arabia / Sahara)
          ctx.fillStyle = '#9e814a';
          ctx.fillRect(w * 0.38, h * 0.36, w * 0.18, h * 0.14);

          // Eurasian landmass
          ctx.fillStyle = '#346630';
          ctx.fillRect(w * 0.45, h * 0.20, w * 0.35, h * 0.22);
        } else {
          // Natural soft cloud swirls
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          for (let i = 0; i < 40; i++) {
            const cx = (i * 37) % w;
            const cy = (i * 23) % h;
            const r = 25 + (i % 30);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, canvasTmp);
      }
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.REPEAT);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    };

    if (earthTexture) initProceduralTexture(earthTexture, false);
    if (cloudTexture) initProceduralTexture(cloudTexture, true);

    // Asynchronously stream high-resolution NASA Blue Marble imagery
    const loadRealTexture = (url: string, tex: WebGLTexture) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!gl) return;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      };
      img.onerror = () => {
        // Keep procedural fallback if remote image fails
      };
      img.src = url;
    };

    if (earthTexture) {
      loadRealTexture(
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        earthTexture
      );
    }
    if (cloudTexture) {
      loadRealTexture(
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
        cloudTexture
      );
    }

    // Uniform locations
    const uEarthTexture = gl.getUniformLocation(program, 'u_earthTexture');
    const uCloudTexture = gl.getUniformLocation(program, 'u_cloudTexture');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uLightDir = gl.getUniformLocation(program, 'u_lightDir');
    const uRotation = gl.getUniformLocation(program, 'u_rotation');

    // Bind texture units: Unit 0 = Earth, Unit 1 = Clouds
    gl.uniform1i(uEarthTexture, 0);
    gl.uniform1i(uCloudTexture, 1);

    // Natural sunlight direction (coming from high upper-left)
    const light = [-0.65, 0.45, 0.62];
    const len = Math.sqrt(light[0] * light[0] + light[1] * light[1] + light[2] * light[2]);
    gl.uniform3f(uLightDir, light[0] / len, light[1] / len, light[2] / len);

    // Animation variables: slow, majestic planetary rotation
    let animationFrameId: number;
    let rotation = 0.0; // Current longitude angle
    let lastTime = performance.now();

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl?.viewport(0, 0, width, height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = (time: number) => {
      const dt = (time - lastTime) * 0.001;
      lastTime = time;

      if (!reducedMotion) {
        // Slow planetary rotation: ~1 full turn every 140 seconds
        rotation += dt * 0.045;
      }

      gl!.uniform2f(uResolution, canvas.width, canvas.height);
      gl!.uniform1f(uRotation, rotation);

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, earthTexture);

      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, cloudTexture);

      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      mediaQuery.removeEventListener('change', motionListener);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Thin Orbital Telemetry Ellipse */}
      <div 
        className="absolute inset-[-12%] rounded-full border border-blue-500/15 scale-110 pointer-events-none transition-opacity duration-500"
        style={{ transform: 'rotate(-22deg)' }}
      />
      <div 
        className="absolute inset-[-20%] rounded-full border border-dashed border-slate-400/20 dark:border-blue-400/20 pointer-events-none"
        style={{ transform: 'rotate(-22deg)' }}
      />

      {/* 2. WebGL Canvas or High-Fidelity CSS Fallback */}
      {webGlSupported ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block filter drop-shadow-[0_20px_45px_rgba(37,99,235,0.18)] dark:drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
          aria-label="High-resolution scientific 3D Earth visualization showing Copernicus Sentinel-2 satellite observation"
          role="img"
        />
      ) : (
        /* Graceful CSS Sphere Fallback if WebGL unavailable */
        <div className="earth-sphere-realistic w-full h-full">
          <div className="earth-surface" />
          <div className="earth-clouds" />
          <div className="earth-atmosphere-shadow" />
          <div className="earth-rim-glow" />
        </div>
      )}

      {/* 3. Subtle Latitude/Longitude Spatial Reference Ring */}
      <div className="absolute inset-0 rounded-full border border-blue-400/10 pointer-events-none" />

      {/* 4. Orbiting Copernicus Sentinel-2 Satellite Telemetry Capsule */}
      <div 
        className="absolute inset-[-45px] pointer-events-none"
        style={{ animation: 'satellite-orbit-sweep 28s linear infinite' }}
      >
        <div className="absolute top-6 right-12 flex items-center space-x-2">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-blue-500 block shadow-[0_0_12px_#3b82f6]" />
            <span className="w-7 h-7 rounded-full border border-blue-400/60 block absolute -top-[8px] -left-[8px] animate-ping" />
          </div>
          <div className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-zinc-900/95 border border-blue-200 dark:border-blue-800 text-[10px] font-mono text-blue-700 dark:text-blue-300 shadow-lg backdrop-blur-md font-bold flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SENTINEL-2A · 786 KM · 10M GSD</span>
          </div>
        </div>
      </div>

      {/* 5. Geographic Region Focus Indicator: Asia / Indian Ocean Basin */}
      <div className="absolute bottom-6 left-8 pointer-events-none hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 backdrop-blur-md text-[10px] font-mono text-slate-700 dark:text-zinc-300 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="font-semibold uppercase tracking-wider">NADIR AOI: ASIA / INDIAN BASIN</span>
      </div>
    </div>
  );
};

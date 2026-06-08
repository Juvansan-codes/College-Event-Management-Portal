import React, { useRef, useEffect, useCallback } from 'react'

/**
 * LiquidBackground — WebGL liquid-metal animation.
 *
 * Creates thick, glossy, reflective metallic blobs that flow and merge
 * like mercury — matching the Portfolite reference aesthetic.
 */

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;

  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;
  uniform float u_isDark;

  /* ─── Noise primitives ─── */
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  /* ─── Domain-warped height field for liquid metal surface ─── */
  float liquidField(vec2 p, float t) {
    /* First warp layer — static composition */
    float warp1 = snoise(vec3(p * 0.6, t));
    float warp2 = snoise(vec3(p * 0.6 + 5.0, t + 3.0));
    vec2 warped = p + vec2(warp1, warp2) * 0.8;

    /* Second warp — creates the folding/merging blob shapes */
    float warp3 = snoise(vec3(warped * 1.2, t + 10.0));
    float warp4 = snoise(vec3(warped * 1.2 + 8.0, t + 7.0));
    vec2 warped2 = warped + vec2(warp3, warp4) * 0.4;

    /* Final surface evaluation — layered for organic detail */
    float s1 = snoise(vec3(warped2 * 1.0, t));
    float s2 = snoise(vec3(warped2 * 2.0 + 3.0, t + 5.0));
    float s3 = snoise(vec3(warped2 * 4.0 + 7.0, t + 12.0));

    return s1 * 0.6 + s2 * 0.3 + s3 * 0.1;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float t = u_time;

    /* Mouse influence */
    vec2 mousePos = (u_mouse - 0.5) * vec2(aspect, 1.0);
    float mouseDist = length(p - mousePos);
    float mouseWarp = smoothstep(0.6, 0.0, mouseDist) * 0.15;
    p += normalize(p - mousePos + 0.001) * mouseWarp;

    /* ═══ Compute liquid metal height field ═══ */
    float field = liquidField(p, t);

    /* ═══ Compute surface normal via finite differences (for lighting) ═══ */
    float eps = 0.008;
    float fx = liquidField(p + vec2(eps, 0.0), t);
    float fy = liquidField(p + vec2(0.0, eps), t);
    vec3 normal = normalize(vec3((field - fx) / eps, (field - fy) / eps, 1.0));

    /* ═══ Metallic lighting ═══ */
    vec3 lightDir1 = normalize(vec3(0.4, 0.6, 1.0));
    vec3 lightDir2 = normalize(vec3(-0.5, 0.3, 0.8));
    vec3 viewDir   = vec3(0.0, 0.0, 1.0);

    /* Diffuse */
    float diff1 = max(dot(normal, lightDir1), 0.0);
    float diff2 = max(dot(normal, lightDir2), 0.0);
    float diffuse = diff1 * 0.7 + diff2 * 0.3;

    /* Specular — sharp, metallic highlights */
    vec3 halfDir1 = normalize(lightDir1 + viewDir);
    vec3 halfDir2 = normalize(lightDir2 + viewDir);
    float spec1 = pow(max(dot(normal, halfDir1), 0.0), 64.0);
    float spec2 = pow(max(dot(normal, halfDir2), 0.0), 48.0);
    float specular = spec1 * 0.8 + spec2 * 0.4;

    /* Fresnel — bright edges like real metal */
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

    /* ═══ Shape the liquid metal region ═══ */
    /* High threshold — only strong noise peaks become blobs, rest is empty background */
    float blobMask = smoothstep(0.18, 0.38, field);

    /* ═══ Metal color composition ═══ */
    float metalBrightness = diffuse * 0.5 + specular * 1.2 + fresnel * 0.5;
    metalBrightness = clamp(metalBrightness, 0.0, 1.5);

    vec3 metalColor = vec3(0.7, 0.72, 0.75) * diffuse
                    + vec3(1.0, 0.98, 0.95) * specular
                    + vec3(0.6, 0.62, 0.65) * fresnel * 0.6;

    /* Add subtle environmental reflection */
    float envReflect = snoise(vec3(normal.xy * 3.0, t + 30.0));
    metalColor += vec3(0.15, 0.15, 0.18) * envReflect * 0.3;

    /* Darken the crevices (ambient occlusion approximation) */
    float ao = smoothstep(-0.3, 0.3, field);
    metalColor *= mix(0.3, 1.0, ao);

    /* ═══ Background ═══ */
    vec3 darkBg  = vec3(0.031, 0.031, 0.055);
    vec3 lightBg = vec3(0.96, 0.96, 0.96);
    vec3 bg = mix(lightBg, darkBg, u_isDark);

    /* ═══ Light mode: polished gunmetal chrome ═══ */
    float sharpMask = mix(
      smoothstep(0.08, 0.30, blobMask),   /* Light: softer edges for smoother shapes */
      blobMask,                            /* Dark: keep soft gradients */
      u_isDark
    );

    /* Polished dark chrome — lighter base so highlights pop, subtle cool tint */
    vec3 lightMetalColor = vec3(0.22, 0.23, 0.26) * diffuse        /* Gunmetal base */
                         + vec3(0.95, 0.93, 0.90) * specular * 1.3  /* Strong specular punch */
                         + vec3(0.55, 0.58, 0.65) * fresnel * 0.9;  /* Cool-tinted edge glow */

    /* Subtle environment reflection for surface variety */
    lightMetalColor += vec3(0.08, 0.09, 0.12) * envReflect * 0.25;

    /* Softer AO — not too harsh in crevices */
    lightMetalColor *= mix(0.45, 1.0, ao);

    vec3 finalMetal = mix(lightMetalColor, metalColor, u_isDark);

    /* Final composite */
    vec3 color = mix(bg, finalMetal, sharpMask);

    /* Subtle vignette */
    float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.5;
    color *= mix(1.0, vignette, 0.3 * u_isDark);

    gl_FragColor = vec4(color, 1.0);
  }
`

/* ─── Component (Performance-Optimized) ─── */

const LiquidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({})
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 })
  const interpRef = useRef<number>(0)

  const FIXED_TIME = 42.0

  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }, [])

  const initGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true, // keep frame when not rendering
    })
    if (!gl) return

    glRef.current = gl

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()!
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }

    programRef.current = program
    gl.useProgram(program)

    /* Cache uniform locations once — avoids per-frame lookups */
    uniformsRef.current = {
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u_mouse: gl.getUniformLocation(program, 'u_mouse'),
      u_isDark: gl.getUniformLocation(program, 'u_isDark'),
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
  }, [createShader])

  /* Single draw call — used by all triggers */
  const drawFrame = useCallback(() => {
    const gl = glRef.current
    const u = uniformsRef.current
    if (!gl || !u.u_time) return

    /* Resize check */
    const canvas = canvasRef.current!
    const dpr = Math.min(window.devicePixelRatio, 1.0) // Capped at 1x for perf
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }

    const theme = document.documentElement.getAttribute('data-theme')
    const isDark = theme === 'dark' ? 1.0 : 0.0

    gl.uniform1f(u.u_time, FIXED_TIME)
    gl.uniform2f(u.u_resolution, gl.canvas.width, gl.canvas.height)
    gl.uniform2f(u.u_mouse, mouseRef.current.x, mouseRef.current.y)
    gl.uniform1f(u.u_isDark, isDark)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }, [])

  /* Mouse interpolation — short rAF burst that stops when settled */
  const startMouseInterp = useCallback(() => {
    if (interpRef.current) return // already running

    const step = () => {
      const dx = targetMouseRef.current.x - mouseRef.current.x
      const dy = targetMouseRef.current.y - mouseRef.current.y

      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        mouseRef.current.x = targetMouseRef.current.x
        mouseRef.current.y = targetMouseRef.current.y
        drawFrame()
        interpRef.current = 0
        return // stop loop — settled
      }

      mouseRef.current.x += dx * 0.08
      mouseRef.current.y += dy * 0.08
      drawFrame()
      interpRef.current = requestAnimationFrame(step)
    }

    interpRef.current = requestAnimationFrame(step)
  }, [drawFrame])

  useEffect(() => {
    initGL()

    /* Initial render */
    drawFrame()

    /* Mouse — trigger interp burst */
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      }
      startMouseInterp()
    }

    /* Resize — single redraw */
    const handleResize = () => drawFrame()

    /* Theme toggle — MutationObserver for on-demand redraw */
    const observer = new MutationObserver(() => drawFrame())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      if (interpRef.current) cancelAnimationFrame(interpRef.current)
      observer.disconnect()
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [initGL, drawFrame, startMouseInterp])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

export default LiquidBackground


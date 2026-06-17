import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface ConstellationCanvasProps {
  activeIndex: number
}

/* ═══════════════════════════════════════════════════════════════
   COLOR PALETTE
   ═══════════════════════════════════════════════════════════════ */
const PALETTE = [
  { main: '#FFFFFF', accent: '#E5E7EB' },   // Silver/White
  { main: '#06B6D4', accent: '#22D3EE' },   // Cyan
  { main: '#9CA3AF', accent: '#D1D5DB' },   // Slate Gray
  { main: '#10B981', accent: '#34D399' },   // Emerald
  { main: '#F59E0B', accent: '#FBBF24' },   // Amber
  { main: '#EF4444', accent: '#F87171' },   // Red
]

/* ═══════════════════════════════════════════════════════════════
   ORBITAL RING — a thin glowing ring that orbits around shapes
   ═══════════════════════════════════════════════════════════════ */
const OrbitalRing: React.FC<{
  radius: number
  color: string
  speed: number
  axis: 'x' | 'y' | 'z'
  thickness?: number
}> = ({ radius, color, speed, axis, thickness = 0.02 }) => {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (!ref.current) return
    if (axis === 'x') ref.current.rotation.x += delta * speed
    if (axis === 'y') ref.current.rotation.y += delta * speed
    if (axis === 'z') ref.current.rotation.z += delta * speed
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, thickness, 8, 48]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.6}
      />
    </mesh>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NODE 0: "Data Hub" — Sphere with orbital rings (Create Events)
   A central glowing sphere surrounded by 3 tilted orbital rings,
   like a SaaS dashboard visualization.
   ═══════════════════════════════════════════════════════════════ */
const DataHub: React.FC<{ groupRef: React.RefObject<THREE.Group>; isActive?: boolean }> = ({ groupRef, isActive = true }) => {
  if (!isActive) return <group ref={groupRef} visible={false} />
  return (
    <group ref={groupRef}>
      {/* Central glowing distorted core */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color={PALETTE[0].main}
          emissive={PALETTE[0].main}
          emissiveIntensity={0.5}
          distort={0.25}
          speed={3}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>
      {/* Wireframe outer data lattice */}
      <mesh scale={1.08}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color={PALETTE[0].accent}
          emissive={PALETTE[0].accent}
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
      <points scale={1.08}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <pointsMaterial
          color={PALETTE[0].accent}
          size={0.035}
          sizeAttenuation
        />
      </points>
      {/* Orbit rings */}
      <OrbitalRing radius={0.9} color={PALETTE[0].accent} speed={0.6} axis="y" />
      <OrbitalRing radius={1.1} color={PALETTE[0].main} speed={-0.4} axis="x" />
      <OrbitalRing radius={1.3} color={PALETTE[0].accent} speed={0.3} axis="z" thickness={0.015} />
      {/* Small orbiting satellite spheres */}
      <Float speed={4} floatIntensity={0.5}>
        <mesh position={[0.9, 0.3, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.2} />
        </mesh>
      </Float>
      <Float speed={3} floatIntensity={0.5}>
        <mesh position={[-0.7, -0.5, 0.4]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={PALETTE[0].accent} emissive={PALETTE[0].accent} emissiveIntensity={1.2} />
        </mesh>
      </Float>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NODE 1: "Flow Grid" — Layered translucent planes (Registrations)
   Stacked floating glass panels representing data layers/forms.
   ═══════════════════════════════════════════════════════════════ */
const FlowGrid: React.FC<{ groupRef: React.RefObject<THREE.Group>; isActive?: boolean }> = ({ groupRef, isActive = true }) => {
  const planes = useMemo(() => [
    { y: 0.55, rotZ: 0.1, opacity: 0.3, scale: 1.25 },
    { y: 0.18, rotZ: -0.05, opacity: 0.5, scale: 1.05 },
    { y: -0.18, rotZ: 0.08, opacity: 0.65, scale: 0.88 },
    { y: -0.55, rotZ: -0.12, opacity: 0.35, scale: 0.72 },
  ], [])

  if (!isActive) return <group ref={groupRef} visible={false} />

  return (
    <group ref={groupRef}>
      {planes.map((p, i) => (
        <group key={i} position={[0, p.y, 0]} rotation={[0.3, p.rotZ, 0]}>
          {/* Glowing glass center */}
          <mesh>
            <boxGeometry args={[1.5 * p.scale, 0.02, 0.85 * p.scale]} />
            <meshStandardMaterial
              color={PALETTE[1].main}
              emissive={PALETTE[1].accent}
              emissiveIntensity={0.4}
              transparent
              opacity={p.opacity}
              roughness={0.05}
              metalness={0.95}
            />
          </mesh>
          {/* Glowing holographic border */}
          <mesh>
            <boxGeometry args={[1.51 * p.scale, 0.03, 0.86 * p.scale]} />
            <meshStandardMaterial
              color={PALETTE[1].accent}
              emissive={PALETTE[1].accent}
              emissiveIntensity={0.8}
              wireframe
              transparent
              opacity={0.35}
            />
          </mesh>
        </group>
      ))}
      <OrbitalRing radius={1.25} color={PALETTE[1].accent} speed={0.4} axis="y" thickness={0.012} />
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NODE 2: "Crystal Network" — Interconnected icosahedron (Sponsors)
   A wireframe icosahedron with inner solid core and outer glow.
   ═══════════════════════════════════════════════════════════════ */
const CrystalNetwork: React.FC<{ groupRef: React.RefObject<THREE.Group>; isActive?: boolean }> = ({ groupRef, isActive = true }) => {
  const coreRef = useRef<THREE.Mesh>(null!)
  const shellRef = useRef<THREE.Mesh>(null!)
  const pointsRef = useRef<THREE.Points>(null!)

  useFrame((_, delta) => {
    if (!isActive) return
    if (coreRef.current) coreRef.current.rotation.y -= delta * 0.4
    if (shellRef.current) shellRef.current.rotation.y += delta * 0.25
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.25
  })

  if (!isActive) return <group ref={groupRef} visible={false} />

  return (
    <group ref={groupRef}>
      {/* Solid inner core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={PALETTE[2].main}
          emissive={PALETTE[2].main}
          emissiveIntensity={0.7}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      {/* Wireframe outer shell */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color={PALETTE[2].accent}
          emissive={PALETTE[2].accent}
          emissiveIntensity={0.6}
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
      {/* Constellation node points */}
      <points ref={pointsRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <pointsMaterial
          color={PALETTE[2].accent}
          size={0.045}
          sizeAttenuation
        />
      </points>
      {/* Outermost translucent shell */}
      <mesh>
        <icosahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color={PALETTE[2].main}
          emissive={PALETTE[2].main}
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.18}
        />
      </mesh>
      <OrbitalRing radius={1.4} color={PALETTE[2].accent} speed={-0.5} axis="z" thickness={0.01} />
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NODE 3: "Pulse Blob" — Organic wobbling sphere (Volunteers)
   A morphing, organic shape that feels alive and dynamic.
   ═══════════════════════════════════════════════════════════════ */
const PulseBlob: React.FC<{ groupRef: React.RefObject<THREE.Group>; isActive?: boolean }> = ({ groupRef, isActive = true }) => {
  const innerRef = useRef<THREE.Mesh>(null!)
  const outerRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (!isActive) return
    if (innerRef.current) innerRef.current.rotation.x += delta * 0.15
    if (outerRef.current) outerRef.current.rotation.y -= delta * 0.1
  })

  if (!isActive) return <group ref={groupRef} visible={false} />

  return (
    <group ref={groupRef}>
      {/* Organic wobbling core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <MeshWobbleMaterial
          color={PALETTE[3].main}
          emissive={PALETTE[3].main}
          emissiveIntensity={0.4}
          factor={0.55}
          speed={2}
          roughness={0.25}
          metalness={0.75}
        />
      </mesh>
      {/* Wobbling wireframe forcefield */}
      <mesh ref={outerRef} scale={1.12}>
        <sphereGeometry args={[0.85, 24, 24]} />
        <MeshWobbleMaterial
          color={PALETTE[3].accent}
          emissive={PALETTE[3].accent}
          emissiveIntensity={0.7}
          factor={0.55}
          speed={2}
          wireframe
          transparent
          opacity={0.22}
        />
      </mesh>
      <OrbitalRing radius={1.3} color={PALETTE[3].accent} speed={0.7} axis="x" thickness={0.015} />
      <OrbitalRing radius={1.15} color={PALETTE[3].main} speed={-0.5} axis="z" thickness={0.01} />
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NODE 4: "Analytics Prism" — Floating bars + grid (Analytics)
   Abstract 3D bar chart with a surrounding ring, like a dashboard.
   ═══════════════════════════════════════════════════════════════ */
const AnalyticsPrism: React.FC<{ groupRef: React.RefObject<THREE.Group>; isActive?: boolean }> = ({ groupRef, isActive = true }) => {
  const bars = useMemo(() => [
    { x: -0.5, h: 0.6, z: 0 },
    { x: -0.2, h: 1.0, z: 0.1 },
    { x: 0.1, h: 0.8, z: -0.1 },
    { x: 0.4, h: 1.3, z: 0 },
    { x: 0.7, h: 0.5, z: 0.15 },
  ], [])

  const barRefs = useRef<(THREE.Mesh | null)[]>([])

  useFrame(({ clock }) => {
    if (!isActive) return
    const t = clock.getElapsedTime()
    barRefs.current.forEach((bar, i) => {
      if (!bar) return
      // Dynamic height fluctuation simulating real-time activity
      const scaleY = 1 + Math.sin(t * 2.5 + i * 1.2) * 0.28
      bar.scale.y = scaleY
      const mat = bar.material as THREE.MeshStandardMaterial
      if (mat) {
        mat.emissiveIntensity = 0.3 + (scaleY * 0.35)
      }
    })
  })

  if (!isActive) return <group ref={groupRef} visible={false} />

  return (
    <group ref={groupRef}>
      {bars.map((bar, i) => (
        <mesh
          key={i}
          ref={(el) => { barRefs.current[i] = el }}
          position={[bar.x, bar.h / 2 - 0.4, bar.z]}
        >
          <boxGeometry args={[0.18, bar.h, 0.18]} />
          <meshStandardMaterial
            color={PALETTE[4].main}
            emissive={PALETTE[4].main}
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      ))}
      {/* Base holographic coordinate grid */}
      <gridHelper
        args={[1.8, 8, PALETTE[4].accent, PALETTE[4].main]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0.1, -0.44, 0]}
      />
      {/* Base platform disc */}
      <mesh position={[0.1, -0.45, 0]}>
        <cylinderGeometry args={[1, 1, 0.03, 16]} />
        <meshStandardMaterial
          color={PALETTE[4].accent}
          emissive={PALETTE[4].accent}
          emissiveIntensity={0.2}
          transparent
          opacity={0.25}
          metalness={0.9}
        />
      </mesh>
      <OrbitalRing radius={1.3} color={PALETTE[4].accent} speed={0.4} axis="y" thickness={0.015} />
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NODE 5: "Signal Tower" — Torus stack (Communication)
   Stacked concentric torus rings rising upward, like signal waves.
   ═══════════════════════════════════════════════════════════════ */
const SignalWave = ({ index, color }: { index: number; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime() + index * 0.7
    const progress = (t % 2.1) / 2.1 // 0 to 1 loop
    meshRef.current.scale.set(progress * 1.6, progress * 1.6, 1)
    meshRef.current.position.y = -0.55 + progress * 1.4

    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    if (mat) {
      mat.opacity = (1 - progress) * 0.65
    }
  })
  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.7, 0.032, 8, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        transparent
        opacity={0}
      />
    </mesh>
  )
}

const SignalTower: React.FC<{ groupRef: React.RefObject<THREE.Group>; isActive?: boolean }> = ({ groupRef, isActive = true }) => {
  if (!isActive) return <group ref={groupRef} visible={false} />
  return (
    <group ref={groupRef}>
      {/* Base plate */}
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.03, 16]} />
        <meshStandardMaterial
          color={PALETTE[5].main}
          emissive={PALETTE[5].main}
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Loop of active upward signal waves */}
      {Array.from({ length: 3 }).map((_, i) => (
        <SignalWave key={i} index={i} color={PALETTE[5].accent} />
      ))}

      {/* Central transmitter beam */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial
          color="#fff"
          emissive="#fff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.35}
        />
      </mesh>
      {/* Glowing top beacon */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.8} />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NODE SYSTEM — Orchestrates all 6 compositions
   ═══════════════════════════════════════════════════════════════ */
const NodeSystem = ({ activeIndex }: { activeIndex: number }) => {
  const refs = [
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
    useRef<THREE.Group>(null!),
  ]

  const containerRef = useRef<THREE.Group>(null!)
  const lightRef = useRef<THREE.PointLight>(null!)
  const activeColor = useMemo(() => new THREE.Color(PALETTE[activeIndex].main), [activeIndex])

  const [visibleIndices, setVisibleIndices] = useState<number[]>([activeIndex])

  useEffect(() => {
    setVisibleIndices((prev) => {
      if (prev.includes(activeIndex)) return prev
      return [...prev, activeIndex]
    })

    const timer = setTimeout(() => {
      setVisibleIndices((prev) => prev.filter((idx) => idx === activeIndex))
    }, 800)

    return () => clearTimeout(timer)
  }, [activeIndex])

  useFrame((_, delta) => {
    // Smoothly transition container x position strictly to the right side
    if (containerRef.current) {
      const targetX = 1.8
      containerRef.current.position.x = THREE.MathUtils.damp(containerRef.current.position.x, targetX, 3.5, delta)
    }

    refs.forEach((ref, idx) => {
      const group = ref.current
      if (!group) return

      const isActive = activeIndex === idx
      const targetScale = isActive ? 1.4 : 0.001
      const targetZ = isActive ? 0 : -5

      const lambda = 4
      group.scale.x = THREE.MathUtils.damp(group.scale.x, targetScale, lambda, delta)
      group.scale.y = THREE.MathUtils.damp(group.scale.y, targetScale, lambda, delta)
      group.scale.z = THREE.MathUtils.damp(group.scale.z, targetScale, lambda, delta)

      group.position.z = THREE.MathUtils.damp(group.position.z, targetZ, lambda, delta)

      group.visible = group.scale.x > 0.01

      // Gentle rotation only when active
      if (isActive) {
        group.rotation.y += delta * 0.15
      }
    })

    if (lightRef.current) {
      lightRef.current.color.lerp(activeColor, delta * 3)
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={containerRef} position={[1.8, 0, 0]}>
        <DataHub groupRef={refs[0]} isActive={visibleIndices.includes(0)} />
        <FlowGrid groupRef={refs[1]} isActive={visibleIndices.includes(1)} />
        <CrystalNetwork groupRef={refs[2]} isActive={visibleIndices.includes(2)} />
        <PulseBlob groupRef={refs[3]} isActive={visibleIndices.includes(3)} />
        <AnalyticsPrism groupRef={refs[4]} isActive={visibleIndices.includes(4)} />
        <SignalTower groupRef={refs[5]} isActive={visibleIndices.includes(5)} />

        {/* Dynamic accent light */}
        <pointLight ref={lightRef} position={[2, 1.5, 2]} intensity={2.5} distance={10} />
      </group>
    </Float>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS WRAPPER
   ═══════════════════════════════════════════════════════════════ */
const ConstellationCanvas: React.FC<ConstellationCanvasProps> = ({ activeIndex }) => {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
          camera={{ position: [0, 0, 5.5], fov: 50 }}
          dpr={[1, 1.2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
        {/* Ambient fill */}
        <ambientLight intensity={0.35} />

        {/* Key light */}
        <directionalLight position={[5, 5, 5]} intensity={0.7} color="#ffffff" />

        {/* Colored accent fills */}
        <pointLight position={[-6, 4, -4]} intensity={0.5} color="#9CA3AF" distance={18} />
        <pointLight position={[6, -3, 4]} intensity={0.3} color="#06B6D4" distance={18} />

        {/* Subtle ambient particles */}
        <Sparkles count={60} scale={14} size={1.5} speed={0.2} opacity={0.12} color="#ffffff" />

        {/* The Shape System */}
        <NodeSystem activeIndex={activeIndex} />
      </Canvas>
    </div>
  )
}

export default React.memo(ConstellationCanvas)

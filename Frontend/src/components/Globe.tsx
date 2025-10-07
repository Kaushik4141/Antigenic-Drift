import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import countriesGeoJSON from '../data/countries.json';
import virusData from '../data/virusData.json';

interface GlobeProps {
  onCountryClick: (countryName: string) => void;
}

interface CountryData {
  sequences: number;
  mutations: string[];
  risk: 'High' | 'Medium' | 'Low';
}

const GLOBE_RADIUS = 2;

function getRiskColor(risk: string): string {
  switch (risk) {
    case 'High':
      return '#ef4444';
    case 'Medium':
      return '#fbbf24';
    case 'Low':
      return '#10b981';
    default:
      return '#6b7280';
  }
}

function convertGeoToVector3(coordinates: number[][], radius: number) {
  return coordinates.map(([lng, lat]) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  });
}

function Country({
  geometry,
  countryName,
  risk,
  onCountryClick,
  isHovered,
  onHover
}: {
  geometry: THREE.BufferGeometry;
  countryName: string;
  risk: string;
  onCountryClick: (name: string) => void;
  isHovered: boolean;
  onHover: (name: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = getRiskColor(risk);
  const hoverColor = '#ffffff';

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onCountryClick(countryName);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(countryName);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = 'default';
      }}
    >
      <meshBasicMaterial
        color={isHovered ? hoverColor : baseColor}
        transparent
        opacity={isHovered ? 0.8 : 0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CountryBorders({ coordinates }: { coordinates: number[][] }) {
  const points = useMemo(() => {
    return convertGeoToVector3(coordinates, GLOBE_RADIUS + 0.01);
  }, [coordinates]);

  return (
    <Line
      points={points}
      color="#ffffff"
      lineWidth={0.5}
      transparent
      opacity={0.3}
    />
  );
}

export default function Globe({ onCountryClick }: GlobeProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const texture = useLoader(
    THREE.TextureLoader,
    'https://unpkg.com/three-globe@2.24.3/example/img/earth-blue-marble.jpg'
  );

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  const countryGeometries = useMemo(() => {
    const geometries: Array<{
      name: string;
      geometry: THREE.BufferGeometry;
      risk: string;
      borders: number[][][];
    }> = [];

    countriesGeoJSON.features.forEach((feature: any) => {
      const countryName = feature.properties.name;
      const virusInfo = virusData[countryName as keyof typeof virusData] as CountryData | undefined;

      if (!virusInfo) return;

      const coordinates = feature.geometry.coordinates;
      const geometryType = feature.geometry.type;

      const processPolygon = (coords: number[][][]) => {
        coords.forEach((ring) => {
          if (ring.length < 3) return;

          const vertices = convertGeoToVector3(ring, GLOBE_RADIUS);

          const shape = new THREE.Shape();
          vertices.forEach((v, i) => {
            const point = new THREE.Vector2(v.x, v.y);
            if (i === 0) {
              shape.moveTo(point.x, point.y);
            } else {
              shape.lineTo(point.x, point.y);
            }
          });

          const geometry = new THREE.ShapeGeometry(shape);

          const positionAttribute = geometry.attributes.position;
          for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3(
              positionAttribute.getX(i),
              positionAttribute.getY(i),
              0
            );

            const closestVertex = vertices.reduce((prev, curr) => {
              const prevDist = prev.distanceTo(new THREE.Vector3(vertex.x, vertex.y, 0));
              const currDist = curr.distanceTo(new THREE.Vector3(vertex.x, vertex.y, 0));
              return currDist < prevDist ? curr : prev;
            });

            positionAttribute.setXYZ(i, closestVertex.x, closestVertex.y, closestVertex.z);
          }

          geometry.attributes.position.needsUpdate = true;

          geometries.push({
            name: countryName,
            geometry,
            risk: virusInfo.risk,
            borders: [ring]
          });
        });
      };

      if (geometryType === 'Polygon') {
        processPolygon(coordinates);
      } else if (geometryType === 'MultiPolygon') {
        coordinates.forEach((polygon: number[][][]) => {
          processPolygon(polygon);
        });
      }
    });

    return geometries;
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <mesh ref={globeRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {countryGeometries.map((country, idx) => (
        <Country
          key={`${country.name}-${idx}`}
          geometry={country.geometry}
          countryName={country.name}
          risk={country.risk}
          onCountryClick={onCountryClick}
          isHovered={hoveredCountry === country.name}
          onHover={setHoveredCountry}
        />
      ))}

      {countriesGeoJSON.features.map((feature: any) => {
        const countryName = feature.properties.name;
        const virusInfo = virusData[countryName as keyof typeof virusData];

        if (!virusInfo) return null;

        const coordinates = feature.geometry.coordinates;
        const geometryType = feature.geometry.type;

        const renderBorders = (coords: number[][][]) => {
          return coords.map((ring, ringIdx) => (
            <CountryBorders
              key={`${countryName}-border-${ringIdx}`}
              coordinates={ring}
            />
          ));
        };

        if (geometryType === 'Polygon') {
          return renderBorders(coordinates);
        } else if (geometryType === 'MultiPolygon') {
          return coordinates.map((polygon: number[][][], polyIdx: number) => (
            <group key={`${countryName}-poly-${polyIdx}`}>
              {renderBorders(polygon)}
            </group>
          ));
        }

        return null;
      })}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        rotateSpeed={0.5}
      />
    </>
  );
}

// ─── Ganapathi Mentor AI — Landing Page Type System ─────────────────────────
// Strict TypeScript interfaces. No `any`. No escape hatches.

// ─── Color Token ─────────────────────────────────────────────────────────────
export type EnterpriseColor =
  | '#2563EB' // Quantum Blue
  | '#7C3AED' // Silicon Violet
  | '#059669'; // Acid Emerald

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// ─── Particle System ─────────────────────────────────────────────────────────
export interface Particle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  colorIndex: number;
  phaseOffset: number;
  amplitude: number;
  speed: number;
  size: number;
  opacity: number;
}

export interface ParticleConfig {
  gridSpacing?: number;       // px gap between grid nodes (default 64)
  warpRadius?: number;        // mouse influence radius in px (default 160)
  warpForce?: number;         // max deflection in px (default 30)
  minSize?: number;           // min dot radius (default 1.0)
  maxSize?: number;           // max dot radius (default 1.8)
  minOpacity?: number;        // min dot alpha (default 0.20)
  maxOpacity?: number;        // max dot alpha (default 0.45)
  timeStep?: number;          // RAF time increment (default 0.012)
}

export interface ParticleBackgroundProps {
  config?: ParticleConfig;
  className?: string;
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
export interface NavLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavbarProps {
  links?: NavLinkItem[];
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export interface HeroStatItem {
  value: string;
  label: string;
}

export interface HeroProps {
  headline?: string;
  subheadline?: string;
  stats?: HeroStatItem[];
}

// ─── Bento Feature Grid ───────────────────────────────────────────────────────
export interface BentoMetric {
  key: string;
  value: string;
  unit?: string;
}

export interface BentoFeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** CSS grid-column span class e.g. "col-span-1" or "col-span-2" */
  colSpan: 'col-span-1' | 'col-span-2';
  /** CSS grid-row span class */
  rowSpan: 'row-span-1' | 'row-span-2';
  metrics: BentoMetric[];
  routingLabel: string; // e.g. "via AWS Bedrock Nova Pro"
}

export interface BentoFeatureGridProps {
  features?: BentoFeatureItem[];
}

// ─── Ambient Shifts ──────────────────────────────────────────────────────────
export interface AmbientShiftsProps {
  children: React.ReactNode;
  /** Base bg hex at scroll 0 */
  baseColor?: string;
  /** Peak bg hex at scroll midpoint */
  peakColor?: string;
}

// ─── Trust Layer ─────────────────────────────────────────────────────────────
export interface TrustProviderItem {
  name: string;
  shortName: string;
}

export interface ComplianceBadge {
  label: string;
  detail: string;
}

export interface TrustLayerProps {
  providers?: TrustProviderItem[];
  badges?: ComplianceBadge[];
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface FooterProps {
  links?: FooterLink[];
  socials?: FooterSocialLink[];
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─── Scroll Progress Hook ─────────────────────────────────────────────────────
export interface ScrollProgressOptions {
  /** Target element ref — if omitted, tracks window scroll */
  target?: React.RefObject<HTMLElement | null>;
  /** Input range [0..1] */
  offset?: [number, number];
}

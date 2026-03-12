export interface SiteConfig {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  authorType: string;
  authorName: string;
  authorMeta?: string;
  status: string;
  tags: string[];
  readingTimeMinutes?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KeySwitch {
  id: string;
  name: string;
  manufacturer: string;
  type: string;
  actuationForceGf?: number;
  bottomOutForceGf?: number;
  preTravelMm?: number;
  totalTravelMm?: number;
  forceCurve?: number[][];
  soundProfile?: string;
  soundSampleUrl?: string;
  springType?: string;
  stemMaterial?: string;
  housingMaterial?: string;
  priceUsd?: number;
  imageUrl?: string;
  sourceUrl?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Encounter {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContainerMetric {
  name: string;
  cpuPercent: number;
  memoryUsedBytes: number;
  memoryLimitBytes: number;
  status: string;
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  uptimeSeconds: number;
  loadAverage1m: number;
  loadAverage5m: number;
  loadAverage15m: number;
  networkRxBytesPerSec: number;
  networkTxBytesPerSec: number;
  containerMetrics: ContainerMetric[];
  timestamp: string;
}

export interface AuthPayload {
  token: string;
  expiresAt: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

export interface PostConnection {
  nodes: Post[];
  totalCount: number;
  pageInfo: PageInfo;
}

export interface SwitchConnection {
  nodes: KeySwitch[];
  totalCount: number;
  pageInfo: PageInfo;
}

export interface EncounterConnection {
  nodes: Encounter[];
  totalCount: number;
  pageInfo: PageInfo;
}

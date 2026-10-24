export type IntelligencePlan = 'GRATUITO' | 'START' | 'PRO' | 'MAX';
export type IntelligenceTier = 'GRATUITO' | 'START' | 'PRO';
export type InsightCategory = 'SALES' | 'INVENTORY' | 'FINANCE';
export type InsightSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'POSITIVE';
export type InsightStatus = 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
export type InsightMetricUnit =
  | 'currency'
  | 'percentage'
  | 'units'
  | 'days'
  | 'count';

export type InsightMetric = {
  label: string;
  value: number | string;
  comparisonValue?: number | string;
  unit?: InsightMetricUnit;
};

export type BusinessInsight = {
  id: string;
  ruleKey?: string;
  recordId?: number;
  category: InsightCategory;
  severity: InsightSeverity;
  status?: InsightStatus;
  title: string;
  description: string;
  recommendation: string;
  metrics: InsightMetric[];
  entity?: {
    type: 'PRODUCT' | 'VARIANT';
    id: number;
    parentId?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  lastDetectedAt?: string;
  readAt?: string | null;
  resolvedAt?: string | null;
  dismissedAt?: string | null;
};

export type IntelligenceCapabilities = {
  tier: IntelligenceTier;
  detailLevel: 'BASIC' | 'STANDARD' | 'ADVANCED';
  salesAnalysis: boolean;
  inventoryAnalysis: boolean;
  financeAnalysis: boolean;
  history: boolean;
  advancedRecommendations: boolean;
  predictions: boolean;
  smartPush: boolean;
};

export type LockedIntelligenceFeature = {
  key:
    | 'INVENTORY_ANALYSIS'
    | 'FINANCE_ANALYSIS'
    | 'HISTORY'
    | 'PREDICTIONS'
    | 'ADVANCED_RECOMMENDATIONS'
    | 'SMART_PUSH';
  title: string;
  description: string;
  requiredPlan: 'START' | 'PRO';
};

export type BusinessIntelligenceResponse = {
  generatedAt: string;
  plan: IntelligencePlan;
  capabilities: IntelligenceCapabilities;
  lockedFeatures: LockedIntelligenceFeature[];
  summary: {
    total: number;
    attention: number;
    positive: number;
    unread: number;
  };
  items: BusinessInsight[];
};

export type BusinessInsightHistoryResponse = {
  plan: IntelligencePlan;
  capabilities: IntelligenceCapabilities;
  items: BusinessInsight[];
};

export interface Biomarkers {
  sleep_hours: number;
  glucose_level: number;
  heart_rate: number;
}

export interface HealthMetric {
  id: number;
  biomarkers: Biomarkers;
  interpretation: string | null;
  recommendations: string[];
  recorded_at: string | null;
}

export type ValidationErrors = Record<string, string[]>;

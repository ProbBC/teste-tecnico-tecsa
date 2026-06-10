import type { Biomarkers, HealthMetric } from '../types/health';
import { request } from './client';

interface Wrapped<T> {
  data: T;
}

export function listHealthMetrics(): Promise<HealthMetric[]> {
  return request<Wrapped<HealthMetric[]>>('/health-metrics').then((r) => r.data);
}

export function createHealthMetric(biomarkers: Biomarkers): Promise<HealthMetric> {
  return request<Wrapped<HealthMetric>>('/health-metrics', {
    method: 'POST',
    body: biomarkers,
  }).then((r) => r.data);
}

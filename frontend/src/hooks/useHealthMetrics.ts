import { useCallback, useEffect, useState } from 'react';

import { createHealthMetric, listHealthMetrics } from '../api/healthMetrics';
import { ApiError } from '../api/client';
import type { Biomarkers, HealthMetric, ValidationErrors } from '../types/health';

interface UseHealthMetrics {
  metrics: HealthMetric[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  fieldErrors: ValidationErrors;
  refresh: () => Promise<void>;
  submit: (biomarkers: Biomarkers) => Promise<HealthMetric | null>;
}

export function useHealthMetrics(): UseHealthMetrics {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMetrics(await listHealthMetrics());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(async (biomarkers: Biomarkers): Promise<HealthMetric | null> => {
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const created = await createHealthMetric(biomarkers);
      setMetrics((current) => [created, ...current]);
      return created;
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.validationErrors) setFieldErrors(e.validationErrors);
      } else {
        setError('Erro ao enviar os dados.');
      }
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { metrics, loading, submitting, error, fieldErrors, refresh, submit };
}

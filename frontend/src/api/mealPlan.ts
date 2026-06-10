import type { MealPlan } from '../types/mealPlan';
import { request } from './client';

interface Wrapped<T> {
  data: T;
}

export function generateMealPlan(): Promise<MealPlan> {
  return request<Wrapped<MealPlan>>('/meal-plans', { method: 'POST' }).then((r) => r.data);
}

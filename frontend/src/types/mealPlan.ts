export interface Meal {
  type: string;
  items: string[];
  kcal: number | null;
}

export interface MealPlan {
  summary: string;
  daily_calories: number | null;
  meals: Meal[];
  notes: string;
}

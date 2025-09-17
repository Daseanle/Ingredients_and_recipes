import type { Recipe } from '../types';

export const generateRecipe = async (
  ingredients: string[],
  mealType: string,
  dietaryRestrictions: string,
  craving: string,
  maxTotalTime: string,
  equipment: string[],
  condiments: string[],
  language: 'en' | 'zh'
): Promise<Recipe> => {
  try {
    const response = await fetch('/api/generate-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients,
        mealType,
        dietaryRestrictions,
        craving,
        maxTotalTime,
        equipment,
        condiments,
        language
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const recipeData = await response.json();
    return recipeData as Recipe;

  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe.");
  }
};

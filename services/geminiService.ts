
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A creative and catchy title for the recipe."
    },
    description: {
      type: Type.STRING,
      description: "A short, appealing description of the dish."
    },
    prepTime: {
        type: Type.STRING,
        description: "Estimated preparation time, e.g., '15 minutes'."
    },
    cookTime: {
        type: Type.STRING,
        description: "Estimated cooking time, e.g., '30 minutes'."
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "A list of all necessary ingredients, including quantities."
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "Step-by-step instructions for preparing the meal."
    },
  },
  required: ["title", "description", "prepTime", "cookTime", "ingredients", "instructions"]
};

export const generateRecipe = async (
  ingredients: string[],
  mealType: string,
  dietaryRestrictions: string
): Promise<Recipe> => {
  const ingredientsString = ingredients.join(', ');
  const dietString = dietaryRestrictions !== 'None' ? ` The recipe must be ${dietaryRestrictions}.` : '';

  const prompt = `You are an expert chef. Create a delicious ${mealType} recipe using mainly these ingredients: ${ingredientsString}.${dietString} Be creative and ensure the recipe is easy to follow. Provide a full list of ingredients with quantities, and clear, step-by-step instructions.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const jsonText = response.text;
    const recipeData = JSON.parse(jsonText);

    // Basic validation
    if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
        throw new Error("Invalid recipe format received from API.");
    }

    return recipeData as Recipe;

  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe from Gemini API.");
  }
};

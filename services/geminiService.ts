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
    totalTime: {
        type: Type.STRING,
        description: "The total combined prep and cook time, e.g., '45 minutes'."
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
  required: ["title", "description", "prepTime", "cookTime", "totalTime", "ingredients", "instructions"]
};

const getDietaryInstruction = (diet: string): string => {
    switch(diet) {
        case 'None':
            return '';
        case 'Muscle Building':
            return ' The recipe must be high in protein and suitable for muscle building.';
        case 'Weight Loss':
            return ' The recipe must be low in calories and suitable for weight loss.';
        case 'Low Glycemic':
            return ' The recipe must be low on the glycemic index, suitable for managing blood sugar levels.';
        case 'Heart-Healthy':
            return ' The recipe must be heart-healthy, meaning low in sodium and saturated fats.';
        default:
            return ` The recipe must be ${diet}.`; // for Vegetarian, Vegan, Gluten-Free, Keto, Paleo
    }
}

const getTimeInstruction = (time: string): string => {
    switch(time) {
        case '< 15 mins':
            return ' The total cooking time (prep + cook) must be less than 15 minutes.';
        case '< 30 mins':
            return ' The total cooking time (prep + cook) must be less than 30 minutes.';
        case '< 1 hour':
            return ' The total cooking time (prep + cook) must be less than 1 hour.';
        case '> 1 hour':
             return ' This should be a recipe that takes more than 1 hour to prepare and cook, for a more complex or slow-cooked meal.';
        case 'Any':
        default:
            return '';
    }
}

const getEquipmentInstruction = (equipment: string[]): string => {
    if (equipment.length === 0) {
        return " Assume the user has a standard stovetop and basic kitchen utensils.";
    }
    return ` The user has the following equipment available: ${equipment.join(', ')}. The recipe must only use these items.`;
}

const getCondimentsInstruction = (condiments: string[]): string => {
    if (condiments.length === 0) {
        return " Assume basic salt and pepper are available.";
    }
    return ` The user also has the following condiments and spices available, which can be used as needed: ${condiments.join(', ')}.`;
}


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
  const ingredientsString = ingredients.join(', ');
  const dietString = getDietaryInstruction(dietaryRestrictions);
  const timeString = getTimeInstruction(maxTotalTime);
  const equipmentString = getEquipmentInstruction(equipment);
  const condimentsString = getCondimentsInstruction(condiments);
  const cravingString = craving ? ` The user is specifically craving something like "${craving}", so try to incorporate that idea.` : '';
  const languageInstruction = language === 'zh' ? ' Please provide the entire recipe in Chinese (Simplified).' : '';

  const prompt = `You are an expert chef and nutritionist focused on minimizing food waste. Create a delicious ${mealType} recipe using mainly these ingredients: ${ingredientsString}. ${condimentsString}${dietString}${timeString}${equipmentString}${cravingString} Prioritize using ingredients that are expiring soon. Be creative and ensure the recipe is easy to follow. Provide a full list of ingredients with quantities, and clear, step-by-step instructions.${languageInstruction}`;

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

    if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
        throw new Error("Invalid recipe format received from API.");
    }

    return recipeData as Recipe;

  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe from Gemini API.");
  }
};
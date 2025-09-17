import type { NextApiRequest, NextApiResponse } from 'next';
import type { Recipe } from '../types';

// This is a Vercel Serverless Function.
// It will run in a Node.js environment on the server, not in the browser.

const recipeSchemaDescription = `{
  "title": "string (A creative and catchy title for the recipe.)",
  "description": "string (A short, appealing description of the dish.)",
  "prepTime": "string (Estimated preparation time, e.g., '15 minutes'.)",
  "cookTime": "string (Estimated cooking time, e.g., '30 minutes'.)",
  "totalTime": "string (The total combined prep and cook time, e.g., '45 minutes'.)",
  "ingredients": "string[] (A list of all necessary ingredients, including quantities.)",
  "instructions": "string[] (Step-by-step instructions for preparing the meal.)"
}`;

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
            return ` The recipe must be ${diet}.`;
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


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const {
        ingredients,
        mealType,
        dietaryRestrictions,
        craving,
        maxTotalTime,
        equipment,
        condiments,
        language
    } = req.body;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured on the server.' });
    }

    const ingredientsString = ingredients.join(', ');
    const dietString = getDietaryInstruction(dietaryRestrictions);
    const timeString = getTimeInstruction(maxTotalTime);
    const equipmentString = getEquipmentInstruction(equipment);
    const condimentsString = getCondimentsInstruction(condiments);
    const cravingString = craving ? ` The user is specifically craving something like "${craving}", so try to incorporate that idea.` : '';
    const languageInstruction = language === 'zh' ? ' Please provide the entire recipe in Chinese (Simplified).' : '';

    const userPrompt = `You are an expert chef and nutritionist focused on minimizing food waste. Create a delicious ${mealType} recipe using mainly these ingredients: ${ingredientsString}. ${condimentsString}${dietString}${timeString}${equipmentString}${cravingString} Prioritize using ingredients that are expiring soon. Be creative and ensure the recipe is easy to follow. Provide a full list of ingredients with quantities, and clear, step-by-step instructions.${languageInstruction}`;

    const systemPrompt = `You are a helpful assistant that generates recipes. You must respond with a valid JSON object that follows this structure: ${recipeSchemaDescription}. Do not include any other text, explanations, or markdown formatting around the JSON object.`;

    try {
        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("DeepSeek API Error:", errorBody);
            return res.status(response.status).json({ error: `API request failed: ${errorBody.error?.message || 'Unknown error'}` });
        }

        const data = await response.json();
        const jsonText = data.choices[0].message.content;
        const recipeData = JSON.parse(jsonText);

        if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
            return res.status(500).json({ error: "Invalid recipe format received from API." });
        }

        return res.status(200).json(recipeData);

    } catch (error) {
        console.error("Error generating recipe:", error);
        return res.status(500).json({ error: "Failed to generate recipe from DeepSeek API." });
    }
}

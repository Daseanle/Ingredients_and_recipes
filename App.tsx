import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PantryManager } from './components/PantryManager';
import { RecipeCard } from './components/RecipeCard';
import { Loader } from './components/Loader';
import { generateRecipe } from './services/geminiService';
import type { Recipe, PantryItem } from './types';

const App: React.FC = () => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const storedItems = localStorage.getItem('pantryItems');
      return storedItems ? JSON.parse(storedItems) : [{ id: '1', name: 'chicken breasts', quantity: '3' }, { id: '2', name: 'rice', quantity: '1 cup' }, { id: '3', name: 'broccoli', quantity: '1 head' }];
    } catch (error) {
      console.error("Failed to parse pantry items from localStorage", error);
      return [];
    }
  });
  const [mealType, setMealType] = useState<string>('Dinner');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('None');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
    } catch (error) {
      console.error("Failed to save pantry items to localStorage", error);
    }
  }, [pantryItems]);

  const handleGenerateRecipe = useCallback(async () => {
    if (pantryItems.length === 0) {
      setError('Your pantry is empty! Please add some ingredients first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);

    const ingredientsList = pantryItems.map(item => `${item.quantity} of ${item.name}`);

    try {
      const result = await generateRecipe(ingredientsList, mealType, dietaryRestrictions);
      setRecipe(result);
    } catch (err) {
      console.error(err);
      setError('Sorry, I couldn\'t come up with a recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [pantryItems, mealType, dietaryRestrictions]);
  
  const handleCookRecipe = useCallback((usedIngredients: string[]) => {
    setPantryItems(currentPantry => {
      const pantryItemsToRemove = new Set<string>();
      
      usedIngredients.forEach(usedIngredient => {
        // Find which pantry item name is mentioned in the recipe ingredient
        const pantryItemMatch = currentPantry.find(pantryItem => 
          usedIngredient.toLowerCase().includes(pantryItem.name.toLowerCase())
        );

        if (pantryItemMatch) {
          pantryItemsToRemove.add(pantryItemMatch.id);
        }
      });

      return currentPantry.filter(item => !pantryItemsToRemove.has(item.id));
    });
    // Clear the current recipe to encourage generating a new one
    setRecipe(null); 
  }, []);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
  const diets = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="space-y-6">
            <PantryManager items={pantryItems} setItems={setPantryItems} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mealType" className="block text-lg font-semibold text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="diet" className="block text-lg font-semibold text-gray-700 mb-2">
                  Dietary Preferences
                </label>
                <select
                  id="diet"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  {diets.map((diet) => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                onClick={handleGenerateRecipe}
                disabled={isLoading}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Whipping up some ideas...
                  </>
                ) : (
                  'Generate Recipe From Pantry'
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
          {isLoading && <Loader />}
          {recipe && !isLoading && <RecipeCard recipe={recipe} onCook={handleCookRecipe} />}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Gemini. For inspiration only, please cook responsibly.</p>
      </footer>
    </div>
  );
};

export default App;
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PantryManager } from './components/PantryManager';
import { EquipmentManager } from './components/EquipmentManager';
import { CondimentsManager } from './components/CondimentsManager';
import { RecipeCard } from './components/RecipeCard';
import { Loader } from './components/Loader';
import { generateRecipe } from './services/recipeService';
import type { Recipe, PantryItem } from './types';
import { translations } from './lib/translations';

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
   const [equipment, setEquipment] = useState<string[]>(() => {
    try {
      const storedEquipment = localStorage.getItem('equipment');
      return storedEquipment ? JSON.parse(storedEquipment) : ['Oven', 'Microwave', 'Stovetop'];
    } catch (error) {
      console.error("Failed to parse equipment from localStorage", error);
      return [];
    }
  });
  const [condiments, setCondiments] = useState<string[]>(() => {
    try {
        const storedCondiments = localStorage.getItem('condiments');
        return storedCondiments ? JSON.parse(storedCondiments) : ['Salt', 'Black Pepper', 'Olive Oil', 'Soy Sauce'];
    } catch (error) {
        console.error("Failed to parse condiments from localStorage", error);
        return [];
    }
  });
  const [mealType, setMealType] = useState<string>('Dinner');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('None');
  const [craving, setCraving] = useState<string>('');
  const [maxTotalTime, setMaxTotalTime] = useState<string>('Any');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh'>(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang === 'en' || storedLang === 'zh') {
      return storedLang;
    }
    // Auto-detect browser language
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('pantryItems', JSON.stringify(pantryItems));
    } catch (error) {
      console.error("Failed to save pantry items to localStorage", error);
    }
  }, [pantryItems]);

  useEffect(() => {
    try {
      localStorage.setItem('equipment', JSON.stringify(equipment));
    } catch (error) {
      console.error("Failed to save equipment to localStorage", error);
    }
  }, [equipment]);

  useEffect(() => {
    try {
        localStorage.setItem('condiments', JSON.stringify(condiments));
    } catch (error) {
        console.error("Failed to save condiments to localStorage", error);
    }
  }, [condiments]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleGenerateRecipe = useCallback(async () => {
    if (pantryItems.length === 0) {
      setError(translations.pantryEmptyError[language]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipe(null);

    const ingredientsList = pantryItems.map(item => {
      let ingredientString = `${item.quantity} of ${item.name}`;
      if (item.expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(item.expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            ingredientString += ` (expired ${-daysLeft} day(s) ago)`;
        } else if (daysLeft <= 7) {
            ingredientString += ` (expires in ${daysLeft} day(s))`;
        }
      }
      return ingredientString;
    });

    try {
      const result = await generateRecipe(ingredientsList, mealType, dietaryRestrictions, craving, maxTotalTime, equipment, condiments, language);
      setRecipe(result);
    } catch (err) {
      console.error(err);
      setError(translations.recipeError[language]);
    } finally {
      setIsLoading(false);
    }
  }, [pantryItems, mealType, dietaryRestrictions, craving, maxTotalTime, equipment, condiments, language]);
  
  const handleCookRecipe = useCallback((usedIngredients: string[]) => {
    setPantryItems(currentPantry => {
      const pantryItemsToRemove = new Set<string>();
      
      usedIngredients.forEach(usedIngredient => {
        const pantryItemMatch = currentPantry.find(pantryItem => 
          usedIngredient.toLowerCase().includes(pantryItem.name.toLowerCase())
        );

        if (pantryItemMatch) {
          pantryItemsToRemove.add(pantryItemMatch.id);
        }
      });

      return currentPantry.filter(item => !pantryItemsToRemove.has(item.id));
    });
    setRecipe(null); 
  }, []);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer', 'Soup', 'Baking/Cake', 'Cocktail', 'Cold Drink'];
  const diets = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Muscle Building', 'Weight Loss', 'Low Glycemic', 'Heart-Healthy'];
  const cookingTimes = ['Any', '< 15 mins', '< 30 mins', '< 1 hour', '> 1 hour'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header language={language} setLanguage={setLanguage} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="space-y-6">
            <PantryManager items={pantryItems} setItems={setPantryItems} language={language} />
            <EquipmentManager equipment={equipment} setEquipment={setEquipment} language={language} />
            <CondimentsManager condiments={condiments} setCondiments={setCondiments} language={language} />
            
            <div>
              <label htmlFor="craving" className="block text-lg font-semibold text-gray-700 mb-2">
                {translations.cravingLabel[language]}
              </label>
              <input
                id="craving"
                type="text"
                value={craving}
                onChange={(e) => setCraving(e.target.value)}
                placeholder={translations.cravingPlaceholder[language]}
                className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="mealType" className="block text-lg font-semibold text-gray-700 mb-2">
                  {translations.mealType[language]}
                </label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>{translations.mealTypes[type as keyof typeof translations.mealTypes][language]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="diet" className="block text-lg font-semibold text-gray-700 mb-2">
                  {translations.dietaryPreferences[language]}
                </label>
                <select
                  id="diet"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  {diets.map((diet) => (
                    <option key={diet} value={diet}>{translations.diets[diet as keyof typeof translations.diets][language]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="maxTime" className="block text-lg font-semibold text-gray-700 mb-2">
                  {translations.maxTimeLabel[language]}
                </label>
                <select
                  id="maxTime"
                  value={maxTotalTime}
                  onChange={(e) => setMaxTotalTime(e.target.value)}
                  className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  {cookingTimes.map((time) => (
                    <option key={time} value={time}>{translations.cookingTimes[time as keyof typeof translations.cookingTimes][language]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                onClick={handleGenerateRecipe}
                disabled={isLoading}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translations.loadingButton[language]}
                  </>
                ) : (
                  translations.generateButton[language]
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
          {isLoading && <Loader language={language} />}
          {recipe && !isLoading && <RecipeCard recipe={recipe} onCook={handleCookRecipe} language={language} />}
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>{translations.footer[language]}</p>
        <p className="mt-2">{translations.contactInfo[language]}</p>
      </footer>
    </div>
  );
};

export default App;
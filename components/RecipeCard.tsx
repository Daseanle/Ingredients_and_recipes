import React from 'react';
import type { Recipe } from '../types';
import { translations } from '../lib/translations';

interface RecipeCardProps {
  recipe: Recipe;
  onCook: (usedIngredients: string[]) => void;
  language: 'en' | 'zh';
}

const TimeInfo: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col items-center bg-green-50 p-3 rounded-lg">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-lg font-bold text-green-800">{value}</span>
    </div>
);

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onCook, language }) => {
  const { title, description, ingredients, instructions, prepTime, cookTime, totalTime } = recipe;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-slide-up">
      <img src={`https://source.unsplash.com/800x400/?${encodeURIComponent(title)}`} alt={title} className="w-full h-56 object-cover"/>
      <div className="p-6 md:p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <TimeInfo label={translations.prepTime[language]} value={prepTime} />
            <TimeInfo label={translations.cookTime[language]} value={cookTime} />
            {totalTime && <TimeInfo label={translations.totalTime[language]} value={totalTime} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2">{translations.ingredients[language]}</h3>
            <ul className="space-y-2 list-disc list-inside text-gray-700">
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-2">{translations.instructions[language]}</h3>
            <ol className="space-y-3 text-gray-700">
              {instructions.map((step, index) => (
                <li key={index} className="flex">
                  <span className="bg-green-600 text-white rounded-full h-6 w-6 text-sm flex items-center justify-center font-bold mr-3 flex-shrink-0">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
            <button
                onClick={() => onCook(ingredients)}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
                {translations.madeThisButton[language]}
            </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { translations } from '../lib/translations';

interface CondimentsManagerProps {
  condiments: string[];
  setCondiments: React.Dispatch<React.SetStateAction<string[]>>;
  language: 'en' | 'zh';
}

const availableCondiments = [
    'Salt',
    'Black Pepper',
    'Olive Oil',
    'Vegetable Oil',
    'Soy Sauce',
    'Ketchup',
    'Mayonnaise',
    'Mustard',
    'Vinegar',
    'Sugar',
    'Honey',
    'Garlic Powder',
    'Onion Powder',
    'Paprika',
    'Chili Powder',
    'Cumin',
    'Oregano',
    'Basil',
    'Rosemary',
    'Thyme',
    'Cinnamon',
    'Nutmeg',
    'Ginger',
    'Turmeric',
    'Sesame Oil',
    'Oyster Sauce',
    'Sriracha',
    'Worcestershire Sauce',
] as const;


export const CondimentsManager: React.FC<CondimentsManagerProps> = ({ condiments, setCondiments, language }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCondimentChange = (condiment: string) => {
    setCondiments(prev => 
      prev.includes(condiment) 
        ? prev.filter(item => item !== condiment)
        : [...prev, condiment]
    );
  };

  const condimentsSummary = translations.condimentsSummary[language].replace('{count}', condiments.length.toString());

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-t-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-expanded={isOpen}
        aria-controls="condiments-content"
      >
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">{translations.myCondiments[language]}</h2>
            <span className="text-gray-500 font-normal">{condimentsSummary}</span>
        </div>
        <ChevronDownIcon className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="condiments-content"
        className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableCondiments.map(condiment => (
                        <label key={condiment} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                            <input 
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                checked={condiments.includes(condiment)}
                                onChange={() => handleCondimentChange(condiment)}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {translations.condiments[condiment as keyof typeof translations.condiments][language]}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};
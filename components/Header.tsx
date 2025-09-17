
import React from 'react';
import { ChefHatIcon } from './icons/ChefHatIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center space-x-3">
        <ChefHatIcon className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Gemini Recipe Generator
        </h1>
      </div>
    </header>
  );
};

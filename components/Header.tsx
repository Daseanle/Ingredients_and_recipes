import React from 'react';
import { ChefHatIcon } from './icons/ChefHatIcon';
import { translations } from '../lib/translations';

interface HeaderProps {
    language: 'en' | 'zh';
    setLanguage: (language: 'en' | 'zh') => void;
}

export const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <ChefHatIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
                {translations.appTitle[language]}
            </h1>
        </div>
        <div>
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
                className="p-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                aria-label="Select language"
            >
                <option value="en">English</option>
                <option value="zh">中文</option>
            </select>
        </div>
      </div>
    </header>
  );
};
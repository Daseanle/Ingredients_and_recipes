import React from 'react';
import { ChefHatIcon } from './icons/ChefHatIcon';
import { translations } from '../lib/translations';

interface LoaderProps {
  language: 'en' | 'zh';
}

export const Loader: React.FC<LoaderProps> = ({ language }) => {
  const messages = translations.loadingMessages[language];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);
    return () => clearInterval(intervalId);
  }, [messages]);

  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-center items-center mb-4">
        <ChefHatIcon className="h-12 w-12 text-green-600 animate-bounce" />
      </div>
      <p className="text-xl font-semibold text-gray-700 transition-opacity duration-500">{message}</p>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import type { PantryItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { translations } from '../lib/translations';

interface PantryManagerProps {
  items: PantryItem[];
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  language: 'en' | 'zh';
}

export const PantryManager: React.FC<PantryManagerProps> = ({ items, setItems, language }) => {
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemExpiry, setItemExpiry] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && itemQuantity.trim()) {
      const newItem: PantryItem = {
        id: new Date().toISOString(),
        name: itemName.trim(),
        quantity: itemQuantity.trim(),
        ...(itemExpiry && { expiryDate: itemExpiry }),
      };
      setItems([...items, newItem]);
      setItemName('');
      setItemQuantity('');
      setItemExpiry('');
    }
  };

  const handleRemoveItem = (idToRemove: string) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  const getExpiryInfo = (expiryDate?: string) => {
    if (!expiryDate) return { text: null, style: 'bg-gray-100 text-gray-500' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setMinutes(expiry.getMinutes() + expiry.getTimezoneOffset());
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: translations.expired[language], style: 'bg-red-100 text-red-700' };
    }
    if (diffDays === 0) {
        return { text: translations.expiresToday[language], style: 'bg-yellow-100 text-yellow-700' };
    }
    if (diffDays <= 7) {
        const text = translations.expiresIn[language].replace('{days}', diffDays.toString());
        return { text, style: 'bg-yellow-100 text-yellow-700' };
    }
    return { text: null, style: '' };
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aDate = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const bDate = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      if (aDate === Infinity && bDate === Infinity) return 0;
      return aDate - bDate;
    });
  }, [items]);

  const pantrySummary = translations.pantrySummary[language].replace('{count}', items.length.toString());

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-t-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-expanded={isOpen}
        aria-controls="pantry-content"
      >
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">{translations.myPantry[language]}</h2>
            <span className="text-gray-500 font-normal">{pantrySummary}</span>
        </div>
        <ChevronDownIcon className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="pantry-content"
        className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="p-3 space-y-3">
                <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto,auto] gap-2">
                    <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={translations.ingredientNamePlaceholder[language]}
                    className="p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    aria-label="New ingredient name"
                    required
                    />
                    <input
                    type="text"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    placeholder={translations.quantityPlaceholder[language]}
                    className="p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    aria-label="New ingredient quantity"
                    required
                    />
                    <input
                    type="date"
                    value={itemExpiry}
                    onChange={(e) => setItemExpiry(e.target.value)}
                    className="p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-500"
                    aria-label={translations.expiryDateLabel[language]}
                    />
                    <button type="submit" className="bg-green-200 text-green-800 font-bold p-3 rounded-lg hover:bg-green-300 transition flex items-center justify-center gap-2" aria-label="Add ingredient">
                    <PlusIcon className="h-5 w-5" />
                    <span className="hidden md:inline">{translations.addButton[language]}</span>
                    </button>
                </form>
                <div className="space-y-2">
                    {sortedItems.length > 0 ? (
                    sortedItems.map((item) => {
                        const expiry = getExpiryInfo(item.expiryDate);
                        return (
                        <div
                            key={item.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-800">{item.name}</span>
                            <span className="text-gray-500 text-sm">({item.quantity})</span>
                            </div>
                            <div className="flex items-center gap-3">
                            {expiry.text && (
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${expiry.style}`}>
                                    {expiry.text}
                                </span>
                            )}
                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Remove ${item.name}`}
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                            </div>
                        </div>
                        );
                    })
                    ) : (
                    <p className="text-center text-gray-500 py-4">{translations.pantryEmptyMessage[language]}</p>
                    )}
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};
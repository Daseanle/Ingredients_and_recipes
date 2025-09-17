import React, { useState } from 'react';
import type { PantryItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';

interface PantryManagerProps {
  items: PantryItem[];
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
}

export const PantryManager: React.FC<PantryManagerProps> = ({ items, setItems }) => {
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && itemQuantity.trim()) {
      const newItem: PantryItem = {
        id: new Date().toISOString(),
        name: itemName.trim(),
        quantity: itemQuantity.trim(),
      };
      setItems([...items, newItem]);
      setItemName('');
      setItemQuantity('');
    }
  };

  const handleRemoveItem = (idToRemove: string) => {
    setItems(items.filter((item) => item.id !== idToRemove));
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-700 mb-2">My Pantry</label>
      <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-2 mb-3">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Ingredient name (e.g., flour)"
          className="flex-grow p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          aria-label="New ingredient name"
        />
        <input
          type="text"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
          placeholder="Quantity (e.g., 2 cups)"
          className="flex-grow md:flex-grow-0 md:w-48 p-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          aria-label="New ingredient quantity"
        />
        <button type="submit" className="bg-green-200 text-green-800 font-bold p-3 rounded-lg hover:bg-green-300 transition flex items-center justify-center gap-2" aria-label="Add ingredient">
          <PlusIcon className="h-5 w-5" />
          <span>Add</span>
        </button>
      </form>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div>
                <span className="font-semibold text-gray-800">{item.name}</span>
                <span className="text-gray-500 ml-2 text-sm">({item.quantity})</span>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700"
                aria-label={`Remove ${item.name}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">Your pantry is empty. Add some ingredients to get started!</p>
        )}
      </div>
    </div>
  );
};

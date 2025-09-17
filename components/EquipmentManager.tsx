import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { translations } from '../lib/translations';

interface EquipmentManagerProps {
  equipment: string[];
  setEquipment: React.Dispatch<React.SetStateAction<string[]>>;
  language: 'en' | 'zh';
}

const availableEquipment = [
    'Stovetop',
    'Oven',
    'Microwave',
    'Air Fryer',
    'Blender',
    'Food Processor',
    'Stand Mixer',
    'Hand Mixer',
    'Slow Cooker',
    'Pressure Cooker',
    'Grill',
    'Toaster',
] as const;


export const EquipmentManager: React.FC<EquipmentManagerProps> = ({ equipment, setEquipment, language }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleEquipmentChange = (tool: string) => {
    setEquipment(prev => 
      prev.includes(tool) 
        ? prev.filter(item => item !== tool)
        : [...prev, tool]
    );
  };

  const equipmentSummary = translations.equipmentSummary[language].replace('{count}', equipment.length.toString());

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-t-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-expanded={isOpen}
        aria-controls="equipment-content"
      >
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">{translations.myEquipment[language]}</h2>
            <span className="text-gray-500 font-normal">{equipmentSummary}</span>
        </div>
        <ChevronDownIcon className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="equipment-content"
        className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableEquipment.map(tool => (
                        <label key={tool} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                            <input 
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                checked={equipment.includes(tool)}
                                onChange={() => handleEquipmentChange(tool)}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {translations.equipment[tool as keyof typeof translations.equipment][language]}
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

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  totalTime?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  expiryDate?: string;
}
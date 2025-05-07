
export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (value: string[]) => void;
  onAddCategory?: (category: Omit<Category, "id" | "created_at" | "updated_at">) => void;
}

export interface CategoryManagementProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export type MealType = string;

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: "Lunch" | "Dinner" | "Breakfast";
  isVegetarian: boolean;
  imageUrl?: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  duration: string;
  mealsPerWeek: number;
  price: number;
  description: string;
  popular?: boolean;
  mealType?: "breakfast" | "lunch" | "dinner";
  isVegetarian?: boolean;
};

export type Review = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
};

export type Kitchen = {
  id: string;
  databaseId?: string;
  slug?: string;
  name: string;
  tagline: string;
  description: string;
  sector: string;
  location: string;
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
  mealTypes: MealType[];
  isVegetarian: boolean;
  image: string;
  gallery: string[];
  badge?: string;
  menu: MenuItem[];
  plans: SubscriptionPlan[];
  reviews: Review[];
  mealCategories?: ("Breakfast" | "Lunch" | "Dinner")[];
  foodType?: "vegetarian" | "non_vegetarian" | "both";
  contactPhone?: string;
  contactEmail?: string;
  isDemo?: boolean;
};

export type Customer = {
  firstName: string;
  neighbourhood: string;
  demoLabel: string;
};

export type Subscription = {
  id: string;
  kitchenName: string;
  planName: string;
  status: "Active" | "Pending";
  mealsRemaining: number;
  expiresInDays: number;
};

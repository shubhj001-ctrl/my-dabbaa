import type { Customer, Kitchen, Subscription } from "@/types/marketplace";

const foodPhotos = {
  thali:
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
  roti:
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=85",
  curry:
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=85",
  bowl:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85",
  indian:
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=85",
  dosa:
    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=85",
  home:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85",
  paneer:
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=85",
  dal:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85",
  meal:
    "https://images.unsplash.com/photo-1515003197210-e0cd7184f8b5?auto=format&fit=crop&w=1200&q=85",
};

function kitchenMenu(): Kitchen["menu"] {
  return [
    {
      id: "dal-tadka",
      name: "Dal tadka",
      description: "Slow-cooked yellow lentils, finished with a homestyle tadka.",
      category: "Lunch",
      isVegetarian: true,
    },
    {
      id: "seasonal-sabzi",
      name: "Seasonal sabzi",
      description: "Fresh market vegetables with a gentle blend of spices.",
      category: "Lunch",
      isVegetarian: true,
    },
    {
      id: "phulka",
      name: "Soft phulkas",
      description: "Freshly rolled whole-wheat rotis, made each morning.",
      category: "Lunch",
      isVegetarian: true,
    },
    {
      id: "jeera-rice",
      name: "Jeera rice",
      description: "Fragrant basmati rice with toasted cumin.",
      category: "Dinner",
      isVegetarian: true,
    },
  ];
}

function kitchenPlans(): Kitchen["plans"] {
  return [
    {
      id: "weekday",
      name: "Weekday lunch",
      duration: "5 days",
      mealsPerWeek: 5,
      price: 799,
      description: "A comforting lunch for the working week.",
    },
    {
      id: "everyday",
      name: "Everyday meals",
      duration: "20 days",
      mealsPerWeek: 5,
      price: 2799,
      description: "A month of familiar, home-style lunches.",
      popular: true,
    },
    {
      id: "lunch-dinner",
      name: "Lunch + dinner",
      duration: "20 days",
      mealsPerWeek: 10,
      price: 4899,
      description: "Two freshly prepared meals, Monday to Friday.",
    },
  ];
}

function kitchenReviews(): Kitchen["reviews"] {
  return [
    {
      id: "review-a",
      name: "Aarav",
      initials: "A",
      rating: 5,
      date: "2 weeks ago",
      text: "The food feels thoughtful and fresh. I especially love the rotating seasonal sabzi.",
    },
    {
      id: "review-b",
      name: "Meera",
      initials: "M",
      rating: 5,
      date: "1 month ago",
      text: "A lovely lunch routine. The portions are generous and the food is never too heavy.",
    },
  ];
}

const shared = {
  serviceAreas: ["Sector 34", "Sector 35", "Sector 43"],
  menu: kitchenMenu(),
  plans: kitchenPlans(),
  reviews: kitchenReviews(),
};

export const kitchens: Kitchen[] = [
  {
    ...shared,
    id: "ghar-ka-swaad",
    name: "Ghar Ka Swaad",
    tagline: "A little taste of home, every day.",
    description:
      "A family kitchen serving lovingly prepared North Indian meals with fresh produce, gentle spices and recipes gathered around the family table.",
    sector: "Sector 34",
    location: "Sector 34, Chandigarh",
    rating: 4.9,
    reviewCount: 128,
    startingPrice: 119,
    mealTypes: ["North Indian", "Punjabi"],
    isVegetarian: true,
    image: foodPhotos.thali,
    gallery: [foodPhotos.thali, foodPhotos.roti, foodPhotos.curry],
    badge: "Neighbourhood favourite",
  },
  {
    ...shared,
    id: "punjab-da-tadka",
    name: "Punjab Da Tadka",
    tagline: "The warmth of a Punjabi kitchen.",
    description:
      "Robust Punjabi classics, made in small batches with house-ground masalas and seasonal ingredients.",
    sector: "Sector 22",
    location: "Sector 22, Chandigarh",
    serviceAreas: ["Sector 17", "Sector 22", "Sector 23"],
    rating: 4.8,
    reviewCount: 96,
    startingPrice: 149,
    mealTypes: ["Punjabi", "North Indian"],
    isVegetarian: true,
    image: foodPhotos.paneer,
    gallery: [foodPhotos.paneer, foodPhotos.indian, foodPhotos.thali],
    badge: "Freshly made",
  },
  {
    ...shared,
    id: "maa-ke-haath",
    name: "Maa Ke Haath",
    tagline: "Simple food, made with care.",
    description:
      "Wholesome, balanced everyday meals with soft rotis, comforting dals and a different sabzi for every day.",
    sector: "Sector 15",
    location: "Sector 15, Chandigarh",
    serviceAreas: ["Sector 10", "Sector 11", "Sector 15"],
    rating: 4.9,
    reviewCount: 84,
    startingPrice: 129,
    mealTypes: ["North Indian"],
    isVegetarian: true,
    image: foodPhotos.roti,
    gallery: [foodPhotos.roti, foodPhotos.dal, foodPhotos.home],
  },
  {
    ...shared,
    id: "sattva-kitchen",
    name: "Sattva Kitchen",
    tagline: "Bright, balanced and beautifully seasonal.",
    description:
      "A mostly plant-forward menu of colourful bowls, light curries and nourishing food for busy days.",
    sector: "Sector 8",
    location: "Sector 8, Chandigarh",
    serviceAreas: ["Sector 4", "Sector 7", "Sector 8"],
    rating: 4.7,
    reviewCount: 71,
    startingPrice: 159,
    mealTypes: ["North Indian", "Gujarati"],
    isVegetarian: true,
    image: foodPhotos.bowl,
    gallery: [foodPhotos.bowl, foodPhotos.home, foodPhotos.thali],
  },
  {
    ...shared,
    id: "the-dabba-story",
    name: "The Dabba Story",
    tagline: "A different little story at lunchtime.",
    description:
      "A cheerful daily dabba with much-loved Indian staples, thoughtful portions and a homemade sweet on Fridays.",
    sector: "Sector 17",
    location: "Sector 17, Chandigarh",
    serviceAreas: ["Sector 16", "Sector 17", "Sector 18"],
    rating: 4.6,
    reviewCount: 63,
    startingPrice: 139,
    mealTypes: ["North Indian", "Punjabi"],
    isVegetarian: false,
    image: foodPhotos.indian,
    gallery: [foodPhotos.indian, foodPhotos.curry, foodPhotos.meal],
  },
  {
    ...shared,
    id: "gujarati-ghar",
    name: "Gujarati Ghar",
    tagline: "A sweet, savoury taste of Gujarat.",
    description:
      "Traditional Gujarati thalis with seasonal shaak, dal, rotli and a little something sweet.",
    sector: "Sector 44",
    location: "Sector 44, Chandigarh",
    serviceAreas: ["Sector 43", "Sector 44", "Sector 45"],
    rating: 4.8,
    reviewCount: 58,
    startingPrice: 149,
    mealTypes: ["Gujarati"],
    isVegetarian: true,
    image: foodPhotos.meal,
    gallery: [foodPhotos.meal, foodPhotos.thali, foodPhotos.home],
  },
  {
    ...shared,
    id: "idli-and-more",
    name: "Idli & More",
    tagline: "South Indian comfort, made fresh.",
    description:
      "Fresh idlis, crisp dosas and comforting rice meals prepared with traditional batters and fresh chutneys.",
    sector: "Sector 35",
    location: "Sector 35, Chandigarh",
    serviceAreas: ["Sector 34", "Sector 35", "Sector 36"],
    rating: 4.7,
    reviewCount: 49,
    startingPrice: 109,
    mealTypes: ["South Indian"],
    isVegetarian: true,
    image: foodPhotos.dosa,
    gallery: [foodPhotos.dosa, foodPhotos.bowl, foodPhotos.home],
  },
  {
    ...shared,
    id: "annapurna-home-kitchen",
    name: "Annapurna Home Kitchen",
    tagline: "Everyday food, made with a full heart.",
    description:
      "A warm neighbourhood kitchen serving a generous mix of North Indian comfort food and simple seasonal sides.",
    sector: "Sector 46",
    location: "Sector 46, Chandigarh",
    serviceAreas: ["Sector 45", "Sector 46", "Sector 47"],
    rating: 4.5,
    reviewCount: 42,
    startingPrice: 119,
    mealTypes: ["North Indian", "Punjabi"],
    isVegetarian: true,
    image: foodPhotos.dal,
    gallery: [foodPhotos.dal, foodPhotos.roti, foodPhotos.thali],
  },
];

export const featuredKitchens = kitchens.slice(0, 4);

export const demoCustomer: Customer = {
  firstName: "Aarav",
  neighbourhood: "Sector 34, Chandigarh",
  demoLabel: "Demo dashboard",
};

export const demoSubscriptions: Subscription[] = [
  {
    id: "subscription-demo",
    kitchenName: "Ghar Ka Swaad",
    planName: "Weekday lunch",
    status: "Active",
    mealsRemaining: 8,
    expiresInDays: 12,
  },
];

export const demoActivities = [
  { id: "activity-a", title: "New customer joined", detail: "Today · Demo activity", initials: "RK" },
  { id: "activity-b", title: "Lunch plan renewed", detail: "Yesterday · Demo activity", initials: "AS" },
  { id: "activity-c", title: "New kitchen review", detail: "Monday · Demo activity", initials: "PM" },
];

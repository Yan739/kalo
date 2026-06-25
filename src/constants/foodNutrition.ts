export interface FoodNutrition {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
  defaultGrams: number;
}

// Valeurs approximatives par 100 g pour les 101 classes Food-101 (modele
// nateraw/food). Estimations indicatives, a affiner via la quantite.
const TABLE: Record<string, FoodNutrition> = {
  apple_pie: { kcal: 237, protein: 2, carb: 34, fat: 11, defaultGrams: 125 },
  baby_back_ribs: { kcal: 292, protein: 24, carb: 2, fat: 21, defaultGrams: 200 },
  baklava: { kcal: 428, protein: 7, carb: 45, fat: 26, defaultGrams: 80 },
  beef_carpaccio: { kcal: 190, protein: 22, carb: 1, fat: 11, defaultGrams: 120 },
  beef_tartare: { kcal: 196, protein: 20, carb: 2, fat: 12, defaultGrams: 150 },
  beet_salad: { kcal: 90, protein: 3, carb: 12, fat: 4, defaultGrams: 200 },
  beignets: { kcal: 380, protein: 6, carb: 45, fat: 19, defaultGrams: 90 },
  bibimbap: { kcal: 130, protein: 6, carb: 18, fat: 4, defaultGrams: 300 },
  bread_pudding: { kcal: 230, protein: 5, carb: 33, fat: 9, defaultGrams: 150 },
  breakfast_burrito: { kcal: 210, protein: 9, carb: 20, fat: 11, defaultGrams: 220 },
  bruschetta: { kcal: 195, protein: 5, carb: 25, fat: 8, defaultGrams: 120 },
  caesar_salad: { kcal: 180, protein: 6, carb: 7, fat: 14, defaultGrams: 200 },
  cannoli: { kcal: 350, protein: 6, carb: 38, fat: 19, defaultGrams: 90 },
  caprese_salad: { kcal: 150, protein: 9, carb: 4, fat: 11, defaultGrams: 180 },
  carrot_cake: { kcal: 360, protein: 4, carb: 47, fat: 18, defaultGrams: 110 },
  ceviche: { kcal: 110, protein: 18, carb: 5, fat: 2, defaultGrams: 180 },
  cheese_plate: { kcal: 380, protein: 23, carb: 3, fat: 31, defaultGrams: 120 },
  cheesecake: { kcal: 321, protein: 6, carb: 26, fat: 22, defaultGrams: 120 },
  chicken_curry: { kcal: 150, protein: 12, carb: 7, fat: 8, defaultGrams: 300 },
  chicken_quesadilla: { kcal: 280, protein: 15, carb: 24, fat: 14, defaultGrams: 200 },
  chicken_wings: { kcal: 203, protein: 30, carb: 0, fat: 8, defaultGrams: 150 },
  chocolate_cake: { kcal: 371, protein: 5, carb: 50, fat: 17, defaultGrams: 110 },
  chocolate_mousse: { kcal: 225, protein: 4, carb: 23, fat: 14, defaultGrams: 120 },
  churros: { kcal: 400, protein: 5, carb: 45, fat: 22, defaultGrams: 90 },
  clam_chowder: { kcal: 95, protein: 5, carb: 9, fat: 4, defaultGrams: 300 },
  club_sandwich: { kcal: 250, protein: 14, carb: 22, fat: 12, defaultGrams: 230 },
  crab_cakes: { kcal: 215, protein: 14, carb: 12, fat: 12, defaultGrams: 120 },
  creme_brulee: { kcal: 295, protein: 4, carb: 25, fat: 20, defaultGrams: 130 },
  croque_madame: { kcal: 280, protein: 16, carb: 20, fat: 16, defaultGrams: 200 },
  cup_cakes: { kcal: 305, protein: 4, carb: 47, fat: 12, defaultGrams: 70 },
  deviled_eggs: { kcal: 195, protein: 10, carb: 1, fat: 16, defaultGrams: 100 },
  donuts: { kcal: 452, protein: 5, carb: 51, fat: 25, defaultGrams: 60 },
  dumplings: { kcal: 180, protein: 7, carb: 24, fat: 6, defaultGrams: 150 },
  edamame: { kcal: 121, protein: 12, carb: 9, fat: 5, defaultGrams: 100 },
  eggs_benedict: { kcal: 230, protein: 12, carb: 12, fat: 15, defaultGrams: 200 },
  escargots: { kcal: 185, protein: 16, carb: 2, fat: 12, defaultGrams: 100 },
  falafel: { kcal: 333, protein: 13, carb: 32, fat: 18, defaultGrams: 150 },
  filet_mignon: { kcal: 267, protein: 27, carb: 0, fat: 18, defaultGrams: 200 },
  fish_and_chips: { kcal: 230, protein: 12, carb: 22, fat: 12, defaultGrams: 300 },
  foie_gras: { kcal: 462, protein: 11, carb: 5, fat: 44, defaultGrams: 70 },
  french_fries: { kcal: 312, protein: 3, carb: 41, fat: 15, defaultGrams: 150 },
  french_onion_soup: { kcal: 70, protein: 4, carb: 7, fat: 3, defaultGrams: 300 },
  french_toast: { kcal: 229, protein: 8, carb: 25, fat: 11, defaultGrams: 150 },
  fried_calamari: { kcal: 175, protein: 15, carb: 8, fat: 9, defaultGrams: 150 },
  fried_rice: { kcal: 168, protein: 5, carb: 26, fat: 5, defaultGrams: 250 },
  frozen_yogurt: { kcal: 127, protein: 3, carb: 22, fat: 4, defaultGrams: 150 },
  garlic_bread: { kcal: 330, protein: 8, carb: 40, fat: 15, defaultGrams: 80 },
  gnocchi: { kcal: 170, protein: 4, carb: 30, fat: 4, defaultGrams: 250 },
  greek_salad: { kcal: 110, protein: 3, carb: 6, fat: 8, defaultGrams: 200 },
  grilled_cheese_sandwich: { kcal: 330, protein: 13, carb: 28, fat: 18, defaultGrams: 150 },
  grilled_salmon: { kcal: 208, protein: 22, carb: 0, fat: 13, defaultGrams: 180 },
  guacamole: { kcal: 155, protein: 2, carb: 9, fat: 14, defaultGrams: 100 },
  gyoza: { kcal: 190, protein: 8, carb: 20, fat: 8, defaultGrams: 150 },
  hamburger: { kcal: 254, protein: 14, carb: 24, fat: 12, defaultGrams: 250 },
  hot_and_sour_soup: { kcal: 50, protein: 4, carb: 5, fat: 2, defaultGrams: 300 },
  hot_dog: { kcal: 290, protein: 11, carb: 23, fat: 17, defaultGrams: 120 },
  huevos_rancheros: { kcal: 160, protein: 9, carb: 13, fat: 8, defaultGrams: 250 },
  hummus: { kcal: 166, protein: 8, carb: 14, fat: 10, defaultGrams: 100 },
  ice_cream: { kcal: 207, protein: 4, carb: 24, fat: 11, defaultGrams: 100 },
  lasagna: { kcal: 135, protein: 8, carb: 12, fat: 6, defaultGrams: 300 },
  lobster_bisque: { kcal: 105, protein: 6, carb: 8, fat: 5, defaultGrams: 300 },
  lobster_roll_sandwich: { kcal: 215, protein: 13, carb: 18, fat: 10, defaultGrams: 200 },
  macaroni_and_cheese: { kcal: 164, protein: 7, carb: 20, fat: 6, defaultGrams: 250 },
  macarons: { kcal: 405, protein: 7, carb: 60, fat: 15, defaultGrams: 50 },
  miso_soup: { kcal: 40, protein: 3, carb: 4, fat: 1, defaultGrams: 250 },
  mussels: { kcal: 86, protein: 12, carb: 4, fat: 2, defaultGrams: 200 },
  nachos: { kcal: 306, protein: 8, carb: 32, fat: 16, defaultGrams: 200 },
  omelette: { kcal: 154, protein: 11, carb: 1, fat: 12, defaultGrams: 150 },
  onion_rings: { kcal: 411, protein: 6, carb: 38, fat: 26, defaultGrams: 120 },
  oysters: { kcal: 81, protein: 9, carb: 5, fat: 3, defaultGrams: 150 },
  pad_thai: { kcal: 153, protein: 8, carb: 20, fat: 5, defaultGrams: 300 },
  paella: { kcal: 160, protein: 9, carb: 20, fat: 5, defaultGrams: 300 },
  pancakes: { kcal: 227, protein: 6, carb: 28, fat: 10, defaultGrams: 150 },
  panna_cotta: { kcal: 215, protein: 3, carb: 20, fat: 14, defaultGrams: 120 },
  peking_duck: { kcal: 337, protein: 19, carb: 5, fat: 27, defaultGrams: 180 },
  pho: { kcal: 75, protein: 6, carb: 9, fat: 2, defaultGrams: 400 },
  pizza: { kcal: 266, protein: 11, carb: 33, fat: 10, defaultGrams: 250 },
  pork_chop: { kcal: 231, protein: 26, carb: 0, fat: 14, defaultGrams: 200 },
  poutine: { kcal: 240, protein: 7, carb: 25, fat: 13, defaultGrams: 300 },
  prime_rib: { kcal: 295, protein: 24, carb: 0, fat: 22, defaultGrams: 220 },
  pulled_pork_sandwich: { kcal: 230, protein: 14, carb: 22, fat: 9, defaultGrams: 220 },
  ramen: { kcal: 120, protein: 6, carb: 16, fat: 4, defaultGrams: 400 },
  ravioli: { kcal: 170, protein: 7, carb: 24, fat: 5, defaultGrams: 250 },
  red_velvet_cake: { kcal: 370, protein: 4, carb: 50, fat: 17, defaultGrams: 110 },
  risotto: { kcal: 166, protein: 4, carb: 20, fat: 7, defaultGrams: 250 },
  samosa: { kcal: 308, protein: 5, carb: 32, fat: 18, defaultGrams: 100 },
  sashimi: { kcal: 130, protein: 22, carb: 0, fat: 4, defaultGrams: 120 },
  scallops: { kcal: 111, protein: 20, carb: 5, fat: 1, defaultGrams: 150 },
  seaweed_salad: { kcal: 70, protein: 2, carb: 9, fat: 3, defaultGrams: 150 },
  shrimp_and_grits: { kcal: 175, protein: 10, carb: 16, fat: 8, defaultGrams: 250 },
  spaghetti_bolognese: { kcal: 150, protein: 8, carb: 18, fat: 5, defaultGrams: 350 },
  spaghetti_carbonara: { kcal: 200, protein: 8, carb: 22, fat: 9, defaultGrams: 350 },
  spring_rolls: { kcal: 150, protein: 5, carb: 20, fat: 6, defaultGrams: 120 },
  steak: { kcal: 271, protein: 25, carb: 0, fat: 19, defaultGrams: 220 },
  strawberry_shortcake: { kcal: 290, protein: 4, carb: 42, fat: 12, defaultGrams: 120 },
  sushi: { kcal: 145, protein: 6, carb: 28, fat: 1, defaultGrams: 200 },
  tacos: { kcal: 226, protein: 9, carb: 20, fat: 12, defaultGrams: 150 },
  takoyaki: { kcal: 180, protein: 8, carb: 22, fat: 7, defaultGrams: 150 },
  tiramisu: { kcal: 283, protein: 5, carb: 30, fat: 16, defaultGrams: 120 },
  tuna_tartare: { kcal: 150, protein: 22, carb: 1, fat: 6, defaultGrams: 150 },
  waffles: { kcal: 291, protein: 8, carb: 33, fat: 14, defaultGrams: 120 },
};

const FALLBACK: FoodNutrition = {
  kcal: 150,
  protein: 7,
  carb: 18,
  fat: 6,
  defaultGrams: 250,
};

export function nutritionForLabel(label: string): {
  nutrition: FoodNutrition;
  known: boolean;
} {
  const key = label.trim().toLowerCase().replace(/\s+/g, '_');
  const found = TABLE[key];
  return found
    ? { nutrition: found, known: true }
    : { nutrition: FALLBACK, known: false };
}

export function humanizeLabel(label: string): string {
  const cleaned = label.replace(/_/g, ' ').trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

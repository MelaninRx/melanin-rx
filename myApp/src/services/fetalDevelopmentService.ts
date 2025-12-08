// Shared fetal development data used by StatusCard and FetalDevelopment components
// This ensures consistency across the app

export const fetalDevelopmentData: { [week: number]: { size: string; description: string; length?: string; weight?: string } } = {
  4: { size: 'poppy seed', description: 'Neural tube begins forming', length: 'tiny', weight: 'less than 0.1 oz' },
  5: { size: 'sesame seed', description: 'Heart begins to beat', length: 'about 0.1 inches', weight: 'less than 0.1 oz' },
  6: { size: 'lentil', description: 'Arms and legs begin forming', length: 'about 0.25 inches', weight: 'less than 0.1 oz' },
  7: { size: 'blueberry', description: 'Brain and face developing', length: 'about 0.5 inches', weight: 'less than 0.1 oz' },
  8: { size: 'kidney bean', description: 'Fingers and toes forming', length: 'about 0.6 inches', weight: 'less than 0.1 oz' },
  9: { size: 'grape', description: 'Basic body structure complete', length: 'about 1 inch', weight: 'less than 0.1 oz' },
  10: { size: 'kumquat', description: 'Vital organs functioning', length: 'about 1 inch', weight: 'about 0.1 oz' },
  11: { size: 'fig', description: 'Baby moving around', length: 'about 1.5 inches', weight: 'about 0.25 oz' },
  12: { size: 'lime', description: 'Reflexes developing', length: 'about 2 inches', weight: 'about 0.5 oz' },
  13: { size: 'peapod', description: 'Unique fingerprints forming', length: 'about 3 inches', weight: 'about 1 oz' },
  14: { size: 'lemon', description: 'Can make facial expressions', length: 'about 3.5 inches', weight: 'about 1.5 oz' },
  15: { size: 'apple', description: 'Can sense light', length: 'about 4 inches', weight: 'about 2.5 oz' },
  16: { size: 'avocado', description: 'Hearing developing', length: 'about 4.5 inches', weight: 'about 3.5 oz' },
  17: { size: 'turnip', description: 'Skeleton hardening', length: 'about 5 inches', weight: 'about 5 oz' },
  18: { size: 'bell pepper', description: 'Yawning and hiccupping', length: 'about 5.5 inches', weight: 'about 7 oz' },
  19: { size: 'tomato', description: 'Vernix coating skin', length: 'about 6 inches', weight: 'about 8 oz' },
  20: { size: 'banana', description: 'Halfway point!', length: 'about 6.5 inches', weight: 'about 10 oz' },
  21: { size: 'carrot', description: 'Taste buds developing', length: 'about 10.5 inches', weight: 'about 13 oz' },
  22: { size: 'spaghetti squash', description: 'Hair becoming visible', length: 'about 11 inches', weight: 'about 15 oz' },
  23: { size: 'large mango', description: 'Rapid brain development', length: 'about 11.5 inches', weight: 'about 1 lb' },
  24: { size: 'ear of corn', description: 'Lungs developing', length: 'about 12 inches', weight: 'about 1.3 lbs' },
  25: { size: 'rutabaga', description: 'Responds to your voice', length: 'about 13.5 inches', weight: 'about 1.5 lbs' },
  26: { size: 'head of lettuce', description: 'Eyes opening', length: 'about 14 inches', weight: 'about 1.7 lbs' },
  27: { size: 'head of cauliflower', description: 'Sleeping and waking cycles', length: 'about 14.5 inches', weight: 'about 2 lbs' },
  28: { size: 'eggplant', description: 'Third trimester begins', length: 'about 15 inches', weight: 'about 2.2 lbs' },
  29: { size: 'butternut squash', description: 'Kicking and stretching', length: 'about 15 inches', weight: 'about 2.5 lbs' },
  30: { size: 'large cabbage', description: 'Eyesight improving', length: 'about 16 inches', weight: 'about 3 lbs' },
  31: { size: 'coconut', description: 'All five senses working', length: 'about 16 inches', weight: 'about 3.5 lbs' },
  32: { size: 'jicama', description: 'Practice breathing', length: 'about 17 inches', weight: 'about 4 lbs' },
  33: { size: 'pineapple', description: 'Immune system developing', length: 'about 17 inches', weight: 'about 4 lbs' },
  34: { size: 'cantaloupe', description: 'Skin smoothing out', length: 'about 18 inches', weight: 'about 5 lbs' },
  35: { size: 'honeydew melon', description: 'Rapid weight gain', length: 'about 18 inches', weight: 'about 5 lbs' },
  36: { size: 'head of romaine lettuce', description: 'Getting ready for birth', length: 'about 19 inches', weight: 'about 6 lbs' },
  37: { size: 'bunch of Swiss chard', description: 'Full-term!', length: 'about 19 inches', weight: 'about 6 lbs' },
  38: { size: 'leek', description: 'Fully developed', length: 'about 20 inches', weight: 'about 7 lbs' },
  39: { size: 'mini watermelon', description: 'Ready to meet you!', length: 'about 20 inches', weight: 'about 7 lbs' },
  40: { size: 'small pumpkin', description: 'Any day now!', length: 'about 20 inches', weight: 'about 7.5 lbs' },
};

/**
 * Gets the fetal development data for a specific week
 * Clamps the week to valid range (4-40) and finds the closest available week
 */
export function getFetalDevelopmentData(week: number): { size: string; description: string; length?: string; weight?: string } {
  const clampedWeek = Math.max(4, Math.min(40, week));
  let dataWeek = clampedWeek;
  while (!fetalDevelopmentData[dataWeek] && dataWeek >= 4) {
    dataWeek--;
  }
  return fetalDevelopmentData[dataWeek] || fetalDevelopmentData[15];
}

/**
 * Gets the size comparison string for a given week
 * Returns the size (e.g., "large mango", "apple") for use in StatusCard
 */
export function getBabySize(week: number): string {
  const data = getFetalDevelopmentData(week);
  return data.size;
}


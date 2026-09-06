import art from '@/assets/categoryImages/art.png';
import business from '@/assets/categoryImages/business.png';
import education from '@/assets/categoryImages/education.png';
import fitness from '@/assets/categoryImages/fitness.png';
import food from '@/assets/categoryImages/food.png';
import gaming from '@/assets/categoryImages/gaming.png';
import music from '@/assets/categoryImages/music.png';
import outdoors from '@/assets/categoryImages/outdoors.png';
import social from '@/assets/categoryImages/social.png';
import sports from '@/assets/categoryImages/sports.png';
import technology from '@/assets/categoryImages/technology.png';

const images: Record<string, string> = {
  art,
  business,
  education,
  fitness,
  food,
  gaming,
  music,
  outdoors,
  social,
  sports,
  technology,
};

const keywordMap: Record<string, string> = {
  // fitness
  gym: 'fitness', workout: 'fitness', run: 'fitness', yoga: 'fitness', health: 'fitness', exercise: 'fitness',
  // sports
  football: 'sports', cricket: 'sports', basketball: 'sports', tennis: 'sports', badminton: 'sports', soccer: 'sports',
  // outdoors
  hike: 'outdoors', hiking: 'outdoors', trek: 'outdoors', camping: 'outdoors', walk: 'outdoors', nature: 'outdoors',
  // art
  art: 'art', museum: 'art', movie: 'art', theater: 'art', book: 'art', reading: 'art', craft: 'art',
  // food
  food: 'food', dinner: 'food', lunch: 'food', coffee: 'food', restaurant: 'food', drink: 'food', drinks: 'food', cafe: 'food',
  // technology
  tech: 'technology', coding: 'technology', hackathon: 'technology', software: 'technology', programming: 'technology',
  // gaming
  game: 'gaming', gaming: 'gaming', board: 'gaming', esports: 'gaming',
  // music
  music: 'music', concert: 'music', band: 'music', jam: 'music', guitar: 'music', singing: 'music',
  // business
  business: 'business', networking: 'business', startup: 'business', career: 'business',
  // education
  education: 'education', study: 'education', class: 'education', workshop: 'education', learning: 'education', learn: 'education',
};

export function getDefaultCategoryImage(category: string | undefined): string {
  if (!category) return social;
  const rawKey = category.toLowerCase().trim();
  
  if (images[rawKey]) return images[rawKey];
  
  for (const [keyword, mappedCategory] of Object.entries(keywordMap)) {
    if (rawKey.includes(keyword)) {
      return images[mappedCategory];
    }
  }

  return social;
}

export function getCoverImage(coverUrl: string | null | undefined, category: string | undefined): string {
  // If there is a cover URL and it's not one of our old unsplash placeholders, use it
  if (coverUrl && !coverUrl.includes('unsplash.com')) {
    return coverUrl;
  }
  return getDefaultCategoryImage(category);
}

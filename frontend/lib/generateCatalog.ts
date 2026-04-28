import { Skin, Accessory } from '@/types';
import { getSkins, saveSkins, getAccessories, saveAccessories } from '@/lib/storage';

// Roblox-style colors - Expanded palette with more pixel colors
const COLORS = [
  '#FFFFFF', // White
  '#F2F2F2', // Light gray
  '#E6E6E6', // Very light gray
  '#CCCCCC', // Light gray
  '#B3B3B3', // Medium gray
  '#999999', // Gray
  '#808080', // Dark gray
  '#666666', // Darker gray
  '#4D4D4D', // Very dark gray
  '#333333', // Almost black
  '#000000', // Black
  '#FF0000', // Red
  '#FF3333', // Light red
  '#CC0000', // Dark red
  '#FF8000', // Orange
  '#FF9900', // Bright orange
  '#FFBF00', // Gold
  '#FFCC00', // Bright gold
  '#FFFF00', // Yellow
  '#CCFF00', // Yellow-green
  '#80FF00', // Lime
  '#66FF00', // Bright lime
  '#00FF00', // Green
  '#00CC00', // Dark green
  '#00FF80', // Teal
  '#00FFCC', // Bright teal
  '#00FFFF', // Cyan
  '#00CCFF', // Bright cyan
  '#0080FF', // Blue
  '#0066FF', // Bright blue
  '#0000FF', // Navy
  '#3333FF', // Bright navy
  '#8000FF', // Purple
  '#9900FF', // Bright purple
  '#BF00FF', // Magenta
  '#CC00FF', // Bright magenta
  '#FF00FF', // Pink
  '#FF00CC', // Bright pink
  '#FF0080', // Rose
  '#FF0066', // Bright rose
  '#8B4513', // Brown
  '#A0522D', // Sienna
  '#CD853F', // Peru
  '#D2691E', // Chocolate
];

//name generators
const skinNamePrefixes = [
  'Neon', 'Crimson', 'Galaxy', 'Urban', 'Desert', 'Arctic', 'Tropical', 'Cyber', 'Steam', 'Retro',
  'Classic', 'Elite', 'Pro', 'Ultra', 'Mega', 'Super', 'Hyper', 'Turbo', 'Nitro', 'Blast',
  'Shadow', 'Phantom', 'Ghost', 'Stealth', 'Dark', 'Light', 'Bright', 'Glow', 'Shine', 'Spark',
  'Fire', 'Ice', 'Storm', 'Thunder', 'Lightning', 'Wind', 'Water', 'Earth', 'Nature', 'Forest',
  'Ocean', 'Sky', 'Star', 'Moon', 'Sun', 'Cosmic', 'Space', 'Astro', 'Nova', 'Comet',
  'Royal', 'King', 'Queen', 'Prince', 'Princess', 'Knight', 'Warrior', 'Guard', 'Soldier', 'Hero',
  'Ninja', 'Samurai', 'Viking', 'Pirate', 'Cowboy', 'Detective', 'Agent', 'Spy', 'Hunter', 'Ranger',
  'Wizard', 'Mage', 'Sorcerer', 'Witch', 'Warlock', 'Druid', 'Priest', 'Monk', 'Paladin', 'Cleric',
  'Robot', 'Android', 'Cyborg', 'Mech', 'Drone', 'Bot', 'AI', 'Tech', 'Digital', 'Virtual',
  'Zombie', 'Vampire', 'Werewolf', 'Demon', 'Angel', 'Devil', 'Alien', 'Monster', 'Beast', 'Creature',
  'Cute', 'Adorable', 'Sweet', 'Charming', 'Lovely', 'Pretty', 'Beautiful', 'Elegant', 'Graceful', 'Fancy',
  'Cool', 'Rad', 'Epic', 'Awesome', 'Amazing', 'Incredible', 'Fantastic', 'Wonderful', 'Magnificent', 'Legendary'
];

const skinNameSuffixes = [
  'Runner', 'Guard', 'Bot', 'Operative', 'Agent', 'Warrior', 'Knight', 'Hero', 'Champion', 'Master',
  'Pro', 'Elite', 'Legend', 'Myth', 'Titan', 'Giant', 'Beast', 'Monster', 'Dragon', 'Phoenix',
  'Storm', 'Blade', 'Fist', 'Strike', 'Punch', 'Kick', 'Dash', 'Rush', 'Zoom', 'Flash',
  'Fire', 'Ice', 'Lightning', 'Thunder', 'Wind', 'Water', 'Earth', 'Nature', 'Forest', 'Ocean',
  'Star', 'Moon', 'Sun', 'Comet', 'Nova', 'Cosmic', 'Space', 'Astro', 'Galaxy', 'Nebula',
  'Shadow', 'Phantom', 'Ghost', 'Specter', 'Wraith', 'Spirit', 'Soul', 'Essence', 'Aura', 'Energy',
  'King', 'Queen', 'Prince', 'Princess', 'Duke', 'Duchess', 'Lord', 'Lady', 'Baron', 'Baroness',
  'Ninja', 'Samurai', 'Shogun', 'Ronin', 'Kunoichi', 'Assassin', 'Rogue', 'Thief', 'Bandit', 'Outlaw',
  'Wizard', 'Mage', 'Sorcerer', 'Warlock', 'Witch', 'Enchanter', 'Alchemist', 'Necromancer', 'Summoner', 'Conjurer',
  'Robot', 'Android', 'Cyborg', 'Mech', 'Golem', 'Automaton', 'Construct', 'Drone', 'Bot', 'AI',
  'Zombie', 'Vampire', 'Werewolf', 'Demon', 'Angel', 'Devil', 'Fiend', 'Imp', 'Goblin', 'Orc',
  'Cute', 'Sweet', 'Charming', 'Lovely', 'Pretty', 'Beautiful', 'Elegant', 'Graceful', 'Fancy', 'Glamorous',
  'Cool', 'Rad', 'Epic', 'Awesome', 'Amazing', 'Incredible', 'Fantastic', 'Wonderful', 'Magnificent', 'Legendary'
];

const accessoryNamePrefixes = [
  'Gold', 'Silver', 'Platinum', 'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Amethyst', 'Topaz', 'Pearl',
  'Neon', 'Glow', 'Shine', 'Sparkle', 'Twinkle', 'Bright', 'Radiant', 'Luminous', 'Brilliant', 'Dazzling',
  'Royal', 'Regal', 'Noble', 'Elegant', 'Fancy', 'Luxury', 'Premium', 'Deluxe', 'Supreme', 'Ultimate',
  'Classic', 'Vintage', 'Retro', 'Old', 'Ancient', 'Antique', 'Traditional', 'Timeless', 'Eternal', 'Immortal',
  'Cool', 'Rad', 'Epic', 'Awesome', 'Amazing', 'Incredible', 'Fantastic', 'Wonderful', 'Magnificent', 'Legendary',
  'Dark', 'Shadow', 'Phantom', 'Ghost', 'Stealth', 'Night', 'Midnight', 'Black', 'Obsidian', 'Onyx',
  'Fire', 'Flame', 'Blaze', 'Inferno', 'Scorch', 'Burn', 'Ember', 'Ash', 'Coal', 'Lava',
  'Ice', 'Frost', 'Freeze', 'Glacier', 'Crystal', 'Diamond', 'Snow', 'Winter', 'Arctic', 'Polar',
  'Nature', 'Forest', 'Jungle', 'Wood', 'Leaf', 'Tree', 'Moss', 'Grass', 'Earth', 'Stone',
  'Ocean', 'Sea', 'Wave', 'Tide', 'Coral', 'Pearl', 'Shell', 'Aqua', 'Blue', 'Cyan',
  'Sky', 'Cloud', 'Wind', 'Breeze', 'Storm', 'Thunder', 'Lightning', 'Rain', 'Rainbow', 'Sun',
  'Star', 'Moon', 'Sun', 'Comet', 'Nova', 'Cosmic', 'Space', 'Astro', 'Galaxy', 'Nebula',
  'Robot', 'Tech', 'Cyber', 'Digital', 'Virtual', 'AI', 'Mech', 'Steam', 'Gear', 'Circuit',
  'Cute', 'Sweet', 'Charming', 'Lovely', 'Pretty', 'Beautiful', 'Adorable', 'Cuddly', 'Snuggle', 'Hug'
];

const accessoryNameSuffixes = {
  hat: ['Cap', 'Hat', 'Beanie', 'Beret', 'Fedora', 'Crown', 'Tiara', 'Helmet', 'Visor', 'Headband'],
  chain: ['Chain', 'Necklace', 'Pendant', 'Choker', 'Collar', 'Locket', 'Medallion', 'Amulet', 'Talisman', 'Charm'],
  glasses: ['Glasses', 'Sunglasses', 'Goggles', 'Spectacles', 'Monocle', 'Visor', 'Shades', 'Frames', 'Lenses', 'Optics'],
  shirt: ['Shirt', 'T-Shirt', 'Tank Top', 'Hoodie', 'Sweater', 'Jacket', 'Vest', 'Coat', 'Blazer', 'Cardigan'],
  pants: ['Pants', 'Jeans', 'Shorts', 'Leggings', 'Sweatpants', 'Cargo Pants', 'Chinos', 'Trousers', 'Slacks', 'Joggers'],
  shoes: ['Sneakers', 'Boots', 'Shoes', 'Sandals', 'Slippers', 'High Tops', 'Loafers', 'Heels', 'Flats', 'Cleats'],
  backpack: ['Backpack', 'Bag', 'Pack', 'Rucksack', 'Satchel', 'Knapsack', 'Pouch', 'Sack', 'Case', 'Carrier'],
  wings: ['Wings', 'Feathers', 'Plumes', 'Pinions', 'Flight', 'Soar', 'Glide', 'Flutter', 'Flap', 'Aero'],
  pet: ['Pet', 'Companion', 'Buddy', 'Friend', 'Pal', 'Mate', 'Partner', 'Sidekick', 'Follower', 'Guardian']
};

// Generate random color from Roblox palette
function getRandomColor(): string {
  return ROBOX_COLORS[Math.floor(Math.random() * ROBOX_COLORS.length)];
}

// Generate unique ID
function generateId(prefix: string, index: number): string {
  return `${prefix}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate rarity based on distribution
function generateRarity(): 'common' | 'rare' | 'legendary' {
  const rand = Math.random();
  if (rand < 0.7) return 'common'; // 70% common
  if (rand < 0.95) return 'rare'; // 25% rare
  return 'legendary'; // 5% legendary
}

// Generate price based on rarity
function generatePrice(rarity: 'common' | 'rare' | 'legendary'): number {
  switch (rarity) {
    case 'common':
      return Math.floor(Math.random() * 200) + 0; // 0-200
    case 'rare':
      return Math.floor(Math.random() * 800) + 200; // 200-1000
    case 'legendary':
      return Math.floor(Math.random() * 2000) + 1000; // 1000-3000
  }
}

// Generate skin name
function generateSkinName(index: number): string {
  const prefix = skinNamePrefixes[Math.floor(Math.random() * skinNamePrefixes.length)];
  const suffix = skinNameSuffixes[Math.floor(Math.random() * skinNameSuffixes.length)];

  // Sometimes add a number or special modifier
  const modifiers = ['', '', '', '', '', ' Pro', ' Elite', ' Ultra', ' Max', ' Plus', ` ${Math.floor(Math.random() * 1000)}`];
  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];

  return `${prefix} ${suffix}${modifier}`;
}

// Generate accessory name
function generateAccessoryName(type: string, index: number): string {
  const prefix = accessoryNamePrefixes[Math.floor(Math.random() * accessoryNamePrefixes.length)];
  const suffixes = accessoryNameSuffixes[type as keyof typeof accessoryNameSuffixes] || ['Item'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  // Sometimes add a number or special modifier
  const modifiers = ['', '', '', '', '', ' Pro', ' Elite', ' Deluxe', ' Premium', ` ${Math.floor(Math.random() * 100)}`];
  const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];

  return `${prefix} ${suffix}${modifier}`;
}

// Generate a skin with Roblox-style multi-colored body parts
export function generateSkin(index: number): Skin {
  const rarity = generateRarity();
  const price = generatePrice(rarity);
  const name = generateSkinName(index);

  // Generate unique colors for each body part (Roblox style)
  const headColor = getRandomColor();
  const torsoColor = getRandomColor();
  const armColor = getRandomColor();
  const legsColor = getRandomColor();

  return {
    id: generateId('skin', index),
    name,
    rarity,
    price,
    img: name.replace(/\s+/g, ''),
    use3d: true,
    defaultAnimation: 'idle',
    colors: {
      head: headColor,
      torso: torsoColor,
      arm: armColor,
      legs: legsColor
    }
  };
}

// Generate an accessory
export function generateAccessory(type: string, index: number): Accessory {
  const rarity = generateRarity();
  const price = generatePrice(rarity);
  const name = generateAccessoryName(type, index);
  const color = getRandomColor();

  return {
    id: generateId('acc', index),
    type: type as any,
    name,
    color,
    price,
    rarity
  };
}

// Generate all items (5000 skins + 5000 accessories)
export function generateFullCatalog(): { skins: Skin[]; accessories: Accessory[] } {
  const skins: Skin[] = [];
  const accessories: Accessory[] = [];

  const accessoryTypes = ['hat', 'chain', 'glasses', 'shirt', 'pants', 'shoes', 'backpack', 'wings', 'pet'];
  const accessoriesPerType = Math.floor(5000 / accessoryTypes.length);

  // Generate 5000 skins
  console.log('Generating 5000 skins...');
  for (let i = 0; i < 5000; i++) {
    skins.push(generateSkin(i));
    if ((i + 1) % 500 === 0) {
      console.log(`Generated ${i + 1} skins...`);
    }
  }

  // Generate 5000 accessories (distributed across types)
  console.log('Generating 5000 accessories...');
  let accIndex = 0;
  for (const type of accessoryTypes) {
    for (let i = 0; i < accessoriesPerType; i++) {
      accessories.push(generateAccessory(type, accIndex));
      accIndex++;
    }
  }

  // Add remaining accessories to reach 5000
  const remaining = 5000 - accessories.length;
  for (let i = 0; i < remaining; i++) {
    const randomType = accessoryTypes[Math.floor(Math.random() * accessoryTypes.length)];
    accessories.push(generateAccessory(randomType, accIndex));
    accIndex++;
  }

  console.log(`Generated ${skins.length} skins and ${accessories.length} accessories!`);

  return { skins, accessories };
}

// Generate and save to localStorage
export function populateCatalog(): { skins: Skin[]; accessories: Accessory[] } {
  if (typeof window === 'undefined') {
    console.error('Cannot populate catalog on server side');
    return { skins: [], accessories: [] };
  }

  const { skins, accessories } = generateFullCatalog();

  // Get existing items using storage functions
  const existingSkins = getSkins();
  const existingAccessories = getAccessories();

  // Merge with existing (avoid duplicates by ID)
  const existingSkinIds = new Set(existingSkins.map((s: Skin) => s.id));
  const existingAccessoryIds = new Set(existingAccessories.map((a: Accessory) => a.id));

  const newSkins = skins.filter(s => !existingSkinIds.has(s.id));
  const newAccessories = accessories.filter(a => !existingAccessoryIds.has(a.id));

  const allSkins = [...existingSkins, ...newSkins];
  const allAccessories = [...existingAccessories, ...newAccessories];

  // Save using storage functions
  saveSkins(allSkins);
  saveAccessories(allAccessories);

  console.log(`Catalog populated! Total: ${allSkins.length} skins, ${allAccessories.length} accessories`);
  console.log(`Added: ${newSkins.length} new skins, ${newAccessories.length} new accessories`);

  return { skins: allSkins, accessories: allAccessories };
}












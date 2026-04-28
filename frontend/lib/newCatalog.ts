// New catalog based on provided images - exact names and textures
import { Skin, Accessory } from '@/types';

const FACE_NAMES = [
    'Aurora Grin', 'Nebula Wink', 'Solar Smirk', 'Lunar Calm', 'Comet Chuckle',
    'Orbit Glimmer', 'Pulsar Bright', 'Quasar Cool', 'Meteor Mirth', 'Asteroid Ash',
    'Cosmos Clever', 'Stardust Soft', 'Galaxy Glee', 'Nova Nice', 'Eclipse Edge',
    'Horizon Hype', 'Canyon Cool', 'Tundra Tease', 'Meadow Mellow', 'Dune Drift',
    'Ridge Relaxed', 'Brook Breeze', 'Cliff Clever', 'Delta Dimple', 'Summit Sweet',
    'Fable Fair', 'Mythic Moxie', 'Rune Relic', 'Sigil Soft', 'Rune Riddle',
    'Chrono Charm', 'Aether Amble', 'Zephyr Zing', 'Gale Grit', 'Breeze Bright',
    'Cobalt Cue', 'Crimson Cue', 'Jade Jest', 'Ivory Idle', 'Onyx Ode',
    'Pearl Polish', 'Sapphire Side', 'Topaz Tune', 'Opal Oasis', 'Quartz Quiet',
    'Violet Verve', 'Indigo Insight', 'Amber Aim', 'Rose Ripple', 'Mint Motion',
];

/** Procedural faces: free, coins, or safety points — applied to head preview */
export const EXTRA_FACES: Skin[] = FACE_NAMES.map((name, i) => {
    const idx = i + 1;
    const hue = (idx * 47 + 120) % 360;
    const head = `hsl(${hue} 72% 62%)`;
    const torso = '#4d536f';
    const arm = '#3a3f56';
    const legs = '#3a3f56';
    let price = 0;
    let safetyPointsPrice: number | undefined = undefined;
    let isSpecial = false;
    if (idx <= 12) {
        price = 0;
    } else if (idx <= 27) {
        price = 35 + (idx % 8) * 15;
    } else {
        isSpecial = true;
        safetyPointsPrice = 40 + (idx % 12) * 10;
    }
    return {
        id: `face_gen_${String(idx).padStart(2, '0')}`,
        name,
        price,
        safetyPointsPrice,
        isFace: true,
        use3d: true,
        defaultAnimation: 'idle',
        ...(isSpecial ? { isSpecial: true } : {}),
        theme: `face-set-${Math.ceil(idx / 10)}`,
        colors: { head, torso, arm, legs },
        materials: {
            head: { type: 'skin', roughness: 0.55, metalness: 0 },
            torso: { type: 'cloth', roughness: 0.82, metalness: 0 },
            arm: { type: 'skin', roughness: 0.55, metalness: 0 },
            legs: { type: 'cloth', roughness: 0.82, metalness: 0 }
        },
        textures: {
            head: { base: 'smooth' },
            torso: { base: 'fabric' },
            arm: { base: 'smooth' },
            legs: { base: 'fabric' }
        },
        highlights: {
            head: `hsl(${(hue + 25) % 360} 65% 75%)`,
            torso: '#5c637a',
            arm: '#4a5068',
            legs: '#4a5068'
        }
    };
});

const FREE_ACCESSORIES: Accessory[] = [
    { id: 'acc_free_round_specs', name: 'Round Specs', type: 'glasses', price: 0, img: '', color: '#222' },
    { id: 'acc_free_star_pin', name: 'Star Pin', type: 'chain', price: 0, img: '', color: '#ffd700', position: { x: 0, y: 2.4, z: 0.12 } },
    { id: 'acc_free_striped_cap', name: 'Striped Cap', type: 'hat', price: 0, img: '', color: '#ff6b6b', position: { x: 0, y: 2.78, z: 0 } },
    { id: 'acc_free_blue_headphones', name: 'Studio Headphones', type: 'hat', price: 0, img: '', color: '#3b82f6', position: { x: 0, y: 2.72, z: 0 } },
    { id: 'acc_free_ruby_chain', name: 'Ruby Chain', type: 'chain', price: 0, img: '', color: '#e11d48', position: { x: 0, y: 2.35, z: 0.08 } },
    { id: 'acc_free_paper_boat', name: 'Paper Boat Hat', type: 'hat', price: 0, img: '', color: '#ffffff', position: { x: 0, y: 2.85, z: 0 } },
    { id: 'acc_free_pixel_shades', name: 'Pixel Shades', type: 'glasses', price: 0, img: '', color: '#00ffc8' },
    { id: 'acc_free_friend_band', name: 'Friend Band', type: 'chain', price: 0, img: '', color: '#a855f7', position: { x: 0, y: 2.42, z: 0.05 } },
    { id: 'acc_free_mini_wings', name: 'Mini Wings', type: 'backpack', price: 0, img: '', color: '#bae6fd', position: { x: 0, y: 2.5, z: -0.35 } },
    { id: 'acc_free_cookie_buddy', name: 'Cookie Buddy', type: 'pet', price: 0, img: '', color: '#d97706', position: { x: 0.35, y: -1.45, z: -1.15 } },
    { id: 'acc_free_cloud_float', name: 'Cloud Float', type: 'pet', price: 0, img: '', color: '#e0f2fe', position: { x: -0.35, y: -1.2, z: -1.2 } },
    { id: 'acc_free_spark_bandana', name: 'Spark Bandana', type: 'shirt', price: 0, img: '', color: '#f97316', position: { x: 0, y: 2.35, z: 0.18 } },
];

const EXTRA_PAID_ACCESSORIES: Accessory[] = [
    { id: 'acc_coin_runner_kicks', name: 'Runner Kicks', type: 'shoes', price: 120, img: '', color: '#ffffff' },
    { id: 'acc_coin_arcade_pack', name: 'Arcade Backpack', type: 'backpack', price: 220, img: '', color: '#6366f1', position: { x: 0, y: 2.35, z: -0.35 } },
    { id: 'acc_coin_neon_visor', name: 'Neon Visor', type: 'glasses', price: 140, img: '', color: '#22d3ee' },
    { id: 'acc_coin_track_jacket', name: 'Track Jacket', type: 'shirt', price: 180, img: '', color: '#14b8a6' },
    { id: 'acc_coin_city_scarf', name: 'City Scarf', type: 'chain', price: 95, img: '', color: '#64748b', position: { x: 0, y: 2.28, z: 0.12 } },
    { id: 'acc_coin_skater_helmet', name: 'Skater Helmet', type: 'hat', price: 160, img: '', color: '#facc15', position: { x: 0, y: 2.76, z: 0 } },
    { id: 'acc_coin_holo_watch', name: 'Holo Watch', type: 'chain', price: 210, img: '', color: '#38bdf8', position: { x: 0.42, y: 1.85, z: 0.18 } },
    { id: 'acc_coin_leaf_cloak', name: 'Leaf Cloak', type: 'backpack', price: 260, img: '', color: '#22c55e', position: { x: 0, y: 2.45, z: -0.42 } },
    { id: 'acc_coin_comet_tail', name: 'Comet Tail', type: 'wings', price: 340, img: '', color: '#fde047', position: { x: 0, y: 2.55, z: -0.55 } },
    { id: 'acc_coin_robo_hand', name: 'Robo Hand', type: 'weapon', price: 300, img: '', color: '#94a3b8', position: { x: 0.65, y: 1.9, z: 0.25 } },
    { id: 'acc_coin_rhythm_headset', name: 'Rhythm Headset', type: 'hat', price: 175, img: '', color: '#fb7185', position: { x: 0, y: 2.74, z: 0 } },
    { id: 'acc_coin_shadow_mask', name: 'Shadow Mask', type: 'mask', price: 155, img: '', color: '#1e293b' },
    { id: 'acc_coin_dual_tone_kicks', name: 'Dual Tone Kicks', type: 'shoes', price: 205, img: '', color: '#c084fc' },
    { id: 'acc_coin_coach_whistle', name: 'Coach Whistle', type: 'chain', price: 85, img: '', color: '#fcd34d', position: { x: 0, y: 2.32, z: 0.14 } },
    { id: 'acc_coin_iron_cuff', name: 'Iron Cuff', type: 'chain', price: 135, img: '', color: '#cbd5e1', position: { x: -0.42, y: 1.82, z: 0.16 } },
    { id: 'acc_coin_sp_floor_sign', name: 'Safety Buddy Sign', type: 'pet', price: 265, img: '', color: '#34d399', position: { x: 0.45, y: -1.55, z: -1.05 } },
    { id: 'acc_coin_spark_drone', name: 'Spark Drone', type: 'drone', price: 380, img: '', color: '#60a5fa', floatHeight: 3.2, rotationSpeed: 0.65 },
    { id: 'acc_dual_bandana_combo', name: 'Bandana Combo', type: 'shirt', price: 150, safetyPointsPrice: 95, img: '', color: '#fb923c' },
    { id: 'acc_dual_shield_pins', name: 'Shield Pins', type: 'chain', price: 110, safetyPointsPrice: 70, img: '', color: '#38bdf8', position: { x: 0, y: 2.4, z: 0.1 } },
    { id: 'acc_dual_arc_wings', name: 'Arc Wings', type: 'wings', price: 420, safetyPointsPrice: 260, img: '', color: '#a78bfa', position: { x: 0, y: 2.6, z: -0.52 } },
    { id: 'acc_sp_patrol_cap', name: 'Patrol Cap', type: 'hat', price: 0, safetyPointsPrice: 120, img: '', color: '#1d4ed8', isSpecial: true, position: { x: 0, y: 2.77, z: 0 } },
    { id: 'acc_sp_reflect_jacket', name: 'Reflect Jacket', type: 'shirt', price: 0, safetyPointsPrice: 180, img: '', color: '#fbbf24', isSpecial: true },
    { id: 'acc_sp_guard_specs', name: 'Guard Specs', type: 'glasses', price: 0, safetyPointsPrice: 90, img: '', color: '#22c55e', isSpecial: true },
    { id: 'acc_sp_signal_pack', name: 'Signal Pack', type: 'backpack', price: 0, safetyPointsPrice: 210, img: '', color: '#f97316', isSpecial: true, position: { x: 0, y: 2.38, z: -0.38 } },
    { id: 'acc_sp_crosswalk_band', name: 'Crosswalk Band', type: 'chain', price: 0, safetyPointsPrice: 75, img: '', color: '#eab308', isSpecial: true, position: { x: 0, y: 2.34, z: 0.08 } },
    { id: 'acc_sp_neon_gloves', name: 'Neon Gloves', type: 'weapon', price: 0, safetyPointsPrice: 140, img: '', color: '#ec4899', isSpecial: true, position: { x: 0.55, y: 1.78, z: 0.22 } },
    { id: 'acc_sp_sidewalk_bot', name: 'Sidewalk Bot', type: 'pet', price: 0, safetyPointsPrice: 230, img: '', color: '#94a3b8', isSpecial: true, position: { x: -0.42, y: -1.48, z: -1.18 } },
    { id: 'acc_sp_traffic_kite', name: 'Traffic Kite', type: 'pet', price: 0, safetyPointsPrice: 155, img: '', color: '#ef4444', isSpecial: true, position: { x: 0.5, y: 2.15, z: -0.85 } },
];

/**
 * Day-one starter character skins — unified “Playground Pop” direction: warm skin, saturated friendly hues,
 * soft PBR read; matches procedural environment pack saturation (not photoreal).
 */
export const STARTER_DAY_ONE_SKINS: Skin[] = [
    {
        id: 'starter_coral_pop',
        name: 'Coral Pop',
        price: 0,
        img: '',
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'starter-day-one-v1',
        colors: { head: '#E8B89A', torso: '#FF6B6B', arm: '#E8B89A', legs: '#4ECDC4' },
        materials: {
            head: { type: 'skin', roughness: 0.58, metalness: 0 },
            torso: { type: 'cloth', roughness: 0.82, metalness: 0 },
            arm: { type: 'skin', roughness: 0.58, metalness: 0 },
            legs: { type: 'cloth', roughness: 0.82, metalness: 0 },
        },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } },
        highlights: { head: '#F5D0B5', torso: '#FF8A80', arm: '#F5D0B5', legs: '#7FDBDA' },
    },
    {
        id: 'starter_mint_arcade',
        name: 'Mint Arcade',
        price: 0,
        img: '',
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'starter-day-one-v1',
        colors: { head: '#E8B89A', torso: '#2EE6A6', arm: '#E8B89A', legs: '#1B4D5C' },
        materials: {
            head: { type: 'skin', roughness: 0.58, metalness: 0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0 },
            arm: { type: 'skin', roughness: 0.58, metalness: 0 },
            legs: { type: 'cloth', roughness: 0.85, metalness: 0 },
        },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } },
        highlights: { head: '#F5D0B5', torso: '#6FFFD4', arm: '#F5D0B5', legs: '#3D7A8C' },
    },
    {
        id: 'starter_butter_sky',
        name: 'Butter Sky',
        price: 0,
        img: '',
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'starter-day-one-v1',
        colors: { head: '#E8B89A', torso: '#FFE066', arm: '#E8B89A', legs: '#5B8DEF' },
        materials: {
            head: { type: 'skin', roughness: 0.58, metalness: 0 },
            torso: { type: 'cloth', roughness: 0.78, metalness: 0 },
            arm: { type: 'skin', roughness: 0.58, metalness: 0 },
            legs: { type: 'cloth', roughness: 0.82, metalness: 0 },
        },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } },
        highlights: { head: '#F5D0B5', torso: '#FFF3A0', arm: '#F5D0B5', legs: '#8FB4FF' },
    },
    {
        id: 'starter_lilac_quest',
        name: 'Lilac Quest',
        price: 0,
        img: '',
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'starter-day-one-v1',
        colors: { head: '#E8B89A', torso: '#B388FF', arm: '#E8B89A', legs: '#F06292' },
        materials: {
            head: { type: 'skin', roughness: 0.58, metalness: 0 },
            torso: { type: 'cloth', roughness: 0.82, metalness: 0 },
            arm: { type: 'skin', roughness: 0.58, metalness: 0 },
            legs: { type: 'cloth', roughness: 0.82, metalness: 0 },
        },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } },
        highlights: { head: '#F5D0B5', torso: '#D4C4FF', arm: '#F5D0B5', legs: '#FF8FB3' },
    },
    {
        id: 'starter_teal_trail',
        name: 'Teal Trail',
        price: 0,
        img: '',
        use3d: true,
        defaultAnimation: 'idle',
        theme: 'starter-day-one-v1',
        colors: { head: '#E8B89A', torso: '#20B2AA', arm: '#E8B89A', legs: '#FF9F43' },
        materials: {
            head: { type: 'skin', roughness: 0.58, metalness: 0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0 },
            arm: { type: 'skin', roughness: 0.58, metalness: 0 },
            legs: { type: 'cloth', roughness: 0.82, metalness: 0 },
        },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } },
        highlights: { head: '#F5D0B5', torso: '#5EE0D8', arm: '#F5D0B5', legs: '#FFC382' },
    },
];

// Starter skins - 10 Pixel-Coins each, perfect for new players
const STARTER_10_COIN_SKINS: Skin[] = [
    {
        id: "sunny_buddy", name: "Sunny Buddy", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FFD700", arm: "#F4C2A1", legs: "#FFD700" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "berry_friend", name: "Berry Friend", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#E91E63", arm: "#F4C2A1", legs: "#E91E63" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "mint_fresh", name: "Mint Fresh", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#4CAF50", arm: "#F4C2A1", legs: "#4CAF50" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "sky_explorer", name: "Sky Explorer", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#2196F3", arm: "#F4C2A1", legs: "#2196F3" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "lavender_dream", name: "Lavender Dream", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#9C27B0", arm: "#F4C2A1", legs: "#9C27B0" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "coral_reef", name: "Coral Reef", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FF5722", arm: "#F4C2A1", legs: "#FF5722" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "tropical_punch", name: "Tropical Punch", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#00BCD4", arm: "#F4C2A1", legs: "#00BCD4" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "honey_buzz", name: "Honey Buzz", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FFC107", arm: "#F4C2A1", legs: "#795548" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
    {
        id: "peach_blossom", name: "Peach Blossom", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FFCDD2", arm: "#F4C2A1", legs: "#FFCDD2" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } }
    },
];

export const NEW_SKINS: Skin[] = [
    ...STARTER_DAY_ONE_SKINS,
    ...STARTER_10_COIN_SKINS,
    ...EXTRA_FACES,
    // Blue Blob Character with yellow patch
    {
        id: "blue_blob",
        name: "Blue Blob",
        price: 0,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        colors: {
            head: "#4A90E2",
            torso: "#4A90E2",
            arm: "#4A90E2",
            legs: "#4A90E2"
        },
        materials: {
            head: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            torso: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            legs: { type: 'skin', roughness: 0.7, metalness: 0.0 }
        },
        textures: {
            head: { base: 'smooth' },
            torso: { base: 'smooth' },
            arm: { base: 'smooth' },
            legs: { base: 'smooth' }
        }
    },
    // Pink-haired Girl with yellow flower and pleated skirt
    {
        id: "pink_girl",
        name: "Pink Girl",
        price: 100,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        colors: {
            head: "#F4C2A1",
            torso: "#FFB6C1",
            arm: "#F4C2A1",
            legs: "#FFD700"
        },
        materials: {
            head: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            legs: { type: 'cloth', roughness: 0.8, metalness: 0.0 }
        },
        textures: {
            head: { base: 'smooth' },
            torso: { base: 'fabric' },
            arm: { base: 'smooth' },
            legs: { base: 'fabric' }
        }
    },
    // Green Figure with Leaves
    {
        id: "green_nature",
        name: "Green Nature",
        price: 100,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        colors: {
            head: "#228B22",
            torso: "#228B22",
            arm: "#228B22",
            legs: "#228B22"
        },
        materials: {
            head: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            torso: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            legs: { type: 'skin', roughness: 0.7, metalness: 0.0 }
        },
        textures: {
            head: { base: 'smooth' },
            torso: { base: 'smooth' },
            arm: { base: 'smooth' },
            legs: { base: 'smooth' }
        }
    },
    // Blue Capped Boy with star
    {
        id: "blue_star_boy",
        name: "Star Boy",
        price: 150,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        colors: {
            head: "#F4C2A1",
            torso: "#0000FF",
            arm: "#F4C2A1",
            legs: "#0000FF"
        },
        materials: {
            head: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            legs: { type: 'cloth', roughness: 0.8, metalness: 0.0 }
        },
        textures: {
            head: { base: 'smooth' },
            torso: { base: 'fabric' },
            arm: { base: 'smooth' },
            legs: { base: 'fabric' }
        }
    },
    // Orange-striped Boy
    {
        id: "orange_striped_boy",
        name: "Orange Striped Boy",
        price: 150,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        colors: {
            head: "#F4C2A1",
            torso: "#FF8C00",
            arm: "#F4C2A1",
            legs: "#0000FF"
        },
        materials: {
            head: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            legs: { type: 'cloth', roughness: 0.8, metalness: 0.0 }
        },
        textures: {
            head: { base: 'smooth' },
            torso: { base: 'fabric' },
            arm: { base: 'smooth' },
            legs: { base: 'fabric' }
        }
    },
    // Banana Man
    {
        id: "banana_man",
        name: "Banana Man",
        price: 200,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        colors: {
            head: "#FFD700",
            torso: "#FFD700",
            arm: "#FFD700",
            legs: "#FFD700"
        },
        materials: {
            head: { type: 'skin', roughness: 0.8, metalness: 0.0 },
            torso: { type: 'skin', roughness: 0.8, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.8, metalness: 0.0 },
            legs: { type: 'skin', roughness: 0.8, metalness: 0.0 }
        },
        textures: {
            head: { base: 'banana_peel' },
            torso: { base: 'banana_peel' },
            arm: { base: 'banana_peel' },
            legs: { base: 'banana_peel' }
        }
    },
    // Cheeseburger
    {
        id: "cheeseburger",
        name: "Cheeseburger",
        price: 250,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        colors: {
            head: "#FFA500",
            torso: "#8B4513",
            arm: "#FFA500",
            legs: "#FFA500"
        },
        materials: {
            head: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            torso: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            legs: { type: 'skin', roughness: 0.7, metalness: 0.0 }
        },
        textures: {
            head: { base: 'bun' },
            torso: { base: 'meat' },
            arm: { base: 'bun' },
            legs: { base: 'bun' }
        }
    },
    // Tennis Player - exact match to image
    {
        id: "tennis_player",
        name: "Tennis Player",
        rarity: "rare",
        price: 450,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        theme: "sports",
        colors: {
            head: "#D4A574",
            torso: "#FFFFFF",
            arm: "#D4A574",
            legs: "#FFFFFF"
        },
        materials: {
            head: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            torso: { type: 'cloth', roughness: 0.8, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.6, metalness: 0.0 },
            legs: { type: 'cloth', roughness: 0.8, metalness: 0.0 }
        },
        textures: {
            head: { base: 'dots' },
            torso: { base: 'stripes' },
            arm: { base: 'dots' },
            legs: { base: 'stripes' }
        },
        highlights: {
            head: "#E8C5A0",
            torso: "#F5F5F5",
            arm: "#E8C5A0",
            legs: "#F5F5F5"
        },
        skinAccessories: [
            {
                type: 'hat',
                position: { x: 0, y: 0.3, z: 0 },
                color: "#FFFFFF",
                material: { type: 'cloth', roughness: 0.7, metalness: 0.0 },
                scale: { x: 1.2, y: 0.4, z: 1.2 }
            },
            {
                type: 'goggles',
                position: { x: 0, y: 0, z: 0.1 },
                color: "#000000",
                material: { type: 'plastic', roughness: 0.1, metalness: 0.8 },
                scale: { x: 1.0, y: 0.6, z: 0.1 }
            }
        ]
    },
    // Admin-only skin: ixel ace
    {
        id: "ixel_ace",
        name: "ixel ace",
        price: 0,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        adminOnly: true,
        colors: {
            head: "#E8BEAC",
            torso: "#E8BEAC",
            arm: "#E8BEAC",
            legs: "#E8BEAC"
        },
        materials: {
            head: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            torso: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            arm: { type: 'skin', roughness: 0.7, metalness: 0.0 },
            legs: { type: 'skin', roughness: 0.7, metalness: 0.0 }
        },
        textures: {
            head: { base: 'smooth' },
            torso: { base: 'smooth' },
            arm: { base: 'smooth' },
            legs: { base: 'smooth' }
        }
    }
];

export const NEW_ACCESSORIES: Accessory[] = [
    ...FREE_ACCESSORIES,
    ...EXTRA_PAID_ACCESSORIES,
    // Keep only sunglasses
    {
        id: "cool_sunglasses",
        name: "Cool Sunglasses",
        type: "glasses",
        price: 100,
        img: "",
        color: "#000000"
    },
    // Wizard Hat - Triangular with bending point at top
    {
        id: "wizard_hat",
        name: "Wizard Hat",
        type: "hat",
        price: 300,
        img: "",
        color: "#4B0082",
        position: { x: 0, y: 2.75, z: 0 }
    },
    // Pets
    {
        id: "pet_slime",
        name: "Pet Slime",
        type: "pet",
        price: 200,
        img: "",
        color: "#00FF00",
        position: { x: 0, y: -1.6, z: -1.5 }
    },
    {
        id: "pet_dog",
        name: "Pet Dog",
        type: "pet",
        price: 250,
        img: "",
        color: "#8B4513",
        position: { x: 0, y: -1.6, z: -1.5 }
    },
    {
        id: "pet_cat",
        name: "Pet Cat",
        type: "pet",
        price: 250,
        img: "",
        color: "#FFA500",
        position: { x: 0, y: -1.6, z: -1.5 }
    },
    {
        id: "pet_robot",
        name: "Pet Robot",
        type: "pet",
        price: 300,
        img: "",
        color: "#808080",
        position: { x: 0, y: -1.6, z: -1.5 }
    }
];

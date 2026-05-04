// New catalog based on provided images - exact names and textures
import { Skin, Accessory } from '@/types';

// Starter skins - 10 Pixel-Coins each, perfect for new players
const STARTER_10_COIN_SKINS: Skin[] = [
    { id: "sunny_buddy", name: "Sunny Buddy", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FFD700", arm: "#F4C2A1", legs: "#FFD700" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "berry_friend", name: "Berry Friend", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#E91E63", arm: "#F4C2A1", legs: "#E91E63" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "mint_fresh", name: "Mint Fresh", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#4CAF50", arm: "#F4C2A1", legs: "#4CAF50" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "sky_explorer", name: "Sky Explorer", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#2196F3", arm: "#F4C2A1", legs: "#2196F3" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "lavender_dream", name: "Lavender Dream", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#9C27B0", arm: "#F4C2A1", legs: "#9C27B0" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "coral_reef", name: "Coral Reef", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FF5722", arm: "#F4C2A1", legs: "#FF5722" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "tropical_punch", name: "Tropical Punch", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#00BCD4", arm: "#F4C2A1", legs: "#00BCD4" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "honey_buzz", name: "Honey Buzz", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FFC107", arm: "#F4C2A1", legs: "#795548" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
    { id: "peach_blossom", name: "Peach Blossom", price: 10, img: "", use3d: true, defaultAnimation: 'idle',
        colors: { head: "#F4C2A1", torso: "#FFCDD2", arm: "#F4C2A1", legs: "#FFCDD2" },
        materials: { head: { type: 'skin', roughness: 0.6, metalness: 0 }, torso: { type: 'cloth', roughness: 0.8, metalness: 0 }, arm: { type: 'skin', roughness: 0.6, metalness: 0 }, legs: { type: 'cloth', roughness: 0.8, metalness: 0 } },
        textures: { head: { base: 'smooth' }, torso: { base: 'fabric' }, arm: { base: 'smooth' }, legs: { base: 'fabric' } } },
];

export const NEW_SKINS: Skin[] = [
    {
        id: "pixel_placer",
        name: "Pixel Placer",
        price: 0,
        img: "",
        use3d: true,
        defaultAnimation: 'idle',
        animations: [
            { name: 'Idle', type: 'idle', loop: true },
            { name: 'Walk', type: 'walk', loop: true },
            { name: 'Jump', type: 'jump', loop: true },
            { name: 'No Animation', type: 'custom', loop: true },
        ],
        colors: { head: "#F4C2A1", torso: "#4D536F", arm: "#3A3F56", legs: "#3A3F56" },
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
    ...STARTER_10_COIN_SKINS,    // Blue Blob Character with yellow patch
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

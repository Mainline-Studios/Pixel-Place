'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { getSkins, getAccessories, saveSkins, saveAccessories } from '@/lib/storage';
import EmbeddedStripePay from '@/components/EmbeddedStripePay';

interface HolidayBundleProps {
    user: User;
    onClose: () => void;
}

interface HolidayReward {
    type: 'skin' | 'accessory';
    id: string;
    name: string;
    chance: number; // Chance out of 1000 (e.g., 1 = 1/1000 = 0.1%)
}

// Get current holiday based on month
const getCurrentHoliday = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month === 10) return { name: 'Halloween', month: 10, color: '#FF6B00', theme: 'spooky' };
    if (month === 12) return { name: 'Christmas', month: 12, color: '#FF0000', theme: 'festive' };
    if (month === 2) return { name: 'Valentine', month: 2, color: '#FF1493', theme: 'romantic' };
    if (month === 3 || month === 4) return { name: 'Easter', month: month, color: '#FFD700', theme: 'spring' };
    if (month === 7 || month === 8) return { name: 'Summer', month: month, color: '#FFA500', theme: 'summer' };
    return null;
};

// Generate holiday exclusive rewards - THEMED with percentage chances!
const generateHolidayRewards = (holiday: { name: string; theme: string }): HolidayReward[] => {
    const rewards: HolidayReward[] = [];

    if (holiday.theme === 'spooky') {
        // Halloween - many themed skins with 1/1000 chances
        rewards.push(
            { type: 'skin', id: `holiday_halloween_scarecrow`, name: 'Scarecrow Jack', chance: 1 }, // 1/1000 - Ultra rare
            { type: 'skin', id: `holiday_halloween_ghost`, name: 'Floating Ghost', chance: 5 },
            { type: 'skin', id: `holiday_halloween_witch`, name: 'Witchy Witch', chance: 8 },
            { type: 'skin', id: `holiday_halloween_skeleton`, name: 'Bony Bones', chance: 10 },
            { type: 'skin', id: `holiday_halloween_vampire`, name: 'Count Dracula', chance: 8 },
            { type: 'skin', id: `holiday_halloween_zombie`, name: 'Brain Eater', chance: 10 },
            { type: 'skin', id: `holiday_halloween_frankenstein`, name: 'Frankenstein', chance: 7 },
            { type: 'skin', id: `holiday_halloween_mummy`, name: 'Mummy', chance: 8 },
            { type: 'skin', id: `holiday_halloween_werewolf`, name: 'Werewolf', chance: 5 },
            { type: 'skin', id: `holiday_halloween_spider`, name: 'Spider Person', chance: 6 },
            { type: 'accessory', id: `holiday_halloween_pumpkin`, name: 'Giant Pumpkin Head', chance: 2 },
            { type: 'accessory', id: `holiday_halloween_batwings`, name: 'Bat Wings', chance: 8 },
            { type: 'accessory', id: `holiday_halloween_witchhat`, name: 'Witch Hat', chance: 10 },
            { type: 'accessory', id: `holiday_halloween_spiderweb`, name: 'Spider Web Cape', chance: 7 },
            { type: 'accessory', id: `holiday_halloween_candy`, name: 'Candy Bucket', chance: 8 }
        );
    } else if (holiday.theme === 'festive') {
        // Christmas - many themed skins with 1/1000 chances
        rewards.push(
            { type: 'skin', id: `holiday_christmas_santa`, name: 'Santa Claus', chance: 1 },
            { type: 'skin', id: `holiday_christmas_elf`, name: 'Elf Helper', chance: 8 },
            { type: 'skin', id: `holiday_christmas_snowman`, name: 'Frosty Snowman', chance: 7 },
            { type: 'skin', id: `holiday_christmas_gingerbread`, name: 'Gingerbread Man', chance: 10 },
            { type: 'skin', id: `holiday_christmas_reindeer`, name: 'Rudolph', chance: 2 },
            { type: 'skin', id: `holiday_christmas_present`, name: 'Living Present', chance: 8 },
            { type: 'skin', id: `holiday_christmas_tree`, name: 'Christmas Tree', chance: 6 },
            { type: 'skin', id: `holiday_christmas_ornament`, name: 'Ornament Person', chance: 9 },
            { type: 'skin', id: `holiday_christmas_caroler`, name: 'Caroler', chance: 7 },
            { type: 'skin', id: `holiday_christmas_grinch`, name: 'Grinch', chance: 4 },
            { type: 'accessory', id: `holiday_christmas_santahat`, name: 'Santa Hat', chance: 10 },
            { type: 'accessory', id: `holiday_christmas_antlers`, name: 'Reindeer Antlers', chance: 8 },
            { type: 'accessory', id: `holiday_christmas_lights`, name: 'Christmas Lights', chance: 9 },
            { type: 'accessory', id: `holiday_christmas_candycane`, name: 'Candy Cane', chance: 10 },
            { type: 'accessory', id: `holiday_christmas_bells`, name: 'Jingle Bells', chance: 7 }
        );
    } else if (holiday.theme === 'romantic') {
        // Valentine - many themed skins with 1/1000 chances
        rewards.push(
            { type: 'skin', id: `holiday_valentine_cupid`, name: 'Cupid', chance: 1 },
            { type: 'skin', id: `holiday_valentine_heart`, name: 'Heart Person', chance: 8 },
            { type: 'skin', id: `holiday_valentine_rose`, name: 'Rose Petal', chance: 7 },
            { type: 'skin', id: `holiday_valentine_chocolate`, name: 'Chocolate Box', chance: 10 },
            { type: 'skin', id: `holiday_valentine_angel`, name: 'Love Angel', chance: 8 },
            { type: 'skin', id: `holiday_valentine_balloon`, name: 'Balloon Person', chance: 9 },
            { type: 'skin', id: `holiday_valentine_letter`, name: 'Love Letter', chance: 7 },
            { type: 'skin', id: `holiday_valentine_ring`, name: 'Ring Bearer', chance: 6 },
            { type: 'accessory', id: `holiday_valentine_heartcrown`, name: 'Heart Crown', chance: 10 },
            { type: 'accessory', id: `holiday_valentine_wings`, name: 'Love Wings', chance: 8 },
            { type: 'accessory', id: `holiday_valentine_arrows`, name: 'Cupid Arrows', chance: 5 },
            { type: 'accessory', id: `holiday_valentine_glasses`, name: 'Heart Glasses', chance: 12 },
            { type: 'accessory', id: `holiday_valentine_bow`, name: 'Cupid Bow', chance: 7 }
        );
    } else if (holiday.theme === 'spring') {
        // Easter - many themed skins with 1/1000 chances
        rewards.push(
            { type: 'skin', id: `holiday_easter_bunny`, name: 'Easter Bunny', chance: 2 },
            { type: 'skin', id: `holiday_easter_egg`, name: 'Easter Egg', chance: 8 },
            { type: 'skin', id: `holiday_easter_chick`, name: 'Baby Chick', chance: 10 },
            { type: 'skin', id: `holiday_easter_basket`, name: 'Easter Basket', chance: 9 },
            { type: 'skin', id: `holiday_easter_lamb`, name: 'Lamb', chance: 7 },
            { type: 'skin', id: `holiday_easter_flower`, name: 'Flower Person', chance: 8 },
            { type: 'skin', id: `holiday_easter_butterfly`, name: 'Butterfly', chance: 6 },
            { type: 'accessory', id: `holiday_easter_ears`, name: 'Bunny Ears', chance: 12 },
            { type: 'accessory', id: `holiday_easter_tail`, name: 'Bunny Tail', chance: 10 },
            { type: 'accessory', id: `holiday_easter_basket`, name: 'Easter Basket', chance: 9 },
            { type: 'accessory', id: `holiday_easter_flowercrown`, name: 'Flower Crown', chance: 11 },
            { type: 'accessory', id: `holiday_easter_wings`, name: 'Butterfly Wings', chance: 7 }
        );
    } else if (holiday.theme === 'summer') {
        // Summer - many themed skins with 1/1000 chances
        rewards.push(
            { type: 'skin', id: `holiday_summer_sun`, name: 'Sun Person', chance: 5 },
            { type: 'skin', id: `holiday_summer_wave`, name: 'Wave Rider', chance: 8 },
            { type: 'skin', id: `holiday_summer_icecream`, name: 'Ice Cream Cone', chance: 7 },
            { type: 'skin', id: `holiday_summer_beachball`, name: 'Beach Ball', chance: 9 },
            { type: 'skin', id: `holiday_summer_palm`, name: 'Palm Tree', chance: 6 },
            { type: 'skin', id: `holiday_summer_sandcastle`, name: 'Sand Castle', chance: 8 },
            { type: 'skin', id: `holiday_summer_surfboard`, name: 'Surfboard', chance: 7 },
            { type: 'accessory', id: `holiday_summer_sunglasses`, name: 'Cool Shades', chance: 12 },
            { type: 'accessory', id: `holiday_summer_flipflops`, name: 'Flip Flops', chance: 10 },
            { type: 'accessory', id: `holiday_summer_snorkel`, name: 'Snorkel', chance: 8 },
            { type: 'accessory', id: `holiday_summer_floatie`, name: 'Pool Floatie', chance: 9 }
        );
    }

    return rewards;
};

export default function HolidayBundle({ user, onClose }: HolidayBundleProps) {
    const { updateUser } = useUser();
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedReward, setSelectedReward] = useState<HolidayReward | null>(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [showStripePay, setShowStripePay] = useState(false);
    const wheelRef = useRef<HTMLCanvasElement>(null);
    const rotationRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);

    const holiday = getCurrentHoliday();
    const rewards = useMemo(() => (holiday ? generateHolidayRewards(holiday) : []), [holiday]);

    // Load saved purchase state
    useEffect(() => {
        if (!holiday) return;
        const savedState = localStorage.getItem(`holiday_bundle_${user.username}_${holiday.name}`);
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                setHasPurchased(state.hasPurchased || false);
                setHasSpun(state.hasSpun || false);
                setSelectedReward(state.selectedReward ?? null);
            } catch (e) {
                console.error('Error loading saved state:', e);
            }
        }
    }, [user.username, holiday]);

    const savePurchaseState = (purchased: boolean, spun: boolean, r: HolidayReward | null = null) => {
        setHasPurchased(purchased);
        setHasSpun(spun);
        setSelectedReward(r);
        if (!holiday || typeof window === 'undefined') return;
        try {
            localStorage.setItem(
                `holiday_bundle_${user.username}_${holiday.name}`,
                JSON.stringify({
                    hasPurchased: purchased,
                    hasSpun: spun,
                    selectedReward: r,
                    timestamp: Date.now(),
                })
            );
        } catch (_) {}
    };

    const refreshCoinsAfterHolidayPay = async () => {
        const { getUsers } = await import('@/lib/storage');
        const users = await getUsers();
        const u = users.find((x) => x.username === user.username);
        if (u) updateUser({ coins: u.coins });
    };

    // Draw wheel with textures - continuously redraw during spin
    useEffect(() => {
        if (!wheelRef.current || !holiday || rewards.length === 0) return;

        const canvas = wheelRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 400;
        canvas.height = 400;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        const drawWheel = (rotation: number = 0) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw wheel segments with rotation
            const segmentAngle = (Math.PI * 2) / rewards.length;

            rewards.forEach((reward, index) => {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(rotation + index * segmentAngle);

                // Segment background
                const segmentGradient = ctx.createLinearGradient(0, -radius, 0, radius);
                // Color based on 1/1000 chance - lower chance = rarer color
                let colors: string[] = ['#CCCCCC', '#999999']; // Default gray
                if (reward.chance <= 2) {
                    colors = ['#F39C12', '#D68910']; // Gold for ultra rare (1-2/1000)
                } else if (reward.chance <= 5) {
                    colors = ['#9B59B6', '#6C3483']; // Purple for very rare (3-5/1000)
                } else if (reward.chance <= 8) {
                    colors = ['#4A90E2', '#2E5C8A']; // Blue for rare (6-8/1000)
                } else {
                    colors = ['#CCCCCC', '#999999']; // Gray for common (9+/1000)
                }
                segmentGradient.addColorStop(0, colors[0]);
                segmentGradient.addColorStop(1, colors[1]);
                ctx.fillStyle = segmentGradient;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, 0, segmentAngle);
                ctx.closePath();
                ctx.fill();

                // Segment border
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Draw reward name - better text formatting
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Truncate long names
                let displayName = reward.name;
                if (displayName.length > 10) {
                    displayName = displayName.substring(0, 8) + '..';
                }
                ctx.fillText(displayName, 0, -radius / 2 - 8);

                // Draw 1/1000 chance
                ctx.font = '9px Arial';
                ctx.fillText(`${reward.chance}/1000`, 0, -radius / 2 + 10);

                ctx.restore();
            });

            // Draw center circle
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw pointer at top
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - radius - 15);
            ctx.lineTo(centerX - 15, centerY - radius - 5);
            ctx.lineTo(centerX + 15, centerY - radius - 5);
            ctx.closePath();
            ctx.fill();
        };

        // Draw initial wheel
        drawWheel(rotationRef.current);

        // Continuous animation loop to keep wheel updated (only when not spinning)
        let animationId: number;
        const animate = () => {
            if (!isSpinning) {
                drawWheel(rotationRef.current);
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [holiday, rewards, isSpinning]);

    const spinWheel = () => {
        if (isSpinning || !hasPurchased || hasSpun) return;

        setIsSpinning(true);
        const spinDuration = 10000; // 10 seconds
        const startTime = Date.now();
        const startRotation = rotationRef.current;

        // Random reward selection based on 1/1000 chances
        const totalChance = rewards.reduce((sum, reward) => sum + reward.chance, 0);
        let random = Math.random() * totalChance;
        let selectedIndex = 0;
        let cumulativeChance = 0;

        for (let i = 0; i < rewards.length; i++) {
            cumulativeChance += rewards[i].chance;
            if (random <= cumulativeChance) {
                selectedIndex = i;
                break;
            }
        }

        const targetRotation = startRotation + (Math.PI * 2) * 5 + (Math.PI * 2) - (selectedIndex * (Math.PI * 2) / rewards.length) - (Math.PI * 2) / (rewards.length * 2);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);

            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            rotationRef.current = startRotation + (targetRotation - startRotation) * easeOut;

            if (wheelRef.current) {
                const ctx = wheelRef.current.getContext('2d');
                if (ctx) {
                    const canvas = wheelRef.current;
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const radius = Math.min(centerX, centerY) - 20;
                    const segmentAngle = (Math.PI * 2) / rewards.length;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Redraw wheel with rotation
                    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                    gradient.addColorStop(0, '#FFFFFF');
                    gradient.addColorStop(0.5, holiday!.color);
                    gradient.addColorStop(1, '#000000');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.fill();

                    rewards.forEach((reward, index) => {
                        ctx.save();
                        ctx.translate(centerX, centerY);
                        ctx.rotate(rotationRef.current + index * segmentAngle);

                        const segmentGradient = ctx.createLinearGradient(0, -radius, 0, radius);
                        // Color based on percentage - lower chance = rarer color
                        let colors: string[] = ['#CCCCCC', '#999999']; // Default gray
                        if (reward.chance <= 3) {
                            colors = ['#F39C12', '#D68910']; // Gold for very rare (2-3%)
                        } else if (reward.chance <= 6) {
                            colors = ['#9B59B6', '#6C3483']; // Purple for rare (4-6%)
                        } else if (reward.chance <= 9) {
                            colors = ['#4A90E2', '#2E5C8A']; // Blue for uncommon (7-9%)
                        } else {
                            colors = ['#CCCCCC', '#999999']; // Gray for common (10%+)
                        }
                        segmentGradient.addColorStop(0, colors[0]);
                        segmentGradient.addColorStop(1, colors[1]);
                        ctx.fillStyle = segmentGradient;

                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.arc(0, 0, radius, 0, segmentAngle);
                        ctx.closePath();
                        ctx.fill();

                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = 'bold 11px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        // Truncate long names
                        let displayName = reward.name;
                        if (displayName.length > 10) {
                            displayName = displayName.substring(0, 8) + '..';
                        }
                        ctx.fillText(displayName, 0, -radius / 2 - 8);

                        ctx.font = '9px Arial';
                        ctx.fillText(`${reward.chance}/1000`, 0, -radius / 2 + 10);

                        ctx.restore();
                    });

                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    ctx.fillStyle = '#FF0000';
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY - radius - 15);
                    ctx.lineTo(centerX - 15, centerY - radius - 5);
                    ctx.lineTo(centerX + 15, centerY - radius - 5);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                savePurchaseState(true, true, rewards[selectedIndex]);

                // Add reward to user's inventory with themed colors (async)
                (async () => {
                    const reward = rewards[selectedIndex];
                    if (reward.type === 'skin') {
                        const skins = await getSkins();

                    // Get themed colors based on reward
                    let colors = { head: '#FFDBB3', torso: '#4169E1', arm: '#FFDBB3', legs: '#4169E1' };
                    let bodyScale = undefined;
                    let headScale = undefined;

                    if (reward.id.includes('scarecrow')) {
                        colors = { head: '#FF8C00', torso: '#8B4513', arm: '#8B4513', legs: '#654321' };
                        bodyScale = { x: 0.7, y: 0.7, z: 0.7 };
                        headScale = { x: 1.5, y: 1.5, z: 1.5 };
                    } else if (reward.id.includes('ghost')) {
                        colors = { head: '#F5F5F5', torso: '#E0E0E0', arm: '#E0E0E0', legs: '#D0D0D0' };
                        headScale = { x: 1.3, y: 1.3, z: 1.3 };
                    } else if (reward.id.includes('witch')) {
                        colors = { head: '#2C1810', torso: '#4B0082', arm: '#2C1810', legs: '#000000' };
                        bodyScale = { x: 0.8, y: 0.8, z: 0.8 };
                    } else if (reward.id.includes('santa')) {
                        colors = { head: '#FFDBB3', torso: '#FF0000', arm: '#FFDBB3', legs: '#000000' };
                        bodyScale = { x: 1.2, y: 1.2, z: 1.2 }; // Big belly
                    } else if (reward.id.includes('snowman')) {
                        colors = { head: '#FFFFFF', torso: '#FFFFFF', arm: '#FFFFFF', legs: '#FFFFFF' };
                    } else if (reward.id.includes('cupid')) {
                        colors = { head: '#FFDBB3', torso: '#FFB6C1', arm: '#FFDBB3', legs: '#FFB6C1' };
                        bodyScale = { x: 0.6, y: 0.6, z: 0.6 }; // Tiny cupid
                    } else if (reward.id.includes('bunny')) {
                        colors = { head: '#FFFFFF', torso: '#F0F0F0', arm: '#FFFFFF', legs: '#F0F0F0' };
                        headScale = { x: 1.4, y: 1.4, z: 1.4 }; // Big bunny head
                    } else if (reward.id.includes('icecream')) {
                        colors = { head: '#FFB6C1', torso: '#8B4513', arm: '#8B4513', legs: '#8B4513' };
                        headScale = { x: 1.6, y: 1.6, z: 1.6 }; // Giant ice cream head
                    }

                    const newSkin = {
                        id: reward.id,
                        name: reward.name,
                        price: 0,
                        colors: colors,
                        holiday: holiday!.name,
                        img: '',
                        special: true,
                        bodyScale: bodyScale,
                        headScale: headScale
                    };
                    skins.push(newSkin);
                    await saveSkins(skins);
                } else {
                    const accessories = await getAccessories();
                    let accessoryColor = '#FF0000';
                    let accessoryType: 'hat' | 'glasses' | 'wings' | 'backpack' = 'hat';

                    if (reward.id.includes('pumpkin')) {
                        accessoryColor = '#FF8C00'; // Orange
                        accessoryType = 'hat';
                    } else if (reward.id.includes('batwings') || reward.id.includes('wings')) {
                        accessoryColor = '#2C1810'; // Dark brown/black
                        accessoryType = 'wings';
                    } else if (reward.id.includes('antlers')) {
                        accessoryColor = '#8B4513'; // Brown
                        accessoryType = 'hat';
                    }

                    const newAccessory = {
                        id: reward.id,
                        name: reward.name,
                        type: accessoryType,
                        price: 0,
                        color: accessoryColor,
                        holiday: holiday!.name,
                        img: '',
                        special: true
                    };
                    accessories.push(newAccessory);
                    await saveAccessories(accessories);
                }
                })();
            }
        };

        animate();
    };

    const handlePurchase = async () => {
        if (hasPurchased) return;

        // Free bundle for 6767kid
        if (user.username === '6767kid') {
            if (!confirm(`Get Holiday Bundle for FREE?\n8,500 Coins + Wheel Spin!`)) {
                return;
            }

            try {
                const { getUsers, saveUsers } = await import('@/lib/storage');
                const users = await getUsers();
                const userIndex = users.findIndex(u => u.username === user.username);
                if (userIndex !== -1) {
                    users[userIndex].coins = (users[userIndex].coins || 0) + 8500;
                    await saveUsers(users);
                    updateUser({ coins: users[userIndex].coins });
                    savePurchaseState(true, false, null);
                }
            } catch (error) {
                console.error('Error adding free bundle:', error);
                alert('Error processing free bundle. Please try again.');
            }
            return;
        }

        if (!confirm('Buy the holiday bundle (8,500 coins) with card or bank in the next step?')) {
            return;
        }
        setShowStripePay(true);
    };

    if (!holiday) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000
            }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '40px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <h2 style={{ marginBottom: '20px' }}>No Active Holiday Bundle</h2>
                    <p style={{ marginBottom: '20px', color: '#666' }}>
                        Holiday bundles are only available during special months!
                    </p>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#0078d4',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
        }}>
            <div style={{
                position: 'relative',
                backgroundColor: '#1a1a1a',
                padding: '40px',
                borderRadius: '20px',
                maxWidth: '800px',
                width: '90%',
                textAlign: 'center',
                border: `3px solid ${holiday.color}`
            }}>
                <h1 style={{ color: holiday.color, marginBottom: '10px', fontSize: '32px' }}>
                    {holiday.name} Bundle
                </h1>
                <p style={{ color: '#fff', marginBottom: '30px', fontSize: '18px' }}>
                    {user.username === '6767kid' ? (
                        <>FREE • 8,500 Coins • Spin the Wheel for Exclusive Rewards!</>
                    ) : (
                        <>$30 • 8,500 Coins • Spin the Wheel for Exclusive Rewards!</>
                    )}
                </p>

                {!hasPurchased ? (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <canvas
                                ref={wheelRef}
                                width={400}
                                height={400}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    border: `5px solid ${holiday.color}`,
                                    borderRadius: '50%',
                                    backgroundColor: '#000'
                                }}
                            />
                        </div>
                        <button
                            onClick={handlePurchase}
                            style={{
                                padding: '15px 40px',
                                backgroundColor: user.username === '6767kid' ? '#38bdf8' : holiday.color,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                marginBottom: '20px'
                            }}
                        >
                            {user.username === '6767kid' ? 'Get Bundle FREE' : 'Purchase Bundle - $30'}
                        </button>
                        <p style={{ color: '#aaa', fontSize: '14px' }}>
                            Includes 8,500 coins + 1 spin on the wheel for a holiday exclusive reward!
                        </p>
                    </div>
                ) : (
                    <div>
                        {!hasSpun ? (
                            <div>
                                <div style={{ marginBottom: '30px' }}>
                                    <canvas
                                        ref={wheelRef}
                                        width={400}
                                        height={400}
                                        style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            border: `5px solid ${holiday.color}`,
                                            borderRadius: '50%',
                                            backgroundColor: '#000'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={spinWheel}
                                    disabled={isSpinning}
                                    style={{
                                        padding: '15px 40px',
                                        backgroundColor: isSpinning ? '#666' : holiday.color,
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: isSpinning ? 'not-allowed' : 'pointer',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        marginBottom: '20px'
                                    }}
                                >
                                    {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
                                </button>
                            </div>
                        ) : selectedReward ? (
                            <div>
                                <h2 style={{ color: holiday.color, marginBottom: '20px', fontSize: '28px' }}>
                                    🎉 You Won!
                                </h2>
                                <div style={{
                                    backgroundColor: '#2a2a2a',
                                    padding: '30px',
                                    borderRadius: '15px',
                                    marginBottom: '20px',
                                    border: `2px solid ${holiday.color}`
                                }}>
                                    <h3 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px' }}>
                                        {selectedReward.name}
                                    </h3>
                                    <p style={{ color: '#aaa', fontSize: '16px' }}>
                                        {selectedReward.chance}/1000 Chance
                                    </p>
                                    <p style={{ color: '#fff', marginTop: '20px' }}>
                                        Your {selectedReward.type === 'skin' ? 'skin' : 'accessory'} has been added to your inventory!
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: '12px 30px',
                                        backgroundColor: '#0078d4',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                <button
                    onClick={() => { setShowStripePay(false); onClose(); }}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: '#fff',
                        border: '2px solid #fff',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    ✕
                </button>
            </div>
        </div>

        {showStripePay ? (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10001,
                    background: 'rgba(0,0,0,0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                }}
                onClick={() => setShowStripePay(false)}
                onKeyDown={(e) => e.key === 'Escape' && setShowStripePay(false)}
                role="presentation"
            >
                <div
                    style={{
                        maxWidth: 460,
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        borderRadius: 16,
                        padding: 24,
                        background: '#1a1d29',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="holiday-stripe-pay-title"
                >
                    <h3 id="holiday-stripe-pay-title" style={{ margin: '0 0 16px', color: '#f1f5f9', fontSize: '1.25rem' }}>
                        Holiday bundle — complete payment
                    </h3>
                    <EmbeddedStripePay
                        coins={8500}
                        role={user.role}
                        onClose={() => setShowStripePay(false)}
                        onPaid={async () => {
                            setShowStripePay(false);
                            savePurchaseState(true, false, null);
                            await refreshCoinsAfterHolidayPay();
                        }}
                    />
                </div>
            </div>
        ) : null}
        </>
    );
}


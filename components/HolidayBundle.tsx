'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { getSkins, getAccessories, saveSkins, saveAccessories } from '@/lib/storage';
import { getPayPortalCheckoutUrl } from '@/lib/payPortal';

const getCurrentHoliday = () => {
    const month = new Date().getMonth() + 1;
    if (month === 10) return { name: 'Halloween', month: 10, color: '#FF6B00', theme: 'spooky' };
    if (month === 12) return { name: 'Christmas', month: 12, color: '#FF0000', theme: 'festive' };
    if (month === 2) return { name: 'Valentine', month: 2, color: '#FF1493', theme: 'romantic' };
    if (month === 3 || month === 4) return { name: 'Easter', month, color: '#FFD700', theme: 'spring' };
    if (month === 7 || month === 8) return { name: 'Summer', month, color: '#FFA500', theme: 'summer' };
    return null;
};

interface HolidayReward {
    type: 'skin' | 'accessory';
    id: string;
    name: string;
    chance: number;
}

interface HolidayBundleProps {
    user: User;
    onClose: () => void;
}

export default function HolidayBundle({ user, onClose }: HolidayBundleProps) {
    const { updateUser } = useUser();
    const holiday = getCurrentHoliday();
    const wheelRef = useRef<HTMLCanvasElement>(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [reward, setReward] = useState<HolidayReward | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const savePurchaseState = (purchased: boolean, spun: boolean, r: HolidayReward | null) => {
        setHasPurchased(purchased);
        setHasSpun(spun);
        setReward(r);
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem('holidayBundle', JSON.stringify({ purchased, spun, reward: r }));
            } catch (_) {}
        }
    };

    const handlePurchase = () => {
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
                    setHasPurchased(true);
                    savePurchaseState(true, false, null);
                }
            } catch (error) {
                console.error('Error adding free bundle:', error);
                alert('Error processing free bundle. Please try again.');
            }
            return;
        }

        if (!confirm('Open Pixel Place Pay to buy the holiday bundle (8,500 coins)?')) {
            return;
        }
        window.location.href = getPayPortalCheckoutUrl(8500);
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
                    onClick={onClose}
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
    );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { getSkins, getAccessories, saveSkins, saveAccessories } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';
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
                    saveSkins(skins);
                } else {
                    const accessories = getAccessories();
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
                })();            }
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
                    setHasPurchased(true);
                    savePurchaseState(true, false, null);
                }
            } catch (error) {
                console.error('Error adding free bundle:', error);
                alert('Error processing free bundle. Please try again.');
            }
            return;
        }

        try {
            const response = await fetch(apiUrl('/api/checkout'), {                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: 'holiday_bundle',
                    userId: user.username,
                    coins: 8500,
                    bundle: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else if (data.error) {
                // For testing/development, directly add coins if Stripe isn't configured
                if (data.error.includes('not configured')) {
                    const { getUsers, saveUsers } = await import('@/lib/storage');
                    const users = await getUsers();
                    const userIndex = users.findIndex(u => u.username === user.username);
                    if (userIndex !== -1) {
                        users[userIndex].coins = (users[userIndex].coins || 0) + 8500;
                        await saveUsers(users);
                        updateUser({ coins: users[userIndex].coins });
                        setHasPurchased(true);
                        savePurchaseState(true, false, null);
                        alert('Bundle purchased! (Development mode - Stripe not configured)');
                    }
                } else {
                    alert(`Error: ${data.error}`);
                }
            }
        } catch (error: any) {
            console.error('Purchase error:', error);
            // For development, allow direct purchase
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                const { getUsers, saveUsers } = await import('@/lib/storage');
                const users = await getUsers();
                const userIndex = users.findIndex(u => u.username === user.username);
                if (userIndex !== -1 && confirm('Server not available. Add bundle in development mode?')) {
                    users[userIndex].coins = (users[userIndex].coins || 0) + 8500;
                    await saveUsers(users);
                    updateUser({ coins: users[userIndex].coins });
                    setHasPurchased(true);
                    savePurchaseState(true, false, null);
                }
            } else {
                alert('Error processing purchase. Please try again.');
            }
        }
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
                                backgroundColor: user.username === '6767kid' ? '#00aaff' : holiday.color,
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


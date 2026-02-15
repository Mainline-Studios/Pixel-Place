// Script to update safety points for a user
// Run with: node scripts/update-safety-points.js

const fetch = require('node-fetch');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-pixel-place-823b1.cloudfunctions.net';
const USERNAME = '67 kid'; // or '6767kid' if that's the actual username
const SAFETY_POINTS = 20000;

async function updateSafetyPoints() {
  try {
    // First, get current safety points
    const getResponse = await fetch(`${API_URL}/api/safety?username=${encodeURIComponent(USERNAME)}`);
    const currentData = await getResponse.json();
    
    console.log(`Current safety points for ${USERNAME}:`, currentData.safetyPoints || 0);
    
    // Update to 20,000 safety points
    const updateResponse = await fetch(`${API_URL}/api/safety`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: USERNAME,
        action: 'updateSafetyPoints',
        safetyPoints: SAFETY_POINTS
      })
    });
    
    const result = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log(`✅ Successfully updated ${USERNAME} to ${SAFETY_POINTS} Safety Points!`);
      console.log('Result:', result);
    } else {
      console.error('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Failed to update safety points:', error);
  }
}

updateSafetyPoints();

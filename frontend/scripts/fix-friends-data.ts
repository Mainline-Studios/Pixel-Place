/**
 * Script to fix friend data inconsistencies
 * Run this manually to clean up friend data
 */

import { promises as fs } from 'fs';
import path from 'path';
import { User } from '../types';

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function fixFriendsData() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const users: User[] = JSON.parse(data);
    let fixed = 0;

    // Ensure all users have friend arrays
    users.forEach(user => {
      if (!user.friends) user.friends = [];
      if (!user.sentFriendRequests) user.sentFriendRequests = [];
      if (!user.friendRequests) user.friendRequests = [];
    });

    // Fix bidirectional friendships - if A has B as friend, B should have A as friend
    users.forEach(user => {
      user.friends?.forEach((friendUsername: string) => {
        const friend = users.find(u => u.username.toLowerCase() === friendUsername.toLowerCase());
        if (friend && !friend.friends?.some(f => f.toLowerCase() === user.username.toLowerCase())) {
          if (!friend.friends) friend.friends = [];
          friend.friends.push(user.username);
          fixed++;
          console.log(`Fixed: Added ${user.username} to ${friend.username}'s friends list`);
        }
      });
    });

    // Clean up sentFriendRequests - remove users who are already friends
    users.forEach(user => {
      if (user.sentFriendRequests && user.sentFriendRequests.length > 0) {
        const before = user.sentFriendRequests.length;
        user.sentFriendRequests = user.sentFriendRequests.filter((sentUsername: string) => {
          // Remove if already friends
          const isFriend = user.friends?.some(f => f.toLowerCase() === sentUsername.toLowerCase());
          if (isFriend) {
            console.log(`Cleaned: Removed ${sentUsername} from ${user.username}'s sentFriendRequests (already friends)`);
            return false;
          }
          return true;
        });
        if (user.sentFriendRequests.length !== before) fixed++;
      }
    });

    // Write back
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    
    console.log(`\nFixed ${fixed} inconsistencies in friend data`);
    console.log('Friend data has been cleaned up!');
  } catch (error) {
    console.error('Error fixing friend data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  fixFriendsData();
}

export { fixFriendsData };









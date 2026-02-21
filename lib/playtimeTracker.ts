'use client';

import { apiUrl } from '@/lib/apiBaseUrl';

/**
 * Tracks user playtime and updates backend
 */
export class PlaytimeTracker {
  private sessionStartTime: number;
  private lastUpdateTime: number;
  private updateInterval: NodeJS.Timeout | null = null;
  private username: string | null = null;

  constructor() {
    this.sessionStartTime = Date.now();
    this.lastUpdateTime = Date.now();
  }

  startTracking(username: string) {
    this.username = username;
    this.sessionStartTime = Date.now();
    this.lastUpdateTime = Date.now();

    // Update playtime every minute
    this.updateInterval = setInterval(() => {
      this.updatePlaytime();
    }, 60000); // Every minute

    // Also update on page visibility change (when user comes back)
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.updatePlaytime();
        }
      });
    }
  }

  stopTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    // Final update
    this.updatePlaytime();
  }

  private async updatePlaytime() {
    if (!this.username) return;

    const now = Date.now();
    const playtimeDelta = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // Only update if user has been active (not idle)
    if (playtimeDelta < 5 * 60 * 1000) { // Less than 5 minutes
      try {
        const { authenticatedFetch } = await import('@/lib/api');
        await authenticatedFetch(apiUrl('/api/safety'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updatePlaytime',
            playtime: playtimeDelta
          })
        });
      } catch (error) {
        console.warn('Failed to update playtime:', error);
      }
    }
  }

  getSessionPlaytime(): number {
    return Date.now() - this.sessionStartTime;
  }
}

// Global instance
let trackerInstance: PlaytimeTracker | null = null;

export function getPlaytimeTracker(): PlaytimeTracker {
  if (!trackerInstance) {
    trackerInstance = new PlaytimeTracker();
  }
  return trackerInstance;
}

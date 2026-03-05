/**
 * PixelPlace API Wrapper for Game Engines
 * Identity from auth token — never send username from frontend.
 */

import { apiUrl } from './apiBaseUrl';
import { authenticatedFetch } from './api';

export class PixelPlaceAPI {
  private gameId: string;
  private username: string;

  constructor(gameId: string, username: string) {
    this.gameId = gameId;
    this.username = username;
  }

  async connectGame(gameId: string): Promise<{ sessionId: string }> {
    try {
      const response = await authenticatedFetch(apiUrl('/api/games/gym-pump/connect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to game');
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to connect game, running offline:', error);
      // Return a mock session for offline mode
      return {
        sessionId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    }
  }

  /**
   * Send game score to server
   */
  async sendGameScore(gameId: string, data: { power: number; coins: number; level: number; timestamp?: number }): Promise<boolean> {
    try {
      const response = await authenticatedFetch(apiUrl('/api/games/gym-pump/score'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          ...data
        })
      });

      return response.ok;
    } catch (error) {
      console.warn('Failed to send game score, running offline:', error);
      return false;
    }
  }

  /**
   * Get game leaderboard
   */
  async getGameLeaderboard(gameId: string, limit: number = 10): Promise<Array<{ player: string; power: number; coins: number; level: number }>> {
    try {
      const response = await fetch(apiUrl(`/api/games/gym-pump/leaderboard?gameId=${encodeURIComponent(gameId)}&limit=${limit}`));      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch leaderboard, returning empty:', error);
      return [];
    }
  }

  /**
   * Sync game progress
   */
  async syncGameProgress(gameId: string, data: { power: number; coins: number; level: number }): Promise<boolean> {
    try {
      const response = await authenticatedFetch(apiUrl('/api/games/gym-pump/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          ...data
        })
      });

      return response.ok;
    } catch (error) {
      console.warn('Failed to sync game progress, running offline:', error);
      return false;
    }
  }

  /**
   * Get user's saved progress
   */
  async getGameProgress(gameId: string): Promise<{ power: number; coins: number; level: number } | null> {
    try {
      const response = await authenticatedFetch(apiUrl(`/api/games/gym-pump/sync?gameId=${encodeURIComponent(gameId)}`));      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch game progress:', error);
      return null;
    }
  }
}


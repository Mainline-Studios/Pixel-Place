'use client';

import { useState, useEffect } from 'react';
import { User, ServerPlan, GameServer, PublishedGame } from '@/types';
import { getServerPlans, getServers, saveServers, getPublished, getUsers, saveUsers, savePublished, findUser} from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';
import { escapeHTML } from '@/lib/utils';

import { toast } from '@/lib/toast';
interface ServersTabProps {
  user: User;
  editMode: boolean;
}

export default function ServersTab({ user, editMode }: ServersTabProps) {
  const { updateUser } = useUser();
  const [serverPlans] = useState(getServerPlans());
  const [servers, setServers] = useState(getServers());
  const [publishedGames, setPublishedGames] = useState<PublishedGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load published games on mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        const games = await getPublished();
        setPublishedGames(games);
      } catch (error) {
        console.error('Error loading published games:', error);
        // Set empty array on error to prevent infinite loading
        setPublishedGames([]);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  const userServers = servers.filter(s => s.purchasedBy === user.username);
  const availableServers = servers.filter(s => !s.purchased);

  const handlePurchaseServer = async (plan: ServerPlan, gameId?: string) => {
    if (!gameId) {
      toast.info('Please select a game first');
      return;
    }

    const game = publishedGames.find(g => g.ts.toString() === gameId);
    if (!game) {
      toast.info('Game not found');
      return;
    }

    if ((user.coins || 0) < plan.price) {
      toast.error(`You don't have enough coins. Need ${plan.price}, have ${user.coins || 0}`);
      return;
    }

    if (confirm(`Purchase ${plan.name} for ${plan.price} coins?\nThis will host "${game.title}" online.`)) {
      const newServer: GameServer = {
        id: 'server_' + Date.now(),
        name: `${game.title} Server`,
        owner: user.username,
        gameId: gameId,
        status: 'active',
        maxPlayers: plan.maxPlayers,
        currentPlayers: 0,
        price: plan.price,
        purchased: true,
        purchasedBy: user.username,
        purchasedAt: Date.now(),
        region: 'US-East',
        createdAt: Date.now()
      };

      const updatedServers = [...servers, newServer];
      saveServers(updatedServers);
      setServers(updatedServers);

      // Deduct coins
      const users = await getUsers();
      const userIndex = users.findIndex(u => u.username === user.username);
      if (userIndex !== -1) {
        users[userIndex].coins = (users[userIndex].coins || 0) - plan.price;
        users[userIndex].ownedServers = [...(users[userIndex].ownedServers || []), newServer.id];
        await saveUsers(users);
        updateUser({ coins: users[userIndex].coins, ownedServers: users[userIndex].ownedServers });
      }

      // Update game to enable multiplayer
      const games = await getPublished();
      const gameIndex = games.findIndex(g => g.ts.toString() === gameId);
      if (gameIndex !== -1) {
        games[gameIndex].multiplayer = true;
        games[gameIndex].maxPlayers = plan.maxPlayers;
        games[gameIndex].serverId = newServer.id;
        await savePublished(games);
        setPublishedGames(games);
      }

      toast.info(`Server purchased! Your game "${game.title}" is now online.`);
    }
  };

  const handleDeleteServer = (server: GameServer) => {
    if (server.purchasedBy !== user.username && user.role !== 'admin') {
      toast.info('You can only delete your own servers');
      return;
    }

    if (confirm(`Delete server "${server.name}"? This cannot be undone.`)) {
      const updatedServers = servers.filter(s => s.id !== server.id);
      saveServers(updatedServers);
      setServers(updatedServers);
      toast.info('Server deleted.');
    }
  };

  const multiplayerGames = publishedGames.filter(g => g.multiplayer);

  if (loading) {
    return (
      <>
        <h2 className="section-title">Game Servers</h2>
        <div className="ai-box">
          <div className="smalltext">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="section-title">Game Servers</h2>

      {/* Purchase Server Section */}
      <div className="ai-box">
        <div className="ai-label">Purchase Server</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="prop-field-label">Select Game</div>
            <select
              className="prop-input"
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">-- Select a published game --</option>
              {publishedGames.map((game) => (
                <option key={game.ts} value={game.ts.toString()}>
                  {escapeHTML(game.title)} {game.multiplayer ? '(Multiplayer Enabled)' : ''}
                </option>
              ))}
            </select>
            {selectedGame && !multiplayerGames.find(g => g.ts.toString() === selectedGame) && (
              <div className="smalltext" style={{ marginTop: '4px', color: '#ffd76a' }}>
                This game will be enabled for multiplayer when you purchase a server.
              </div>
            )}
          </div>

          {selectedGame && (
            <div>
              <div className="prop-field-label">Server Plans</div>
              <div className="skins-grid" style={{ marginTop: '12px' }}>
                {serverPlans.map((plan) => (
                  <div key={plan.id} className="skin-card">
                    <div className="skin-name">{plan.name}</div>
                    <div className="smalltext" style={{ marginBottom: '8px' }}>
                      {plan.description}
                    </div>
                    <div className="skin-meta">
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Max Players:</strong> {plan.maxPlayers}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Price:</strong> {plan.price} 💠
                      </div>
                      <div>
                        <strong>Features:</strong>
                        <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '11px' }}>
                          {plan.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      className="btn"
                      style={{ width: '100%', marginTop: '8px' }}
                      onClick={() => handlePurchaseServer(plan, selectedGame)}
                      disabled={(user.coins || 0) < plan.price}
                    >
                      Buy for {plan.price} 💠
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Servers */}
      {userServers.length > 0 && (
        <div className="ai-box">
          <div className="ai-label">My Servers</div>
          <div className="skins-grid" style={{ marginTop: '16px' }}>
            {userServers.map((server) => {
              const game = publishedGames.find(g => g.ts.toString() === server.gameId);
              return (
                <div key={server.id} className="skin-card">
                  <div className="skin-name">{escapeHTML(server.name)}</div>
                  <div className="smalltext" style={{ marginBottom: '8px' }}>
                    Game: {game ? escapeHTML(game.title) : 'Unknown'}
                  </div>
                  <div className="skin-meta">
                    <div style={{ marginBottom: '4px' }}>
                      Status: <span style={{ color: server.status === 'active' ? '#4ade80' : '#94a3b8' }}>
                        {server.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      Players: {server.currentPlayers}/{server.maxPlayers}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      Region: {server.region || 'N/A'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <button
                      className="btn"
                      style={{
                        width: '100%',
                        background: server.status === 'active' ? '#1a3a1a' : '#3a1a1a',
                        borderColor: server.status === 'active' ? '#4ade80' : '#666'
                      }}
                      onClick={() => {
                        const updatedServers = servers.map(s =>
                          s.id === server.id
                            ? { ...s, status: (s.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' | 'full' }
                            : s
                        );
                        saveServers(updatedServers);
                        setServers(updatedServers);
                      }}
                    >
                      {server.status === 'active' ? 'Stop Server' : 'Start Server'}
                    </button>
                    <button
                      className="btn"
                      style={{
                        width: '100%',
                        background: '#5a1f1f',
                        borderColor: '#8b2d2d',
                        color: '#ff6b6b'
                      }}
                      onClick={() => handleDeleteServer(server)}
                    >
                      Delete Server
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Servers (for joining) */}
      {availableServers.length > 0 && (
        <div className="ai-box">
          <div className="ai-label">Available Servers</div>
          <div className="smalltext" style={{ marginBottom: '12px' }}>
            These servers are available for purchase
          </div>
          <div className="skins-grid" style={{ marginTop: '16px' }}>
            {availableServers.map((server) => {
              const game = publishedGames.find(g => g.ts.toString() === server.gameId);
              return (
                <div key={server.id} className="skin-card">
                  <div className="skin-name">{escapeHTML(server.name)}</div>
                  <div className="smalltext" style={{ marginBottom: '8px' }}>
                    Game: {game ? escapeHTML(game.title) : 'Unknown'}
                  </div>
                  <div className="skin-meta">
                    <div>Max Players: {server.maxPlayers}</div>
                    <div>Price: {server.price} 💠</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {userServers.length === 0 && availableServers.length === 0 && (
        <div className="ai-box">
          <div className="ai-label">No Servers</div>
          <div className="smalltext">
            Purchase a server above to host your games online for multiplayer.
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { TwitchAPI } from '../../utils/api-handler';

export default function TestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const twitch = new TwitchAPI(
          process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
          process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET
        );

        // Get top games
        const topGamesResponse = await twitch.getTopGames(10);
        
        // Get streams for each game
        const gamesWithStreams = await Promise.all(
          topGamesResponse.data.map(async (game) => {
            const streams = await twitch.getStreamsByGame(game.id);
            const totalViewers = streams.data.reduce((sum, stream) => sum + stream.viewer_count, 0);
            
            return {
              ...game,
              totalViewers,
              streamerCount: streams.data.length,
              topStreamers: streams.data
                .sort((a, b) => b.viewer_count - a.viewer_count)
                .slice(0, 5)
                .map(stream => ({
                  userName: stream.user_name,
                  viewerCount: stream.viewer_count
                }))
            };
          })
        );

        setData({
          games: gamesWithStreams,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading game and streamer data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Top Games on Twitch</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.games.map(game => (
          <div key={game.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{game.name}</h2>
            <div className="space-y-2">
              <p>Total Viewers: {game.totalViewers.toLocaleString()}</p>
              <p>Active Streamers: {game.streamerCount.toLocaleString()}</p>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Top Streamers:</h3>
                <ul className="space-y-1">
                  {game.topStreamers.map((streamer, index) => (
                    <li key={index} className="text-sm">
                      {streamer.userName} - {streamer.viewerCount.toLocaleString()} viewers
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
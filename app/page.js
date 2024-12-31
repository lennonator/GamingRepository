'use client';

import React, { useState, useEffect } from 'react';
import { TwitchAPI } from '../utils/api-handler';

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch...');
        const twitch = new TwitchAPI(
          process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
          process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET
        );

        // Log environment variables (without exposing sensitive data)
        console.log('Environment check:', {
          hasClientId: !!process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
          hasClientSecret: !!process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET
        });

        // Get top games
        const topGamesResponse = await twitch.getTopGames(10);
        console.log('Top games response:', topGamesResponse);
        
        if (!topGamesResponse.data) {
          throw new Error('Invalid response from Twitch API');
        }

        // Get streams for each game
        const gamesWithStreams = await Promise.all(
          topGamesResponse.data.map(async (game) => {
            const streams = await twitch.getStreamsByGame(game.id);
            const totalViewers = streams.data?.reduce((sum, stream) => sum + stream.viewer_count, 0) || 0;
            
            return {
              ...game,
              totalViewers,
              streamerCount: streams.data?.length || 0,
              topStreamers: streams.data
                ?.sort((a, b) => b.viewer_count - a.viewer_count)
                .slice(0, 5)
                .map(stream => ({
                  userName: stream.user_name,
                  viewerCount: stream.viewer_count
                })) || []
            };
          })
        );

        setData({
          games: gamesWithStreams,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Loading Gaming Stats...</h1>
          <p>Fetching latest data from Twitch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Data</h1>
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Top Games on Twitch</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.games?.map(game => (
            <div key={game.id} className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{game.name}</h2>
              <div className="space-y-2">
                <p>Total Viewers: {game.totalViewers?.toLocaleString()}</p>
                <p>Active Streamers: {game.streamerCount?.toLocaleString()}</p>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Top Streamers:</h3>
                  <ul className="space-y-1">
                    {game.topStreamers?.map((streamer, index) => (
                      <li key={index} className="text-sm">
                        {streamer.userName} - {streamer.viewerCount?.toLocaleString()} viewers
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-400">
          Last updated: {new Date(data?.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
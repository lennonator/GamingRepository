'use client';

import React from 'react';

function EnvTestPage() {
  // Create a safe way to display environment variables
  const envVars = {
    clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || 'Not set',
    hasSecret: process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET ? 'Yes' : 'No'
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Test</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>Client ID: {envVars.clientId}</p>
        <p>Has Secret: {envVars.hasSecret}</p>
      </div>
    </div>
  );
}

export default EnvTestPage;
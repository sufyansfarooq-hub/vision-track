'use client';

import { useState, useEffect } from 'react';
import { ensureAuth, getCurrentUserId } from '@/lib/supabase/client';

export default function TestAuthPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testAuth();
  }, []);

  const testAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      await ensureAuth();
      const id = await getCurrentUserId();
      setUserId(id);
    } catch (err) {
      console.error('Auth test error:', err);
      setError(err instanceof Error ? err.message : 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-white">Auth Test</h1>

        {loading && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <p className="text-white">Testing authentication...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 p-6 rounded-xl">
            <p className="text-red-200 font-bold">Error:</p>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {userId && (
          <div className="bg-green-500/20 border border-green-500 p-6 rounded-xl">
            <p className="text-green-200 font-bold mb-2">✅ Authentication Working!</p>
            <p className="text-green-200 text-sm">User ID: {userId}</p>
          </div>
        )}

        <button
          onClick={testAuth}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          Test Again
        </button>
      </div>
    </div>
  );
}

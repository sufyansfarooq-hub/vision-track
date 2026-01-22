'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestStoragePage() {
  const [result, setResult] = useState('');

  const testStorage = async () => {
    try {
      setResult('Testing...');
      
      // List buckets
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        setResult('Error: ' + error.message);
        return;
      }
      
      setResult('Buckets found: ' + JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Error: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-white">Test Storage</h1>
        
        <button
          onClick={testStorage}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Test Storage Connection
        </button>
        
        <pre className="bg-gray-800 p-4 rounded text-white text-sm overflow-auto">
          {result}
        </pre>
      </div>
    </div>
  );
}

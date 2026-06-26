'use client';

import React, { useEffect, useState } from 'react';

export default function TestEnvVarsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/test-env')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => setData({ error: err.message }));
  }, []);

  return (
    <div className="p-8 bg-zinc-900 text-white min-h-screen font-mono">
      <h1 className="text-xl font-bold mb-4">Server Environment Diagnostics</h1>
      {data ? (
        <pre className="bg-black p-4 rounded border border-zinc-700 whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabaseConfigured } from './lib/supabase';

export default function App() {
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // The existing admin experience is preserved while the migration is staged.
    // Its legacy script uses direct DOM operations and therefore runs in an isolated document.
    const frame = document.getElementById('legacy-admin') as HTMLIFrameElement | null;
    if (frame) frame.src = '/legacy.html';
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950">
      {!supabaseConfigured && (
        <div className="absolute right-3 top-3 z-50 max-w-sm rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 shadow-lg">
          <div className="font-semibold">Supabase setup needed</div>
          <p className="mt-1">Copy <code>.env.example</code> to <code>.env</code> and add your Supabase project URL and anon/publishable key.</p>
          <button className="mt-2 rounded bg-amber-900 px-3 py-1 text-white" onClick={() => setShowSetup(!showSetup)}> {showSetup ? 'Hide' : 'Setup details'} </button>
          {showSetup && <p className="mt-2">Restart <code>npm run dev</code> after editing the environment file. Never put a service-role key in frontend code.</p>}
        </div>
      )}
      <iframe id="legacy-admin" title="BDR Pharma Zone Command Center" className="h-full w-full border-0" />
    </main>
  );
}

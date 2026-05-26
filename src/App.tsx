import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Setup } from './components/Setup';
import { clearSheetUrl, getSheetUrl } from './lib/storage';

function App() {
  const [configured, setConfigured] = useState(() => !!getSheetUrl());

  if (!configured) {
    return <Setup onComplete={() => setConfigured(true)} />;
  }

  return (
    <Dashboard
      onReset={() => {
        clearSheetUrl();
        setConfigured(false);
      }}
    />
  );
}

export default App;

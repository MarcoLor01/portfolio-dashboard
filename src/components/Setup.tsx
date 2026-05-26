import { useState } from 'react';
import { Link2, ExternalLink } from 'lucide-react';
import { isValidGoogleSheetUrl, saveSheetUrl } from '../lib/storage';

const STEPS = [
  'Apri il Google Sheet con le tue transazioni',
  'Menu File → Condividi → Pubblica sul web',
  'Seleziona il foglio e scegli il formato "Valori separati da virgola (.csv)"',
  'Clicca Pubblica e copia il link generato',
];

interface Props {
  onComplete: () => void;
}

export function Setup({ onComplete }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = url.trim();

    if (!isValidGoogleSheetUrl(trimmed)) {
      setError(
        'URL non valido. Deve essere un link Google Sheets pubblicato in formato CSV ' +
          '(deve contenere docs.google.com/spreadsheets/... e output=csv).',
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(trimmed);
      if (!res.ok) throw new Error(`Il server ha risposto con codice ${res.status}.`);
      const text = await res.text();
      // Basic sanity check: a CSV should have commas and newlines
      if (!text.includes(',') || !text.includes('\n')) {
        throw new Error('Il contenuto ricevuto non sembra un file CSV valido.');
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? `Impossibile raggiungere il foglio: ${e.message}`
          : 'Errore sconosciuto durante la verifica.',
      );
      setLoading(false);
      return;
    }

    saveSheetUrl(trimmed);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Portfolio Viewer</h1>
          <p className="text-zinc-500 mt-2 text-sm">Connetti il tuo Google Sheet per iniziare</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          {/* Steps */}
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">
              Come ottenere il link CSV
            </p>
            <ol className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 text-[11px] flex items-center justify-center font-semibold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <a
              href="https://support.google.com/docs/answer/183965"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              <ExternalLink size={11} />
              Guida ufficiale Google
            </a>
          </div>

          <div className="border-t border-zinc-800" />

          {/* URL input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
              URL del foglio (CSV)
            </label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
              <input
                type="url"
                value={url}
                onChange={e => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()}
                placeholder="https://docs.google.com/spreadsheets/d/e/…"
                spellCheck={false}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-3 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            {error && (
              <p className="text-rose-400 text-xs leading-relaxed">{error}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!url.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
            )}
            {loading ? 'Verifica in corso…' : 'Connetti e carica dati'}
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-zinc-700 mt-4 leading-relaxed px-4">
          Il link viene salvato solo su questo browser (localStorage). Non viene mai inviato a server
          esterni né incluso nel codice sorgente pubblicato.
        </p>
      </div>
    </div>
  );
}

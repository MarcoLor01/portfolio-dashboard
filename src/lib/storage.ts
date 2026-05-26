const KEY = 'pv_sheet_url';

// try/catch: private browsing may restrict localStorage access
export function getSheetUrl(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveSheetUrl(url: string): void {
  localStorage.setItem(KEY, url);
}

export function clearSheetUrl(): void {
  localStorage.removeItem(KEY);
}

// Only accept published Google Sheets CSV URLs — prevents storing arbitrary URLs
export function isValidGoogleSheetUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return (
      u.hostname === 'docs.google.com' &&
      u.pathname.includes('/spreadsheets/') &&
      u.searchParams.get('output') === 'csv'
    );
  } catch {
    return false;
  }
}

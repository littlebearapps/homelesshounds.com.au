const API = 'https://api.raisely.com/v3';

const KEY = import.meta.env.RAISELY_API_KEY!;
const CAMPAIGN_UUID = import.meta.env.RAISELY_CAMPAIGN_UUID!;
const PROFILE_UUID = import.meta.env.RAISELY_CAMPAIGN_PROFILE_UUID!;

function authHeaders() {
  return {
    Authorization: `Bearer ${KEY}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch the campaign profile (often includes summary/meta usable for display).
 * We use the UUID you provided.
 */
export async function getCampaignProfile(): Promise<any> {
  const res = await fetch(`${API}/campaigns/${CAMPAIGN_UUID}/profile`, {
    headers: authHeaders(),
    // Avoid caching on hosts that default to caching fetch
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Raisely /campaigns/{id}/profile ${res.status}`);
  const json = await res.json();
  return json?.data;
}

/**
 * Get recent donations. Adjust filters or limit as needed.
 */
export async function getRecentDonations(limit = 5): Promise<any[]> {
  const url = new URL(`${API}/donations`);
  url.searchParams.set('limit', String(limit));
  // Optionally tie to campaign/profile if required by your data model.
  // Many installs infer campaign from the API key; if not, uncomment the next lines.
  // url.searchParams.set('campaign', CAMPAIGN_UUID);
  // url.searchParams.set('profile', PROFILE_UUID);
  // Common filters: status=PAID, order=-createdAt
  url.searchParams.set('order', '-createdAt');

  const res = await fetch(url.toString(), { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`Raisely /donations ${res.status}`);
  const json = await res.json();
  return json?.data ?? [];
}

/**
 * Attempt to derive totals from the profile; fallback gracefully if fields absent.
 * Different Raisely setups expose totals/goals differently; we keep this defensive.
 */
export async function getTotals(): Promise<{ totalRaised?: number; goalAmount?: number }> {
  const profile = await getCampaignProfile();

  // Try common shapes; fallback to undefined if not present
  const totalRaised =
    profile?.totals?.amount ??
    profile?.totalRaised?.amount ??
    profile?.summary?.totalRaised ??
    undefined;

  const goalAmount =
    profile?.goal?.amount ??
    profile?.summary?.goal ??
    undefined;

  return {
    totalRaised: typeof totalRaised === 'number' ? totalRaised : undefined,
    goalAmount: typeof goalAmount === 'number' ? goalAmount : undefined,
  };
}
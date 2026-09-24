/**
 * Minimal in-process cache for the read-heavy "get competition details"
 * lookup. A competition details page is read far more often than it is
 * written (thousands of viewers per registrant), so shaving repeated
 * document reads under load is worthwhile even with a short TTL.
 *
 * This keeps the demo self-contained (no extra infrastructure required to
 * run it), but a real multi-instance deployment would swap this for Redis
 * so the cache is shared across app servers and invalidation is consistent
 * cluster-wide instead of per-process. See README > "What I'd improve".
 */
const store = new Map();
const TTL_MS = 5000;

function getCompetitionCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

function setCompetitionCache(key, value) {
  store.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

function invalidateCompetitionCache(key) {
  store.delete(key);
}

module.exports = { getCompetitionCache, setCompetitionCache, invalidateCompetitionCache };

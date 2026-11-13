const KEY = 'saltline.campaign.v1';
export const EPISODES = [
  ['m01', '평범한 하루'], ['m02', '통제 불능'], ['m03', '반란'],
  ['m04', '무너지는 전선'], ['m05', '안전한 곳은 없다'], ['m06', '탈출']
];

export function loadCampaignProgress(storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage?.getItem(KEY) || 'null');
    if (data?.version === 1 && Array.isArray(data.completed) && Array.isArray(data.flags)) {
      return { version: 1, completed: data.completed.filter(id => EPISODES.some(([key]) => key === id)), flags: data.flags.filter(flag => typeof flag === 'string') };
    }
  } catch { /* A fresh campaign remains playable if storage is unavailable or damaged. */ }
  return { version: 1, completed: [], flags: [] };
}

export function recordMissionComplete(id, flags = [], storage = globalThis.localStorage) {
  const progress = loadCampaignProgress(storage);
  if (EPISODES.some(([key]) => key === id) && !progress.completed.includes(id)) progress.completed.push(id);
  for (const flag of flags) if (typeof flag === 'string' && !progress.flags.includes(flag)) progress.flags.push(flag);
  try { storage?.setItem(KEY, JSON.stringify(progress)); } catch { /* The result screen remains usable without persistent storage. */ }
  return progress;
}

export function isEpisodeUnlocked(index, progress) {
  return index === 0 || progress.completed.includes(EPISODES[index - 1]?.[0]);
}

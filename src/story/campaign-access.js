import { EPISODES, isEpisodeUnlocked, loadCampaignProgress } from './campaign-progress.js';

const DEVELOPER_KEY = 'saltline.developer-mode.v1';

export function lastAccessibleEpisode(progress) {
  let last = 0;
  for (let i = 1; i < EPISODES.length; i++) if (isEpisodeUnlocked(i, progress)) last = i;
  return EPISODES[last][0];
}

// Resolve access before a map is constructed, including direct map URLs.
// Unrelated stories and the showcase options retain their normal behaviour.
export function campaignAccess(params, stories, storage = null) {
  const result = { ...params };
  const originalStory = result.story;
  const numericStory = /^(?:m)?(\d+)$/i.exec(String(originalStory || ''));
  if (numericStory) {
    const canonical = `m${String(Number(numericStory[1])).padStart(2, '0')}`;
    if (EPISODES.some(([id]) => id === canonical)) result.story = canonical;
  }
  let developerMode = false;
  try { developerMode = storage?.getItem(DEVELOPER_KEY) === 'enabled'; } catch { /* Treat inaccessible storage as locked. */ }
  const progress = loadCampaignProgress(storage);
  // Old prototype links should open a playable episode after its removal.
  if (result.story === 'harbormaster' || result.map === 'harbor') {
    result.story = lastAccessibleEpisode(progress);
    delete result.map;
    return { params: result, redirected: true, changed: true, removedOperation: true };
  }
  const candidates = [result.story];
  if (result.map) candidates.push(stories.find(story => story.mapId === result.map)?.id);
  const futureEpisode = numericStory && Number(numericStory[1]) > EPISODES.length;
  const blocked = !developerMode && (futureEpisode || candidates.some(id => {
    const index = EPISODES.findIndex(([episode]) => episode === id);
    return index >= 0 && !isEpisodeUnlocked(index, progress);
  }));
  if (blocked) {
    result.story = lastAccessibleEpisode(progress);
    delete result.map;
  }
  return { params: result, redirected: blocked, changed: blocked || result.story !== originalStory };
}

export function browserCampaignStorage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

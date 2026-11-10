/** Definitions contain data and factories; runtime state lives on the game context. */
export function createContentRegistry({
  maps,
  stories,
  defaultStoryId
}) {
  const index = (entries, kind) => {
    const result = new Map();
    for (const entry of entries) {
      if (!entry.id || result.has(entry.id)) throw new Error(`Invalid or duplicate ${kind} id: ${entry.id}`);
      result.set(entry.id, entry);
    }
    return result;
  };
  const mapIndex = index(maps, 'map');
  const storyIndex = index(stories, 'story');
  for (const map of maps) {
    for (const key of ['createLevel', 'createBackdrop', 'createGround']) {
      if (typeof map[key] !== 'function') throw new Error(`Map ${map.id} requires ${key}`);
    }
    const nav = map.world?.navigation;
    if (!nav || ![nav.minX, nav.maxX, nav.minZ, nav.maxZ, nav.cellSize].every(Number.isFinite) || nav.cellSize <= 0 || nav.maxX <= nav.minX || nav.maxZ <= nav.minZ) {
      throw new Error(`Map ${map.id} requires valid navigation bounds`);
    }
  }
  for (const story of stories) {
    if (!mapIndex.has(story.mapId)) throw new Error(`Story ${story.id} references unknown map: ${story.mapId}`);
    if (typeof story.createMission !== 'function') throw new Error(`Story ${story.id} requires createMission`);
  }
  if (!storyIndex.has(defaultStoryId)) throw new Error(`Unknown default story: ${defaultStoryId}`);
  return {
    listMaps: () => [...mapIndex.values()],
    listStories: () => [...storyIndex.values()],
    resolve({
      story: storyId,
      map: mapId
    } = {}) {
      if (mapId && !mapIndex.has(mapId)) throw new Error(`Unknown map: ${mapId}`);
      const story = storyId ? storyIndex.get(storyId) : mapId ? stories.find(entry => entry.mapId === mapId) : storyIndex.get(defaultStoryId);
      if (!story) throw new Error(`Unknown story or no story for map: ${storyId || mapId}`);
      if (mapId && story.mapId !== mapId) throw new Error(`Story ${story.id} does not support map ${mapId}`);
      return {
        story,
        map: mapIndex.get(story.mapId)
      };
    }
  };
}

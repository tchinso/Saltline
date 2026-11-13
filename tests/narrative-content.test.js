import test from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../src/content/index.js';
import { EPISODES } from '../src/story/campaign-progress.js';

const text = lines => lines.join(' ');
test('every episode has playable context, stage dialogue and choice-aware results', () => {
  for (const [id] of EPISODES) {
    const { story } = content.resolve({ story: id });
    const narrative = story.narrative;
    assert.ok(narrative?.briefing?.length >= 2, `${id} briefing`);
    assert.ok(narrative?.debrief?.length >= 2, `${id} result`);
    for (const objective of story.objectives.filter(item => !item.optional)) {
      assert.ok(narrative.stageCues?.[objective.id]?.length, `${id} ${objective.id} dialogue`);
    }
    for (const choice of story.objectives.filter(item => item.optional)) {
      const result = narrative.choiceRecaps?.[choice.flag];
      assert.ok(result?.completed && result?.missed && result.completed !== result.missed, `${id} ${choice.id} result`);
    }
  }
});

test('key campaign turns preserve the story’s cause and consequence', () => {
  const get = id => content.resolve({ story: id }).story.narrative;
  assert.match(text(get('m03').debrief), /피난민/);
  assert.match(text(get('m03').debrief), /군용 차량/);
  assert.match(text(get('m18').debrief), /헌터/);
  assert.match(text(get('m18').debrief), /파괴되지 않/);
  assert.match(text(get('m25').debrief), /한꺼번에 꺼지지/);
  assert.match(text(get('m26').debrief), /수동.*승인/);
});

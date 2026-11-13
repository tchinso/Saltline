import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRadioLine } from '../src/ui/hud.js';

test('radio captions identify one speaker without misattributing a multi-speaker line', () => {
  assert.deepEqual(parseRadioLine('연우: 앞으로 이동해.'), { speaker: '연우', body: '앞으로 이동해.' });
  assert.deepEqual(parseRadioLine('방송: 위험하다. 재훈: 알겠습니다.'), { speaker: '무전', body: '방송: 위험하다. 재훈: 알겠습니다.' });
  assert.deepEqual(parseRadioLine('접근하는 적을 제압하라'), { speaker: '관제소', body: '접근하는 적을 제압하라' });
});

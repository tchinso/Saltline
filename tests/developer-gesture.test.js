import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeveloperGesture } from '../src/ui/developer-gesture.js';

test('developer gesture completes only after six consecutive setting toggles', () => {
  const gesture = createDeveloperGesture();
  for (let i = 0; i < 5; i++) assert.equal(gesture.toggle(), false);
  assert.equal(gesture.toggle(), true);
  for (let i = 0; i < 3; i++) assert.equal(gesture.toggle(), false);
  gesture.reset();
  for (let i = 0; i < 5; i++) assert.equal(gesture.toggle(), false);
  assert.equal(gesture.toggle(), true);
});

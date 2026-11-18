import assert from 'node:assert/strict';
import { test } from 'node:test';
import { textStreamResponse } from '../src/utils/textStreamResponse.ts';

test('streams plain UTF-8 text and preserves whitespace after the first content', async () => {
  async function* chunks() {
    yield '  ';
    yield '\n hello';
    yield ' ';
    yield '世界';
  }
  const response = textStreamResponse(chunks(), () => {});
  assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(await response.text(), 'hello 世界');
});

test('cancelling the response aborts the provider and closes the iterator', async () => {
  let aborted = false;
  let closed = false;
  async function* chunks() {
    try {
      yield 'first';
      yield 'second';
    } finally {
      closed = true;
    }
  }
  const reader = textStreamResponse(chunks(), () => { aborted = true; }).body.getReader();
  assert.equal(new TextDecoder().decode((await reader.read()).value), 'first');
  await reader.cancel();
  assert.equal(aborted, true);
  assert.equal(closed, true);
});

test('an upstream stream error reaches the response reader', async () => {
  async function* chunks() {
    yield 'first';
    throw new Error('provider stream failed');
  }
  const response = textStreamResponse(chunks(), () => {});
  await assert.rejects(response.text(), /provider stream failed/);
});

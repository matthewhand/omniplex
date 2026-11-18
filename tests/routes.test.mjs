import assert from 'node:assert/strict';
import { test } from 'node:test';

const baseURL = process.env.OMNIPLEX_TEST_URL || 'http://127.0.0.1:3000';

test('a shared chat URL includes that chat in its preview metadata', async () => {
  const response = await fetch(new URL('/chat/metadata-fixture', baseURL));
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<meta[^>]+property="og:image"[^>]+content="https:\/\/omniplex\.ai\/api\/og\?id=metadata-fixture"/);
});

test('the homepage renders and the dictionary route validates missing input', async () => {
  const home = await fetch(new URL('/', baseURL));
  assert.equal(home.status, 200);
  assert.ok((await home.text()).includes('<title>Omniplex</title>'));
  const response = await fetch(new URL('/api/dictionary', baseURL));
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Word is required' });
});

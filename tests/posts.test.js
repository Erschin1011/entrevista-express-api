const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

const app = require('../src/app')

let server
let baseUrl

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('health endpoint returns ok', async () => {
  const response = await fetch(`${baseUrl}/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
})

test('posts endpoint supports create, read, update, delete and validation', async () => {
  const invalid = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: '', body: '' }),
  })
  assert.equal(invalid.status, 422)

  const created = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Interview prep', body: 'Build an API' }),
  })
  assert.equal(created.status, 201)
  const { data: post } = await created.json()

  const found = await fetch(`${baseUrl}/api/posts/${post.id}`)
  assert.equal((await found.json()).data.title, 'Interview prep')

  const updated = await fetch(`${baseUrl}/api/posts/${post.id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'CRUD ready' }),
  })
  assert.equal((await updated.json()).data.title, 'CRUD ready')

  const deleted = await fetch(`${baseUrl}/api/posts/${post.id}`, { method: 'DELETE' })
  assert.equal(deleted.status, 204)

  const missing = await fetch(`${baseUrl}/api/posts/${post.id}`)
  assert.equal(missing.status, 404)
})

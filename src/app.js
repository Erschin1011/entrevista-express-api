const express = require('express')
const { ZodError, z } = require('zod')

const app = express()
app.use(express.json())

let nextId = 1
let posts = []

const postInput = z.object({
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(5000),
})

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/posts', (_request, response) => {
  response.json({ data: posts })
})

app.post('/api/posts', (request, response, next) => {
  try {
    const input = postInput.parse(request.body)
    const post = { id: nextId++, ...input, createdAt: new Date().toISOString() }
    posts.push(post)
    return response.status(201).json({ data: post })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/posts/:id', (request, response) => {
  const post = posts.find((item) => item.id === Number(request.params.id))
  if (!post) return response.status(404).json({ message: 'Post not found' })
  return response.json({ data: post })
})

app.patch('/api/posts/:id', (request, response, next) => {
  try {
    const post = posts.find((item) => item.id === Number(request.params.id))
    if (!post) return response.status(404).json({ message: 'Post not found' })

    const input = postInput.partial().parse(request.body)
    Object.assign(post, input, { updatedAt: new Date().toISOString() })
    return response.json({ data: post })
  } catch (error) {
    return next(error)
  }
})

app.delete('/api/posts/:id', (request, response) => {
  const index = posts.findIndex((item) => item.id === Number(request.params.id))
  if (index === -1) return response.status(404).json({ message: 'Post not found' })
  posts.splice(index, 1)
  return response.status(204).end()
})

app.use((error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(422).json({ message: 'Validation failed', errors: error.issues })
  }

  console.error(error)
  return response.status(500).json({ message: 'Internal server error' })
})

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' })
})

module.exports = app

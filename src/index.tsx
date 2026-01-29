import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// API routes
app.use('/api/*', cors())

app.get('/api/hello', (c) => {
  return c.json({ message: 'AutoAnalyzer API', status: 'ok' })
})

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main page
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoAnalyzer - AI UI/UX 분석</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold text-center text-indigo-900 mb-8">
      🚀 AutoAnalyzer
    </h1>
    <p class="text-center text-xl text-gray-700 mb-12">
      AI 기반 UI/UX 자동 분석 시스템
    </p>
    <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 class="text-2xl font-bold mb-4">웹사이트 분석</h2>
      <div class="mb-4">
        <input 
          type="url" 
          id="url" 
          placeholder="https://example.go.kr"
          class="w-full px-4 py-3 border rounded-lg"
        />
      </div>
      <button 
        id="analyze"
        class="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
      >
        분석하기
      </button>
      <div id="result" class="mt-6 hidden"></div>
    </div>
  </div>
  <script src="/static/app.js"></script>
</body>
</html>`)
})

export default app

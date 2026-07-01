/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'

console.log('[Vite Config] loaded')

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// ─── OSS 上传代理（绕过浏览器 CORS） ─────────────────────

function ossUploadProxy() {
  return {
    name: 'oss-upload-proxy',
    configureServer(server: any) {
      // 这个 middleware 必须在 /api/mineru proxy 之前执行
      server.middlewares.use('/api/mineru/upload-to-oss', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.writeHead(405).end('Method Not Allowed')
          return
        }

        // 从 query 读取 OSS URL
        const reqUrl = new URL(req.url!, `http://${req.headers.host}`)
        const fileUrl = reqUrl.searchParams.get('url')
        if (!fileUrl) {
          res.writeHead(400, { 'Content-Type': 'text/plain' }).end('missing url param')
          return
        }

        // 安全校验：只允许 mineru OSS host
        const ossHost = new URL(fileUrl).host
        if (!ossHost.endsWith('.aliyuncs.com')) {
          console.error('[MinerU OSS Proxy] rejected host:', ossHost)
          res.writeHead(403, { 'Content-Type': 'text/plain' }).end('forbidden host')
          return
        }

        // 读取请求体（二进制文件）
        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk))
        }
        const body = Buffer.concat(chunks)

        console.log(`[MinerU OSS Proxy] upload start (${(body.length / 1024).toFixed(1)}KB → ${ossHost})`)

        try {
          const ossRes = await fetch(fileUrl, {
            method: 'PUT',
            body,
          })

          const respText = await ossRes.text().catch(() => '')
          console.log(`[MinerU OSS Proxy] oss status: ${ossRes.status} ${ossRes.statusText}`)

          if (ossRes.ok) {
            console.log('[MinerU OSS Proxy] upload done')
            res.writeHead(ossRes.status, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
            }).end(respText || 'OK')
          } else {
            console.log('[MinerU OSS Proxy] upload failed')
            res.writeHead(ossRes.status, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
            }).end(respText || `OSS error: ${ossRes.status}`)
          }
        } catch (err: any) {
          console.error('[MinerU OSS Proxy] error:', err.message)
          res.writeHead(502, { 'Content-Type': 'text/plain' }).end(`OSS proxy error: ${err.message}`)
        }
      })
    },
  }
}

// ─── Markdown 下载代理（绕过 CDN CORS） ────────────────

function markdownProxy() {
  return {
    name: 'markdown-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/mineru-md', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'GET') {
          res.writeHead(405).end('Method Not Allowed')
          return
        }

        const reqUrl = new URL(req.url!, `http://${req.headers.host}`)
        const mdUrl = reqUrl.searchParams.get('url')
        if (!mdUrl) {
          res.writeHead(400, { 'Content-Type': 'text/plain' }).end('missing url param')
          return
        }

        // 安全校验：只允许 MinerU CDN
        let parsed: URL
        try { parsed = new URL(mdUrl) } catch {
          res.writeHead(400, { 'Content-Type': 'text/plain' }).end('invalid url')
          return
        }
        if (parsed.protocol !== 'https:') {
          res.writeHead(403, { 'Content-Type': 'text/plain' }).end('https only')
          return
        }
        if (parsed.hostname !== 'cdn-mineru.openxlab.org.cn') {
          console.error('[MinerU MD Proxy] rejected host:', parsed.hostname)
          res.writeHead(403, { 'Content-Type': 'text/plain' }).end('forbidden host')
          return
        }
        if (!parsed.pathname.endsWith('.md') && !mdUrl.includes('full.md')) {
          console.error('[MinerU MD Proxy] not a .md file:', parsed.pathname)
          res.writeHead(403, { 'Content-Type': 'text/plain' }).end('only .md files allowed')
          return
        }

        const shortPath = `${parsed.hostname}${parsed.pathname.slice(0, 80)}`
        console.log(`[MinerU MD Proxy] download start: ${shortPath}`)

        try {
          const mdRes = await fetch(mdUrl)
          const mdText = await mdRes.text()
          console.log(`[MinerU MD Proxy] status: ${mdRes.status}`)
          console.log(`[MinerU MD Proxy] download done, length=${mdText.length}`)

          if (mdRes.ok) {
            res.writeHead(200, {
              'Content-Type': 'text/markdown; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            }).end(mdText)
          } else {
            res.writeHead(mdRes.status, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
            }).end(mdText || `CDN error: ${mdRes.status}`)
          }
        } catch (err: any) {
          console.error('[MinerU MD Proxy] error:', err.message)
          res.writeHead(502, { 'Content-Type': 'text/plain' }).end(`MD proxy error: ${err.message}`)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  console.log('[Vite Config] mode:', mode)

  const env = loadEnv(mode, process.cwd(), '')
  const mineruToken = env.MINERU_TOKEN
  console.log('[MinerU Proxy] token loaded:', mineruToken ? 'yes' : 'no')

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
      ossUploadProxy(),
      markdownProxy(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    assetsInclude: ['**/*.svg', '**/*.csv'],

    server: {
      proxy: {
        '/api/mineru': {
          target: 'https://mineru.net',
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/api\/mineru/, ''),
          configure: (proxy: any) => {
            console.log('[MinerU Proxy] configure called')

            proxy.on('proxyReq', (proxyReq: any, req: any) => {
              if (req.url?.includes('/upload-to-oss')) return // 不会到这里，安全兜底
              if (mineruToken) {
                proxyReq.setHeader('Authorization', `Bearer ${mineruToken}`)
              }
              console.log('[MinerU Proxy] proxyReq:', req.method, req.url)
              console.log('[MinerU Proxy] upstream path:', proxyReq.path)
              console.log('[MinerU Proxy] auth:', mineruToken ? 'injected' : 'missing')
            })

            proxy.on('proxyRes', (proxyRes: any, req: any) => {
              console.log('[MinerU Proxy] proxyRes:', req.method, req.url, proxyRes.statusCode, proxyRes.headers['content-type'])
            })

            proxy.on('error', (err: any, req: any) => {
              console.error('[MinerU Proxy] error:', {
                method: req?.method,
                url: req?.url,
                code: (err as any).code,
                message: err.message,
              })
            })
          },
        },
      },
    },

    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.ts',
      exclude: ['e2e/**', 'node_modules/**'],
    },
  }
})

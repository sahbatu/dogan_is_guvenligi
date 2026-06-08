import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Prerenderer from '@prerenderer/prerenderer'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const staticDir = path.join(root, 'dist')

function getRoutes(): string[] {
  const file = path.join(root, 'prerender-routes.json')
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file, 'utf8')) as string[]
  }
  return ['/', '/hakkimizda', '/e-katalog', '/blog', '/iletisim']
}

async function main() {
  const routes = getRoutes()
  console.log(`Prerendering ${routes.length} routes...`)

  const prerenderer = new Prerenderer({
    staticDir,
    renderer: new PuppeteerRenderer({
      renderAfterTime: 2500,
      headless: true,
    }),
  })

  await prerenderer.initialize()
  const rendered = await prerenderer.renderRoutes(routes)
  await prerenderer.destroy()

  console.log(`Prerendered ${rendered.length} pages.`)
}

main().catch((err) => {
  console.error('Prerender failed:', err)
  process.exit(1)
})

import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')
const manifestPath = path.join(root, 'src', 'generated', 'image-variants.json')

type ImageRule = {
  match: RegExp
  maxWidth: number
  webpQuality: number
  variants: number[]
  losslessWebp?: boolean
}

const rules: ImageRule[] = [
  {
    match: /logo\.png$/i,
    maxWidth: 520,
    webpQuality: 95,
    variants: [200, 320],
    losslessWebp: true,
  },
  { match: /favicon\.png$/i, maxWidth: 64, webpQuality: 90, variants: [32, 64] },
  { match: /hero-|banner-/i, maxWidth: 1200, webpQuality: 84, variants: [400, 480, 640, 720, 960] },
  {
    match: /service-|stats-|cta-|about-/i,
    maxWidth: 1000,
    webpQuality: 84,
    variants: [320, 400, 480, 640, 720],
  },
  { match: /products\//i, maxWidth: 800, webpQuality: 84, variants: [320, 400, 600, 800] },
]

const defaultRule: ImageRule = {
  match: /.*/,
  maxWidth: 1000,
  webpQuality: 84,
  variants: [400, 480, 640, 720],
}

const manifest: Record<string, { widths: number[]; fullWidth: number }> = {}

function pickRule(filePath: string): ImageRule {
  return rules.find((rule) => rule.match.test(filePath)) ?? defaultRule
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    if (/\.(jpe?g|png)$/i.test(entry.name)) return [full]
    return []
  })
}

function removeVariantFiles(filePath: string): void {
  const dir = path.dirname(filePath)
  const stem = path.basename(filePath).replace(/\.(jpe?g|png)$/i, '')
  for (const entry of readdirSync(dir)) {
    if (entry === `${stem}.webp` || (entry.startsWith(`${stem}-`) && entry.endsWith('w.webp'))) {
      unlinkSync(path.join(dir, entry))
    }
  }
}

async function writeWebp(
  pipeline: sharp.Sharp,
  outPath: string,
  quality: number,
  lossless: boolean,
): Promise<void> {
  if (lossless) {
    await pipeline.webp({ lossless: true, effort: 4 }).toFile(outPath)
    return
  }
  await pipeline.webp({ quality, effort: 4, smartSubsample: true }).toFile(outPath)
}

async function optimizeFile(filePath: string): Promise<void> {
  const rel = path.relative(publicDir, filePath).replace(/\\/g, '/')
  const publicSrc = `/${rel}`
  const { maxWidth, webpQuality, variants, losslessWebp } = pickRule(rel)
  const sourceBytes = statSync(filePath).size
  const meta = await sharp(filePath).metadata()
  const sourceWidth = meta.width ?? maxWidth
  const targetWidth = Math.min(sourceWidth, maxWidth)
  const createdWidths: number[] = []

  removeVariantFiles(filePath)

  const base = sharp(filePath).rotate()
  const webpPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp')

  await writeWebp(
    base.clone().resize({ width: targetWidth, withoutEnlargement: true }),
    webpPath,
    webpQuality,
    !!losslessWebp,
  )

  for (const variantWidth of variants) {
    if (variantWidth >= targetWidth) continue
    const variantPath = filePath.replace(/\.(jpe?g|png)$/i, `-${variantWidth}w.webp`)
    await writeWebp(
      base.clone().resize({ width: variantWidth, withoutEnlargement: true }),
      variantPath,
      webpQuality,
      !!losslessWebp,
    )
    createdWidths.push(variantWidth)
  }

  manifest[publicSrc] = { widths: createdWidths.sort((a, b) => a - b), fullWidth: targetWidth }

  const webpSize = statSync(webpPath).size
  console.log(
    `  ${rel} → webp ${Math.round(webpSize / 1024)} KiB, variants [${createdWidths.join(', ')}]w (kaynak ${Math.round(sourceBytes / 1024)} KiB)`,
  )
}

async function main() {
  const files = walk(publicDir)
  if (!files.length) {
    console.log('No images found in public/.')
    return
  }

  console.log(`Generating WebP variants for ${files.length} images...`)
  for (const file of files) {
    await optimizeFile(file)
  }

  mkdirSync(path.dirname(manifestPath), { recursive: true })
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Wrote variant manifest → src/generated/image-variants.json`)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

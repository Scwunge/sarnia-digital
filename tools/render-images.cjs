// Renders site/img/og.jpg (the 1200x630 share card, from tools/og.html) and
// site/img/apple-touch-icon.png (180x180). Needs Playwright:
//   NODE_PATH=<a folder with playwright installed> node tools/render-images.cjs
const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const ROOT = path.resolve(__dirname, '..')
const sprite = fs.readFileSync(path.join(ROOT, 'site/img/flags.svg'), 'utf8').replace('<svg ', '<svg style="display:none" ')

;(async () => {
  const browser = await chromium.launch()

  const og = path.join(__dirname, '.og-render.html')
  fs.writeFileSync(og, fs.readFileSync(path.join(__dirname, 'og.html'), 'utf8').replace('<!--SPRITE-->', sprite))
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  await page.goto('file:///' + og.replace(/\\/g, '/'))
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(ROOT, 'site/img/og.jpg'), type: 'jpeg', quality: 88 })
  fs.unlinkSync(og)

  // The home-screen icon: the Sierra flag (S, for Sarnia) on a navy tile, like the favicon.
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 } })
  await icon.setContent(`<body style="margin:0">${fs.readFileSync(path.join(ROOT, 'site/img/favicon.svg'), 'utf8').replace('<svg ', '<svg width="180" height="180" ')}</body>`)
  await icon.screenshot({ path: path.join(ROOT, 'site/img/apple-touch-icon.png'), omitBackground: false })

  await browser.close()
  console.log('rendered og.jpg and apple-touch-icon.png')
})()

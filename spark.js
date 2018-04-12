const koa = require('koa')
const route = require('koa-route')
const {dirname} = require('path')
const fs = require('mz/fs')
const fetch = require('./api')
const createSvg = require('./svg')

const app = new koa()

const processing = new Map()
const state = {
  remaining: 5000,
}

async function render(path, owner, name) {
  processing.set(path, 0)

  const res = await fetch(owner, name, 100)

  if (res) {
    let {totalCount, edges: dates, hasNextPage, endCursor} = res

    while (hasNextPage) {
      const percent = Math.round(100 * dates.length / totalCount)
      processing.set(path, percent)
      console.log(`${owner}/${name}: ${percent}%`)

      const res = await fetch(owner, name, 100, endCursor)

      hasNextPage = res.hasNextPage
      endCursor = res.endCursor
      state.remaining = res.remaining

      dates = dates.concat(res.edges)
    }

    dates = dates.map(({starredAt}) => +(new Date(starredAt)))
    const svg = createSvg(dates)

    const dir = dirname(path)
    await fs.exists(dir) || await fs.mkdir(dir)

    fs.writeFile(path, svg)
  }

  processing.delete(path)
}

app.use(route.get('/:owner/:name.svg', async (ctx, owner, name) => {
  ctx.type = 'image/svg+xml; charset=utf-8'
  let path = `svg/${owner}/${name}.svg`

  let stats
  try {
    stats = await fs.stat(path)
    ctx.set('Last-Modified', stats.mtime.toUTCString())
    ctx.body = fs.createReadStream(path)

    const now = new Date().getTime()
    const mtime = stats.mtime.getTime()
    if (now - mtime > 86400000) {
      render(path, owner, name)
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      if (!processing.has(path)) {
        render(path, owner, name)
      }
      const percent = processing.get(path)
      ctx.body = createSvg.text(`⚡️ creating ${percent}%`)
    } else {
      ctx.body = createSvg.text(`⚠️ error️`)
    }
  }
}))

app.use(route.get('/status', async (ctx) => {
  ctx.type = 'application/json'
  ctx.body = {
    processing: processing.size,
    rateLimit: state.remaining
  }
}))

app.listen(3000)
console.log('App started on port 3000')
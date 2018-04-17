require('dotenv').config()
const koa = require('koa')
const route = require('koa-route')
const serve = require('koa-static')
const fs = require('mz/fs')
const {createTextSvg} = require('./svg')
const {total, rateLimit} = require('./render')
const queue = require('./queue')
const page = require('./page')
const ttl = require('./ttl')

const app = new koa()
queue.worker()
app.use(serve('public'));

app.use(route.get('/:owner/:name.svg', async (ctx, owner, name) => {
  ctx.type = 'image/svg+xml; charset=utf-8'

  const repo = `${owner}/${name}`
  const path = `svg/${owner}/${name}.svg`.toLowerCase()

  let stats
  try {
    const maxAge = ttl(repo)
    stats = await fs.stat(path)

    ctx.set('Last-Modified', stats.mtime.toUTCString())
    ctx.set('Cache-Control', 'max-age=' + maxAge)
    ctx.body = fs.createReadStream(path)

    const now = new Date().getTime()
    const mtime = stats.mtime.getTime()

    if (now - mtime > maxAge * 1000) {
      queue.push(path, owner, name)
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      queue.push(path, owner, name)

      const p = total.get(path)
      if (p) {
        ctx.body = createTextSvg(`⚡️ loading stars ${p}%`)
      } else {
        ctx.body = createTextSvg(`👋️ waiting in queue ${queue.indexOf(path) + 1}`)
      }
    } else {
      ctx.body = createTextSvg(`⚠️ error`)
    }
  }
}))

app.use(route.get('/', async (ctx) => {
  if (ctx.query.repo) {
    ctx.redirect('/' + ctx.query.repo)
  } else {
    ctx.type = 'text/html'
    ctx.body = page.index()
  }
}))

app.use(route.get('/:owner/:name', async (ctx, owner, name) => {
  ctx.type = 'text/html'
  ctx.body = page.repo({owner, name})
}))

app.use(route.get('/status', async (ctx) => {
  ctx.type = 'application/json'
  ctx.body = {
    queueSize: queue.size(),
    processing: [...total.keys()],
    rateLimit: rateLimit.remaining
  }
}))

const port = process.env.PORT || 3000
app.listen(port)
console.log('App started on port ' + port)

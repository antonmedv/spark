require('dotenv').config()
const koa = require('koa')
const route = require('koa-route')
const fs = require('mz/fs')
const {createTextSvg} = require('./svg')
const {percent} = require('./render')
const api = require('./api')
const queue = require('./queue')

const app = new koa()
queue.worker()

app.use(route.get('/:owner/:name.svg', async (ctx, owner, name) => {
  ctx.type = 'image/svg+xml; charset=utf-8'
  let path = `svg/${owner}/${name}.svg`

  let stats
  try {
    stats = await fs.stat(path)
    ctx.set('Last-Modified', stats.mtime.toUTCString())
    ctx.set('Cache-Control', 'max-age=86400')

    ctx.body = fs.createReadStream(path)

    const now = new Date().getTime()
    const mtime = stats.mtime.getTime()

    if (now - mtime > 86400000) {
      queue.push(path, owner, name)
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      queue.push(path, owner, name)

      const p = percent.get(path)
      if (p) {
        ctx.body = createTextSvg(`⚡️ loading stars ${p}%`)
      } else {
        ctx.body = createTextSvg(`👋️ waining in queue ${queue.indexOf(path) + 1}`)
      }
    } else {
      ctx.body = createTextSvg(`⚠️ error️`)
    }
  }
}))

app.use(route.get('/status', async (ctx) => {
  ctx.type = 'application/json'
  ctx.body = {
    queueSize: queue.size(),
    rateLimit: api.rateLimit.remaining
  }
}))

const port = process.env.PORT || 3000
app.listen(port)
console.log('App started on port ' + port)

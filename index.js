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
    ctx.body = fs.createReadStream(path)

    const now = new Date().getTime()
    const mtime = stats.mtime.getTime()

    if (now - mtime > 86400000) {
      queue.push(path, owner, name)
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      queue.push(path, owner, name)
      ctx.body = createTextSvg(`⚡️ loading stars ${percent.get(path) || 0}%`)
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

app.listen(3000)
console.log('App started on port 3000')

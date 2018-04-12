const koa = require('koa')
const route = require('koa-route')
const createSvg = require('./svg')

const app = new koa()

app.use(route.get('/:owner/:name.svg', async (ctx, owner, name) => {
  ctx.type = 'image/svg+xml; charset=utf-8'
  ctx.body = createSvg([1,2,3,4,24,24,324,24,4,4,6,4,3,])
}))

app.listen(3000)
console.log('App started on port 3000')
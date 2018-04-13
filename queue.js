const {render} = require('./render')
const delay = require('delay')

const queue = []
const set = new Set()

function size() {
  return queue.length
}

async function worker() {
  do {
    try {
      const work = queue.shift()
      if (work) {
        const [path, owner, name] = work

        await render(path, owner, name)

        set.delete(path)
      } else {
        await delay(100)
      }
    } catch (err) {
      console.error(err)
    }
  } while (true)
}

function push(path, owner, name) {
  if (!set.has(path)) {
    queue.push([path, owner, name])
    set.add(path)
  }
}

function indexOf(path) {
  return queue.findIndex(([p]) => path === p)
}

module.exports = {worker, push, size, indexOf}

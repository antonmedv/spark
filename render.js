const {dirname} = require('path')
const fs = require('mz/fs')
const {fetch} = require('./api')
const {createSvg} = require('./svg')

const total = new Map()

const query = `
  query($owner: String!, $name: String!, $endCursor: String) {
    repository(owner: $owner, name: $name) {
      stargazers(first: 100, after: $endCursor) {
        totalCount
        edges {
          starredAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    rateLimit {
      remaining
    }  
  }
`

let rateLimit = {
  remaining: 5000
}

async function render(path, owner, name) {
  total.set(path, 0)

  const data = await fetch(query, {owner, name})

  if (data.repository) {
    let {
      stargazers: {
        totalCount,
        edges: dates,
        pageInfo: {hasNextPage, endCursor}
      }
    } = data.repository

    while (hasNextPage) {
      total.set(path, Math.round(100 * dates.length / totalCount))
      console.log(`${owner}/${name}: ${total.get(path)}%`)

      const data = await fetch(query, {owner, name, endCursor})

      hasNextPage = data.repository.stargazers.pageInfo.hasNextPage
      endCursor = data.repository.stargazers.pageInfo.endCursor
      rateLimit.remaining = data.rateLimit.remaining

      dates = dates.concat(data.repository.stargazers.edges)
    }

    dates = dates.map(({starredAt}) => +(new Date(starredAt)))

    const svg = createSvg(dates)

    const dir = dirname(path)
    await fs.exists(dir) || await fs.mkdir(dir)

    fs.writeFile(path, svg)
  }

  total.delete(path)
}

module.exports = {render, total, rateLimit}

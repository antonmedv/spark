const {dirname} = require('path')
const fs = require('mz/fs')
const {fetch} = require('./api')
const {createSvg} = require('./svg')

const total = new Map()

let rateLimit = {
  remaining: 5000
}

async function render(path, owner, name) {
  total.set(path, 0)
  
  const dates = []
  let page
  do {
    page = await fetchStargazerDates({owner, name, endCursor: page?.endCursor})
    {
     
      totalCount: data.stargazers.totalCount,
      pageInfo:   data.stargazers.pageInfo,
    }
    if(page){
      const pageStargazersDates = data.stargazers.edges.map(({starredAt}) => +(new Date(starredAt))),
      
      total.set(path, Math.round(100 * pageStargazersDates.length / page.stargazers.totalCount))
      console.log(`${owner}/${name}: ${total.get(path)}%`)

      stargazerDates = stargazerDates.concat(pageStargazersDates)
    }
  } while (page?.hasNextPage)
 
  if (dates.length) {
    const svg = createSvg(dates)

    const dir = dirname(path)
    await fs.exists(dir) || await fs.mkdir(dir)

    fs.writeFile(path, svg)
  }

  total.delete(path)
}

async function fetchStargazerDates(params) {
  const data = owner === 'gist' ?
        await fetchGistStargazerDates(params) :
        await fetchRepositoryStargazerDates(params)  
  rateLimit.remaining = data.rateLimit.remaining
  return data
}

async function fetchGistStargazerDates(params) {
  const data = await fetch(`query($name: String!, $endCursor: String) {
    viewer {
      gist(name: $name) {
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
    }
    rateLimit {
      remaining
    }
  }`, params)
  rateLimit.remaining = data.rateLimit.remaining
  return {
    stargazers: data.viewer.gist.stargazers,
    rateLimit: data.rateLimit,
  }
}

async function fetchRepositoryStargazerDates(owner, params) {
  const data = await fetch(`query($owner: String!, $name: String!, $endCursor: String) {
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
  }`, params)
  rateLimit.remaining = data.rateLimit.remaining
  return {
    stargazers: data.repository.stargazers,
    rateLimit: data.rateLimit,
  }
}

module.exports = {render, total, rateLimit}

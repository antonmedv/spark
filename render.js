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
  let datesPage
  do {
    datesPage = await fetchStargazerDates({owner, name, endCursor: datesPage?.endCursor})
    if(datesPage){
      
      total.set(path, Math.round(100 * datesPage.stargazers.edges.length / datesPage.stargazers.totalCount))
      console.log(`${owner}/${name}: ${total.get(path)}%`)

      stargazerDates = stargazerDates.concat(datesPage.stargazers.edges)
    }
  } while (datesPage?.hasNextPage)
 
  if (dates.length) {
    dates = dates.map(({starredAt}) => +(new Date(starredAt))),
    const svg = createSvg(dates)

    const dir = dirname(path)
    await fs.exists(dir) || await fs.mkdir(dir)

    fs.writeFile(path, svg)
  }

  total.delete(path)
}

async function fetchStargazerDates(params) {
  const data = params.owner.startsWith('gist:') ?
        await fetchGistStargazerDates({...params, owner: params.owner.replace(/gist:/,'')}) :
        await fetchRepositoryStargazerDates(params)  
  rateLimit.remaining = data.rateLimit.remaining
  return data
}

async function fetchGistStargazerDates(params) {
  const data = await fetch(`query($owner: String!, $name: String!, $endCursor: String) {
    user (login: $owner) {
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
  const data = await fetch(`query($user: String!, $name: String!, $endCursor: String) {
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

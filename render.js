const {dirname} = require('path')
const fs = require('mz/fs')
const {fetch} = require('./api')
const {createSvg} = require('./svg')

const total = new Map()

async function render(path, owner, name) {
  total.set(path, 0)

  try {
    let dates = await fetchStargazerDates({owner, name}, (progress) => {
      total.set(path, Math.round(100 * progress.currentCount / progress.totalCount))
      console.log(`${owner}/${name}: ${total.get(path)}%`)
    })

    if (dates.length) {
      const svg = createSvg(dates)
      const dir = dirname(path)
      await fs.exists(dir) || await fs.mkdir(dir, {recursive: true})

      fs.writeFile(path, svg)
    }
  } finally {
    total.delete(path)
  }
}

async function fetchStargazerDates(params, onProgress) {
  let dates = []
  let pageInfo
  do {
    const page = await fetchStargazerDatesPage()
    if (page) {
      dates = dates.concat(page.edges.map(({starredAt}) => new Date(starredAt)))
      pageInfo = page.pageInfo

      onProgress({
        totalCount: page.totalCount,
        currentCount: dates.length,
      })
    }
  } while (pageInfo?.hasNextPage)

  return dates

  function fetchStargazerDatesPage() {
    const stargazerConnectionFragment = `
      fragment stargazerConnection on StargazerConnection {
        totalCount
        edges {
          starredAt
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    `

    if (params.owner.startsWith('gist:')) {
      return fetch(stargazerConnectionFragment + '\n' + `
        query($owner: String!, $name: String!, $endCursor: String) {
          user(login: $owner) { 
            gist(name: $name) {
              stargazers(first: 100, after: $endCursor) {
                ...stargazerConnection
        } } } }`, {
        owner: params.owner.replace(/^gist:/, ''),
        name: params.name,
        endCursor: pageInfo?.endCursor,
      }).then(data => data?.user?.gist?.stargazers)
    }

    return fetch(stargazerConnectionFragment + '\n' + `
      query($owner: String!, $name: String!, $endCursor: String) {
        repository(owner: $owner, name: $name) {
          stargazers(first: 100, after: $endCursor) {
            ...stargazerConnection
      } } }`, {
      owner: params.owner,
      name: params.name,
      endCursor: pageInfo?.endCursor,
    }).then(data => data?.repository?.stargazers)
  }
}

module.exports = {render, total}

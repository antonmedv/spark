require('dotenv').config()
const fs = require('mz/fs')
const {fetch} = require('./api')

const query = `
  query ($endCursor: String) {
    search(type: REPOSITORY, query: "stars:>8000", first: 100, after: $endCursor) {
      repositoryCount
      nodes {
        ... on Repository {
          owner {
            login
          }
          name
          stargazers {
            totalCount
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

async function main() {
  let {
    search: {
      repositoryCount,
      nodes,
      pageInfo: {hasNextPage, endCursor}
    }
  } = await fetch(query)

  while (hasNextPage) {
    const pt = Math.round(100 * nodes.length / repositoryCount)
    console.log(`loading ${pt}%  ${nodes.length}/${repositoryCount}`)

    const data = await fetch(query, {endCursor})

    endCursor = data.search.pageInfo.endCursor
    hasNextPage = data.search.pageInfo.hasNextPage
    nodes = nodes.concat(data.search.nodes)
  }

  console.log('Total repos: ' + nodes.length)

  const db = {}

  for (let node of nodes) {
    const {
      owner: {login},
      name,
      stargazers: {totalCount}
    } = node

    db[login + '/' + name] = totalCount
  }

  fs.writeFile('db.js', `module.exports = ${JSON.stringify(db, null, 2)}\n`)
}

main().catch(console.log)

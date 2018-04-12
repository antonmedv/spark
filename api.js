const r2 = require('r2')

const token = '82581a5f62af2960acf9b9c437dbed630034b4e9'
const headers = {
  Authorization: `bearer ${token}`
}

const query = `
query($owner: String!, $name: String!, $first: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    stargazers(first: $first, after: $after) {
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

async function fetch(owner, name, first, after = null) {
  const res = await r2.post('https://api.github.com/graphql', {
    headers, json: {
      query,
      variables: {
        owner,
        name,
        first,
        after
      }
    }
  }).json

  const {
    data: {
      repository,
      rateLimit: {remaining}
    }
  } = res

  if (!repository) {
    return null
  }

  const {
    stargazers: {
      totalCount,
      edges,
      pageInfo: {hasNextPage, endCursor}
    }
  } = repository

  return {totalCount, edges, hasNextPage, endCursor, remaining}
}

module.exports = fetch

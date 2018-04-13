const delay = require('delay')
const r2 = require('r2')

const token = process.env.ACCESS_TOKEN
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

let rateLimit = {
  remaining: 5000
}

async function fetch(owner, name, first, after = null) {
  let data
  do {
    try {

      const response = await r2.post('https://api.github.com/graphql', {
        headers, json: {
          query,
          variables: {
            owner,
            name,
            first,
            after
          }
        }
      }).response

      if (response.headers.has('Retry-After')) {
        const retryAfter = parseInt(response.headers.get('Retry-After'))
        console.log('Retry-After', retryAfter)

        await delay(retryAfter * 1000)

        continue
      }

      const json = await response.json()

      if (json.data) {
        data = json.data
        rateLimit.remaining = data.rateLimit.remaining
      } else {
        console.log(json) // Usually it's API rate limit exceeded
        await delay(60 * 1000)
      }

    } catch (err) {
      console.log(err)
      await delay(1000)
    }
  } while (!data)

  return data
}

module.exports = {fetch, rateLimit}

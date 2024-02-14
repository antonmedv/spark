const delay = require('delay')
const nodeFetch = require('node-fetch')

const token = process.env.ACCESS_TOKEN
const headers = {
  Authorization: `bearer ${token}`
}

let rateLimit = {
  limit: 0,
  remaining: 0,
  used: 0,
  reset: 0,
}

async function fetch(query, variables) {
  const response = await nodeFetch('https://api.github.com/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query, variables
    }),
    headers,
  })

  Object.assign(rateLimit, {
    // x-ratelimit-limit	The maximum number of points that you can use per ho
    limit: response.headers.get('x-ratelimit-limit'),
    //  x-ratelimit-remaining	The number of points remaining in the current rate limit window
    remaining: response.headers.get('x-ratelimit-remaining'),
    // x-ratelimit-used	The number of points you have used in the current rate limit window
    used: response.headers.get('x-ratelimit-used'),
    // x-ratelimit-reset	The time at which the current rate limit window resets, in UTC epoch seconds
    reset: new Date(response.headers.get('x-ratelimit-reset') * 1000),
  })

  const json = await response.json()

  if (response.status === 200 && !json.errors) {
    return json.data
  }

  if(json.errors[0].type === 'NOT_FOUND') {
    return null
  }

  if (response.headers.has('Retry-After')) {
    const retryAfter = parseInt(response.headers.get('Retry-After'))
    await delay(retryAfter * 1000)
    return fetch(query, variables)
  }

  throw new Error('GitHub API error. ' + JSON.stringify(json.errors))
}

module.exports = {fetch, rateLimit}

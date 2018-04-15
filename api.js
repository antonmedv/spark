const delay = require('delay')
const r2 = require('r2')

const token = process.env.ACCESS_TOKEN
const headers = {
  Authorization: `bearer ${token}`
}

async function fetch(query, variables) {
  let data
  do {
    try {

      const response = await r2.post('https://api.github.com/graphql', {
        headers,
        json: {query, variables}
      }).response

      const json = await response.json()

      if (json.data) {
        data = json.data
      } else {

        if (json.message) {
          process.stderr.write(json.message + '\n')
        } else {
          process.stderr.write(JSON.stringify(json) + '\n')
        }

        if (response.headers.has('Retry-After')) {
          const retryAfter = parseInt(response.headers.get('Retry-After'))
          await delay(retryAfter * 1000)
        } else {
          await delay(60 * 1000)
        }

      }

    } catch (err) {
      process.stderr.write(JSON.stringify(json) + '\n')
      await delay(5 * 1000)
    }
  } while (!data)

  return data
}

module.exports = {fetch}

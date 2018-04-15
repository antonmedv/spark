const db = require('./db')

function ttl(repo) {
  const stars = db[repo] || 0

  if (stars > 10000) {
    return 604800 // one week
  } else if (stars > 8000) {
    return 3 * 86400 // three days
  } else {
    return 86400 // one day
  }
}

module.exports = ttl

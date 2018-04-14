# ⚡️ Spark <img src="https://stars.medv.io/deployphp/deployer.svg" align="right"/>

Go to [stars.medv.io](https://stars.medv.io)

Spark is generator of pretty little graphs called sparklines, which shows GitHub stars velocity of a repo.

## Development

Clone repo, create _.env_ file with [personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/):
```
ACCESS_TOKEN=...
```

Install packages, start server:
```
npm install
node index.js
```

## Rate limit

Spark can't eagerly load all stars of a repo, only 100 stargazers per requset allowed, and GitHub API v4 has rate limit of 5000 points per hour. 

Spark has special endpoint for monitoring remaining rate limit, queue size and processing svg: [stars.medv.io/status](https://stars.medv.io/status)

## License

MIT

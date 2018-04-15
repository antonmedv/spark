const style = require('fs').readFileSync('style.css')
const rand = () => Math.round(100 * Math.random())

const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>⚡️ GitHub Stars Sparklines</title>
  <meta name="description" content="⚡️ Spark is GitHub stars graph generator, it plots tiny little graph called sparkline, which reflects the growth rate of stars on GitHub thought history.">
  <meta name="viewport" content="width=device-width, user-scalable=yes">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
  <style>
    ${style}
  </style>
  <style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-72806543-2"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'UA-72806543-2');
  </script>
</head>
<body>
  <a href="https://github.com/antonmedv/spark" class="github-corner" aria-label="View source on Github">
    <svg width="80" height="80" viewBox="0 0 250 250" style="fill:#70B7FD; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>
  </a>
  <div class="content">
    ${content}
  </div>
  <div class="r">
    <div class="r1" style="${`top: ${rand()}vh; left: ${rand()}vw`}"></div>
    <div class="r2" style="${`top: ${rand()}vh; left: ${rand()}vw`}"></div>
    <div class="r3" style="${`top: ${rand()}vh; left: ${rand()}vw`}"></div>
    <div class="r4" style="${`top: ${rand()}vh; left: ${rand()}vw`}"></div>
  </div>
</body>
</html>
`

const box = (owner, name) => {
  let title = owner + '/' + name
  if (title.length > 20) {
    title = name
  }
  return `
    <div class="box">
      <div class="name">${title}</div>
      <img class="spark" src="/${owner + '/' + name}.svg"/>
    </div>
  `
}

const a = (path) => {
  const [owner, name] = path.split('/')
  return `
    <a href="/${owner + '/' + name}">
      ${box(owner, name)}
    </a>  
  `
}

const h1 = () => `<a href="/"><h1>⚡️ Spark <span>GitHub Stars Sparklines</span></h1></a>`

exports.index = () => layout(`
${h1()}
<div class="grid">
  ${a('facebook/react')}
  ${a('angular/angular')}
  ${a('vuejs/vue')}
  ${a('freeCodeCamp/freeCodeCamp')}
  ${a('jquery/jquery')}
  ${a('twbs/bootstrap')}
  ${a('rails/rails')}
  ${a('FortAwesome/Font-Awesome')}
  ${a('jashkenas/backbone')}
  ${a('php/php-src')}
  ${a('nodejs/node')}
  ${a('torvalds/linux')}
  ${a('moby/moby')}
  ${a('laravel/laravel')}
  ${a('reactjs/redux')}
  ${a('d3/d3')}
  ${a('axios/axios')}
  ${a('robbyrussell/oh-my-zsh')}
  ${a('facebook/react-native')}
  ${a('meteor/meteor')}
</div>
`)


exports.repo = ({owner, name}) => layout(`
${h1()}
<div class="one">      
  ${box(owner, name)}
  <code>[![Sparkline](https://stars.medv.io/${owner + '/' + name}.svg)](https://stars.medv.io/${owner + '/' + name})</code>
</div>
`)

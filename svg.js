const height = 30
const x0 = 5
const y0 = 40
const steps = 40
const dx = 5
const basis = 1.5
const gradient = ['#3023AE', '#C86DD7']
// ['#ef32d9', '#89fffd']
// ['#462cff', '#f084ff']

const round = num => Math.round(num * 100) / 100
const vec = (x, y) => ({
  x, y,
  toString() {
    return `${round(this.x)} ${round(this.y)}`
  }
})
const norm = v => Math.sqrt(v.x * v.x + v.y * v.y)
const unit = v => {
  const n = norm(v)
  return vec(basis * v.x / n, basis * v.y / n)
}
const add = (a, b) => vec(a.x + b.x, a.y + b.y)
const sub = (a, b) => vec(a.x - b.x, a.y - b.y)
const end = px => px[px.length - 1]

function createSvg(data) {
  const min = data[0]
  const max = end[data]
  const step = (max - min) / steps

  const yx = []
  {
    let i = min
    let count = 0
    for (let d of data) {
      if (d < i + step) {
        count++
      } else {
        yx.push(count)
        count = 1
        i += step
      }
    }
  }

  const scale = Math.max(...yx) / height
  {
    for (let i = 0; i < yx.length; i++) {
      yx[i] = round(yx[i] / scale)
    }
  }

  const points = []
  {
    let x = x0
    for (let y of yx) {
      x += dx
      points.push(vec(x, y0 - y))
    }
  }

  const p0 = vec(x0, y0)
  const p1 = points[0]
  const p2 = points[1]
  const c1 = add(p0, unit(sub(p1, p0)))
  const c2 = add(p1, unit(sub(p0, p2)))
  let path = `M${p0} C ${c1}, ${c2}, ${p1}`

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const p2 = points[i + 1] || p1
    const c = add(p1, unit(sub(p0, p2)))
    path += ` S ${c}, ${p1}`
  }

  const pN = end(points)

  return `<svg width="200" height="50" viewBox="0 0 210 50" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="a">
            <stop stop-color="${gradient[0]}" offset="0%"/>
            <stop stop-color="${gradient[1]}" offset="100%"/>
        </linearGradient>
    </defs>
    <path stroke="url(#a)"
          stroke-width="3"
          stroke-linejoin="round"
          stroke-linecap="round"
          d="${path}"
          fill="none"/>
    <circle r="4" cx="${p0.x}" cy="${p0.y}" fill="${gradient[0]}"/>
    <circle r="4" cx="${pN.x}" cy="${pN.y}" fill="${gradient[1]}"/>      
</svg>`
}

module.exports = createSvg

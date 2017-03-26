class MoldPiece {
  constructor (options) {
    this.center = options.center
    this.radius = options.radius
    this.degrees = {
      start: 0,
      end: 360 / 16 * 3
    }

    this.circles = options.circles
  }

  onOuterCircle (degrees) {
    const { outer } = this.radius
    return pointOnCircle(this.center, outer, degrees)
  }

  onInnerCircle (degrees) {
    const { inner } = this.radius
    return pointOnCircle(this.center, inner, degrees)
  }

  path () {
    const { start, end } = this.degrees
    const { inner, outer } = this.radius

    const outerStart = this.circles.outer.point(start)
    const outerEnd = this.circles.outer.point(end)
    const innerStart = this.circles.inner.point(start)
    const innerEnd = this.circles.inner.point(end)

    let path = ''

    // point on outer circle
    path += `M${outerStart.x},${outerStart.y} `

    // arc on outer circle
    path += `A ${outer},${outer},0 0 1 ${outerEnd.x},${outerEnd.y} `

    // line toward inner circle
    path += `L ${innerEnd.x},${innerEnd.y} `

    // arc back on inner circle
    path += `A ${inner},${inner},1 0 0 ${innerStart.x},${innerStart.y} `

    // line to start point on outer circle
    path += `L ${outerStart.x},${outerStart.y} Z`

    return path
  }
}

export default MoldPiece

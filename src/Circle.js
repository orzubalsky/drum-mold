import { pointOnCircle } from './utils.js'

class Circle {
  constructor (options) {
    this.center = options.center
    this.radius = options.radius
  }

  point (degrees) {
    return pointOnCircle(this.center, this.radius, degrees)
  }
}

export default Circle

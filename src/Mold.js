import * as fs from 'fs'
import Circle from './Circle.js'
import { val, point, times } from './utils.js'

class Mold {
  constructor (options) {
    this.diameter = val(options.diameter)

    this.thickness = val(options.thickness) || val(2)

    this.radius = {
      outer: this.diameter / 2,
      middle: ((this.diameter - this.thickness / 2) / 2),
      inner: (this.diameter - this.thickness) / 2
    }

    // mold + drum height in inches
    this.moldHeight = val(options.height || 14)

    // document dimensions
    this.width = this.diameter
    this.height = this.diameter
    this.center = point(this.width / 2, this.height / 2)

    // circles
    this.circles = {
      outer: new Circle({
        center: this.center,
        radius: this.radius.outer
      }),
      middle: new Circle({
        center: this.center,
        radius: this.radius.middle
      }),
      inner: new Circle({
        center: this.center,
        radius: this.radius.inner
      })
    }

    this.lines = {
      count: 16,
      angle: 360 / 16
    }

    this.holes = {
      count: 8,
      angle: 360 / 8,
      offset: this.lines.angle * 1.5
    }
  }
}

export default Mold

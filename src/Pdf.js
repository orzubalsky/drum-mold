import * as fs from 'fs'
import PDFDocument from 'pdfkit'
import Circle from './Circle.js'
import MoldPiece from './MoldPiece.js'
import { val, point, times } from './utils.js'

class PDF {
  constructor (options) {
    this.filename = `drum-mold-pattern-${options.diameter}x${options.height}.pdf`

    // drums diameter is actually 1/8 inch less
    this.diameter = val(options.diameter - 1/8)

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

  addPage () {
    this.doc.addPage({
      size: [this.width, this.height]
    })
  }

  start () {
    this.doc = new PDFDocument({
      autoFirstPage: false
    })

    // Pipe its output to a file
    this.doc.pipe(fs.createWriteStream(this.filename))
  }

  end () {
    // Finalize PDF file
    this.doc.end()
  }

  circle (center, r, color) {
    return this.doc
      .circle(center.x, center.y, r)
      .stroke(color)
      .lineWidth(1)
  }

  moldCircle (radius) {
    return this.circle(this.center, radius)
  }

  holeCircle (point, color) {
    const radius = val(0.51 / 2)
    return this.circle(point, radius, color)
  }

  line (startPoint, endPoint, color) {
    return this.doc
      .moveTo(startPoint.x, startPoint.y)
      .lineTo(endPoint.x, endPoint.y)
      .stroke(color)
      .lineWidth(1)
  }

  arc (r, startPoint, endPoint, color) {
    return this.doc
      .path(`M${startPoint.x},${startPoint.y} A ${r},${r},0 0 1 ${endPoint.x},${endPoint.y}`)
      .stroke(color)
  }

  drawLines (color) {
    const { count, angle } = this.lines
    const { outer, inner } = this.circles
    const center = this.center
    const line = this.line.bind(this)
    times(count)(i => {
      const lineAngle = angle * i
      const endPoint = outer.point(lineAngle)
      line(center, endPoint, color)
    })
  }

  drawHoles (color) {
    const { count, angle, offset } = this.holes
    const { middle } = this.circles
    const holeCircle = this.holeCircle.bind(this)

    times(count)(i => {
      const holeAngle = angle * (i + 1) + offset
      const point = middle.point(holeAngle)
      holeCircle(point, color)
    })
  }

  fullPatternPage (color = 'black') {
    const { inner, outer } = this.radius

    this.addPage()

    this.moldCircle(outer, color)
    this.moldCircle(inner, color)
    this.drawLines(color)
    this.drawHoles(color)
  }

  moldPiecePage (color = 'blue') {
    this.addPage()

    const piece = new MoldPiece({
      center: this.center,
      radius: this.radius,
      circles: this.circles
    })

    this.doc.path(piece.path()).stroke(color)

    const holeAngle = 11.25
    const holePoint1 = this.circles.middle.point(holeAngle)
    const holePoint2 = this.circles.middle.point(holeAngle + this.lines.angle * 2)

    this.holeCircle(holePoint1, color)
    this.holeCircle(holePoint2, color)
  }
}

export default PDF

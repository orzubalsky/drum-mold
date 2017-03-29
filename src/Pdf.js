import * as fs from 'fs'
import PDFDocument from 'pdfkit'
import Mold from './Mold.js'
import MoldPiece from './MoldPiece.js'
import { val, point, times } from './utils.js'

class PDF {
  constructor (options) {
    this.filename = `drum-mold-pattern-${options.diameter}x${options.height}.pdf`

    // diameter is 1/8 inch less
    const drumDiameter = options.diameter - 1/8

    // hoop is made out of 4 layers of 1/8 inch strips
    const hoopThickness = 1/2

    // gap between drum shell and hoop so the hoop can move freely
    const hoopGap = 5/8

    // the hoop diameter is the outer layer of the four strips
    const hoopInnerDiameter = drumDiameter + hoopGap + hoopThickness

    // the mold for the buckle strap works so the straps are layered
    // from inner to outer, so the inner diameter doesn't matter but
    // the outer one does
    const hoopBuckleThickness = 4
    const hoopBuckleOuterDiameter = drumDiameter + hoopGap
    const hoopBuckleInnerDiameter = hoopBuckleOuterDiameter - hoopBuckleThickness

    // these pieces are pushed inwards with a buckle strap around
    // the buckle inner mold, so their inner diameter should equal
    // the outer diameter of the hoop
    const bucklePieceDiameter = hoopInnerDiameter

    this.molds = {
      shell: new Mold({
        diameter: options.diameter - 1/8,
        thickness: options.thickness,
        height: options.height,
        color: 'blue'
      }),
      hoop: new Mold({
        diameter: hoopInnerDiameter,
        thickness: options.thickness,
        height: 2,
        color: 'red'
      }),
      hoopBuckleInner: new Mold({
        diameter: hoopBuckleInnerDiameter,
        thickness: hoopBuckleThickness,
        height: 3,
        color: 'green'
      }),
      hoopBuckleOuter: new Mold({
        diameter: bucklePieceDiameter,
        thickness: 2,
        height: 3,
        color: 'purple'
      })
    }

    this.width = this.molds.shell.diameter
    this.height = this.molds.shell.diameter
  }

  addPage (diameter) {
    const width = diameter || this.width

    this.doc.addPage({
      size: [width, width]
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

  drawCircle (center, r, color) {
    return this.doc
      .circle(center.x, center.y, r)
      .stroke(color)
      .lineWidth(1)
  }

  drawHoleCircle (point, color) {
    const radius = val(0.51 / 2)
    return this.drawCircle(point, radius, color)
  }

  drawLine (startPoint, endPoint, color) {
    return this.doc
      .moveTo(startPoint.x, startPoint.y)
      .lineTo(endPoint.x, endPoint.y)
      .stroke(color)
      .lineWidth(1)
  }

  drawArc (r, startPoint, endPoint, color) {
    return this.doc
      .path(`M${startPoint.x},${startPoint.y} A ${r},${r},0 0 1 ${endPoint.x},${endPoint.y}`)
      .stroke(color)
  }

  drawLines (mold, color) {
    const { count, angle } = mold.lines
    const { outer, inner } = mold.circles
    const center = mold.center
    const drawLine = this.drawLine.bind(this)
    times(count)(i => {
      const lineAngle = angle * i
      const endPoint = outer.point(lineAngle)
      drawLine(center, endPoint, color)
    })
  }

  drawHoles (mold, color) {
    const { count, angle, offset } = mold.holes
    const { middle } = mold.circles
    const drawHoleCircle = this.drawHoleCircle.bind(this)

    times(count)(i => {
      const holeAngle = angle * (i + 1) + offset
      const point = middle.point(holeAngle)
      drawHoleCircle(point, color)
    })
  }

  fullPatternPage (mold, color, addPage = true) {
    const { inner, outer } = mold.radius

    addPage && this.addPage(mold.diameter)

    this.drawCircle(mold.center, outer, color)
    this.drawCircle(mold.center, inner, color)
    this.drawLines(mold, color)
    this.drawHoles(mold, color)
  }

  hoopBuckleFullPatternPage () {
    this.fullPatternPage(this.molds.hoopBuckleOuter, 'purple')
    this.fullPatternPage(this.molds.hoopBuckleInner, 'green',)
  }

  moldPiecePage (mold, color, addPage = true) {
    addPage && this.addPage(mold.diameter)

    const piece = new MoldPiece({
      center: mold.center,
      radius: mold.radius,
      circles: mold.circles
    })

    this.doc.path(piece.path()).stroke(color)

    const holeAngle = 11.25
    const holePoint1 = mold.circles.middle.point(holeAngle)
    const holePoint2 = mold.circles.middle.point(holeAngle + mold.lines.angle * 2)

    this.drawHoleCircle(holePoint1, color)
    this.drawHoleCircle(holePoint2, color)
  }

  shellMoldPiecePage () {
    const mold = this.molds.shell
    return this.moldPiecePage(mold, mold.color)
  }

  hoopMoldPiecePage () {
    const mold = this.molds.hoop
    return this.moldPiecePage(mold, mold.color)
  }

  hoopBuckleInnerMoldPiecePage () {
    const mold = this.molds.hoopBuckleInner
    return this.moldPiecePage(mold, mold.color)
  }

  hoopBuckleOuterMoldPiecePage () {
    const mold = this.molds.hoopBuckleOuter
    return this.moldPiecePage(mold, mold.color)
  }
}

export default PDF

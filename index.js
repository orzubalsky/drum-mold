import * as fs from 'fs'
import minimist from 'minimist'
import PDF from './src/Pdf.js'

const args = minimist(process.argv.slice(2))

const options = {
   diameter: args.diameter || 18,
   height: args.height || 14,
   thickness: args.thickness || 2
}

const pdf = new PDF(options)

pdf.start()

pdf.shellMoldPiecePage()
pdf.hoopMoldPiecePage()
pdf.hoopBuckleOuterMoldPiecePage()
pdf.hoopBuckleInnerMoldPiecePage()
pdf.hoopBuckleFullPatternPage()

pdf.end()

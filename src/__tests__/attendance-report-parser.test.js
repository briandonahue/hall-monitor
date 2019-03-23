/* eslint-disable no-console */
const fs = require('fs')

const emailText = fs.readFileSync('./src/__tests__/data/attendance-report-1.txt').toString()

describe('attendance report parser', () => {
  it('should parse out homeroom attendance', () => {
    const newText = emailText.replace(/=\n/g, '').replace(/\s+-\s+/g, '\n')
    const splits = newText.split('Expression ')
    for (const part of splits) {
      if (part.startsWith('HR')) {
        const lines = part.split('\n')
        for (const line of lines) {
          const match = (/(\d\d\/\d\d\/\d\d\d\d)\s+(\w+)/).exec(line)
          if (match) {
            console.log(`${match[1]}: ${match[2]}`)
          }
        }
        /*
        do {
          console.log(match)

          match = (/\d\d\/\d\d\/\d\d\d\d\s+\w+/gm).exec(part)
        } while (match != null)
    */
      }
    }

    expect.hasAssertions()
  })
})

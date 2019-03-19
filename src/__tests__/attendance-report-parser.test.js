const fs = require('fs')

const emailText = fs.readFileSync('./src/__tests__/data/attendance-report-1.txt').toString()

describe('attendance report parser', () => {
  it('should parse out homeroom attendance', () => {
    const newText = emailText.replace(/=\n/g, '').replace(/\s+-\s+/g, '\n')
    const splits = newText.split('Expression ')
    for (const part of splits) {
      if (part.startsWith('HR')) {
        let match = (/\d\d\/\d\d\/\d\d\d\d\s+\w+/gm).exec(part)
        console.log(match)
        do {
          console.log(match)

          match = (/\d\d\/\d\d\/\d\d\d\d\s+\w+/gm).exec(part)
        } while(match != null)
      }
    }

    expect.hasAssertions()
  })
})

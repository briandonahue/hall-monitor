const fs = require('fs')

const text = fs.readFileSync('./src/__tests__/data/progress-report-1.txt').toString()
const expectedJson = require('./data/progress-report-1.json')

const parser = require('../progress-report-parser')

describe('progress report parser', () => {
  it('should stuff', () => {
    const result = parser(text)
    expect(result).toEqual(expectedJson)
  })
})

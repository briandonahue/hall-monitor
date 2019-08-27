module.exports = (body) => {
  const gradeMatch = /Current overall grade\**\s*:\s*(.*)/.exec(body)
  const overallGrade = gradeMatch ? gradeMatch[1].trim() : null

  const data = {
    markingPeriod: /Grading period\s*:\s*(.*)/.exec(body)[1],
    course: /Course\s*:\s*(.*)/.exec(body)[1],
    teacher: /Instructor\s*:\s*(.*)/.exec(body)[1],
    overallGrade
  }

  const classInfoRE = /.*\sGrade:\s.*[\r\n]/g
  //  var classInfoRE = /.*\r/g
  const classInfo = body.match(classInfoRE)

  data.grades = classInfo.map((g) => {
    const sp = g.split('Grade:')
    const dateCourse = /(\d\d\/\d\d\/\d\d\d\d)\s+(.*)/.exec(sp[0].trim())

    const gradeInfo = sp[1].split('(')
    const letterGrade = gradeInfo[0].trim()

    const gradeDetails = gradeInfo[1].split(')')
    const gradeNote = gradeDetails.length > 1 ? gradeDetails[1].trim() : ''
    const scores = gradeDetails[0].split(' = ')
    const score = scores[0]
    const percentage = scores.length > 1 ? scores[1].trim() : ''


    const grade = {
      date: dateCourse[1].trim(),
      name: dateCourse[2].trim(),
      grade: letterGrade,
      score,
      percentage,
      notes: gradeNote
    }
    return grade
  })
  return data
}

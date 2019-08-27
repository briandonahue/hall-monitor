import { GradeData } from './GradeData'

const parseProgressData = (msg: GoogleAppsScript.Gmail.GmailMessage) =>  {
  let body = msg.getPlainBody()
  Logger.log(`parsing...`)

  const msgDate = msg.getDate()
  const data = new GradeData()

  const gradeMatch = /Current overall grade\**\s*:\s*(.*)/.exec(body)
  const overallGrade = gradeMatch ? gradeMatch[1].trim() : null
  Logger.log(`overall grade: ${overallGrade}`)

  data.updatedDate = `${msgDate.getMonth() + 1}/${msgDate.getDate()}/${msgDate.getFullYear()}`
  data.markingPeriod = /Grading period\s*:\s*(.*)/.exec(body)[1]
  data.course = /Course\s*:\s*(.*)/.exec(body)[1]
  data.teacher = /Instructor\s*:\s*(.*)/.exec(body)[1]
  data.overallGrade = overallGrade
  Logger.log(`parsed...`)
  
  let classInfoRE = /.*\sGrade:\s.*\r/g
//  let classInfoRE = /.*\r/g
  let classInfo =  body.match(classInfoRE)
  
  data.assignments = classInfo.map(function (g) {
    const sp = g.split("Grade:")
    const dateCourse = /(\d\d\/\d\d\/\d\d\d\d)\s+(.*)/.exec(sp[0].trim())
 
    const gradeInfo = sp[1].split("(")
    const letterGrade = gradeInfo[0].trim()
   
    const gradeDetails = gradeInfo[1].split(")")
    const gradeNote = gradeDetails.length > 1 ? gradeDetails[1].trim() : ""
    const scores = gradeDetails[0].split(" = ")
    const score = scores[0]
    const percentage = scores.length > 1 ? scores[1].trim() : ""
 
    
    const grade = {
      date: dateCourse[1].trim(),
      name: dateCourse[2].trim(),
      grade: letterGrade,
      score: score,
      percentage: percentage,
      notes: gradeNote === "^" ? 'Exempt' : ''
    }
    return grade
  })
  return data;
}

export = parseProgressData

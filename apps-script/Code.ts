/* eslint-disable */
/*

^ - Score is exempt from final grade
* - Assignment is not included in final grade
** - This final grade may include assignments that are not yet published by the teachers. It may also be a result of special weighting used by the teacher.
*/

import { GradeData } from './GradeData'

function start () {
  let labelObject = GmailApp.getUserLabelByName("Powerschool")
  let unreadCount = labelObject.getUnreadCount()
  if(unreadCount > 0) {
    let unreadThreads = labelObject.getThreads(0, unreadCount)
    unreadThreads.forEach(processThread)
  }
}

const processThread = (mailThread: GoogleAppsScript.Gmail.GmailThread) => {
  const unreadMsgs = mailThread.getMessages().filter(function (msg) { return msg.isUnread() })

  unreadMsgs.forEach(function (msg) {
   const subj = msg.getSubject()  
    if(/Progress/.test(subj)){
      updateProgress(msg)
    } else if(/attendance/.test(subj)){
      updateAttendance(msg)
    }
  })
  mailThread.markRead()
}

const updateProgress = (msg: GoogleAppsScript.Gmail.GmailMessage) => {
  const progressData = parseProgressData(msg)
  updateGoogleSheets(progressData)
}
 
const updateAttendance = (msg) =>  {
 
}
 
const parseProgressData = (msg: GoogleAppsScript.Gmail.GmailMessage) =>  {
  let body = msg.getPlainBody()

  const msgDate = msg.getDate()
  const data = new GradeData()
  data.updatedDate = `${msgDate.getMonth() + 1}/${msgDate.getDate()}/${msgDate.getFullYear()}`
  data.markingPeriod = /Grading period\s*:\s*(.*)/.exec(body)[1]
  data.course = /Course\s*:\s*(.*)/.exec(body)[1]
  data.teacher = /Instructor\s*:\s*(.*)/.exec(body)[1]
  data.overallGrade = /Current overall grade\**\s*:\s*(.*)/.exec(body)[1].trim()
  
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
 
const updateGoogleSheets = (data) =>  {
  const fileName = "Caelan School Data"
  const assignmentsSheetName = "All Assignments"
  const overallGradeSheetName = "Overall Grades"
  const files = DriveApp.getFilesByName(fileName)
  const spreadsheetFile = SpreadsheetApp.open(files.next())
  
  let assignmentSheet = spreadsheetFile.getSheetByName(assignmentsSheetName) 
                        || spreadsheetFile.insertSheet(assignmentsSheetName)
  updateAssignmentSheet(data, assignmentSheet)
  assignmentSheet.getRange(2,4,assignmentSheet.getLastRow(),3).setHorizontalAlignment("right")
  assignmentSheet.autoResizeColumns(1,7)
  assignmentSheet.getRange(2,1, assignmentSheet.getLastRow() -1, assignmentSheet.getLastColumn())
  .sort([{column: 3, ascending: false}, {column: 2, ascending: true }])

  let overallSheet = spreadsheetFile.getSheetByName(overallGradeSheetName) 
                     || spreadsheetFile.insertSheet(overallGradeSheetName)
  updateOverallSheet(data, overallSheet)
  overallSheet.getRange(2,1, overallSheet.getLastRow() -1, overallSheet.getLastColumn())
  .sort([{column: 1, ascending: false}, {column: 2, ascending: true }])
 
 
}
const updateAssignmentSheet = (data: GradeData, 
  assignmentSheet: GoogleAppsScript.Spreadsheet.Sheet) => {

  let header = assignmentSheet.getRange(1,1,1,8)
  header.setValues([["MP", "Course", "Date", "Name", "Grade", "Score", "Percent", "Note"]])
  header.setFontWeight("bold")
  header.setHorizontalAlignment("center")
  assignmentSheet.setFrozenRows(1)
 
  const numRows = assignmentSheet.getLastRow() -1
  if(numRows > 0) {
    deleteExisting(assignmentSheet, data)
  }
  Logger.log(`Adding ${data.assignments.length} assignment records`)
  const newValues = data.assignments.forEach(function (assignment) {
    const row = [data.markingPeriod, data.course, assignment.date, assignment.name, assignment.grade, assignment.score, assignment.percentage, assignment.notes]   
    assignmentSheet.appendRow(row)
  })  
  
}
const updateOverallSheet = (data: GradeData, 
  overallSheet: GoogleAppsScript.Spreadsheet.Sheet) => {
    // TODO:
    // header
    // update/insert class/grade
  let header = overallSheet.getRange(1,1,1,4)
  header.setValues([["MP", "Course", "Grade", "Updated Date"]])
  header.setFontWeight("bold")
  header.setHorizontalAlignment("center")
  overallSheet.setFrozenRows(1)

  const numRows = overallSheet.getLastRow() -1
  if(numRows > 0) {
    deleteExisting(overallSheet, data)
  }
  /*
  Logger.log('NUM ROWS BEFORE:' + dataRange.getNumRows())
  if (dataRange.getLastRow() -1 > 0){
    dataRange.getValues().forEach((val, i) => {
      if(val[0] === data.markingPeriod && val[1] === data.course) {
        Logger.log(`deleting row: ${i+1}: ${JSON.stringify(val)}`)
        overallSheet.deleteRow(i + 1)
        Logger.log('NUM ROWS INTERIM:' + overallSheet.getDataRange().getNumRows())
      }
    })

  }
  */
  
  const row = [data.markingPeriod, data.course, data.overallGrade, data.updatedDate]   
  overallSheet.appendRow(row)
  

}
  
const deleteExisting = (sheet: GoogleAppsScript.Spreadsheet.Sheet, data: GradeData) => {
  Logger.log(`Delete existing: ${sheet.getSheetName()}: ${data.course}`)
  const range = sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()) 
  Logger.log(`TOTAL ROWS: ${range.getNumRows()}`)
  range.sort([{column: 1, ascending: true}, { column: 2, ascending: true}])
  const values = range.getValues()
  let startIndex = -1
  let endIndex = 0
  values.forEach((val, i) => {
    if(val[0] === data.markingPeriod && val[1] === data.course) {
      if(startIndex < 0) {
        startIndex = i
      }
      if(endIndex < i) {
        endIndex = i
      }
    }
  });
  if(startIndex >= 0 && endIndex >= startIndex) {
    const startingRow = startIndex + 2 // account for header, and 0-based index
    const totalRows = 1+(endIndex-startIndex)
    Logger.log(`Deleting ${totalRows} starting at ${startingRow}`)
    sheet.deleteRows(startingRow, totalRows)
  }
}

/* eslint-disable */
/*

^ - Score is exempt from final grade
* - Assignment is not included in final grade
** - This final grade may include assignments that are not yet published by the teachers. It may also be a result of special weighting used by the teacher.

*/

function myFunction() {
  var labelObject = GmailApp.getUserLabelByName("Powerschool")
  var unreadCount = labelObject.getUnreadCount()
  if(unreadCount > 0) {
    var unreadThreads = labelObject.getThreads(0, unreadCount)
    unreadThreads.forEach(processThread)
  }
}

function processThread(mailThread) {
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

function updateProgress(msg) {
  const progressData = parseProgressData(msg)
  updateCourseSheet(progressData)
  
  updateCourseSheet(progressData)
  
}
 
function updateAttendance(msg) {
 
}
 
function parseProgressData(msg) {
  var body = msg.getPlainBody()
 
  var data = {}
  data.markingPeriod = /Grading period\s*:\s*(.*)/.exec(body)[1]
  data.course = /Course\s*:\s*(.*)/.exec(body)[1]
  data.teacher = /Instructor\s*:\s*(.*)/.exec(body)[1]
  data.grade = /Current overall grade\**\s*:\s*(.*)/.exec(body)[1].trim()
  
  var classInfoRE = /.*\sGrade:\s.*\r/g
//  var classInfoRE = /.*\r/g
  var classInfo =  body.match(classInfoRE)
  
  data.grades = classInfo.map(function (g) {
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
 
function updateCourseSheet(data) {
  const fileName = "Caelan School Data"
  const sheetName = "All Assignments"
  const files = DriveApp.getFilesByName(fileName)
  const file = SpreadsheetApp.open(files.next())
  
  var sheet = file.getSheetByName(sheetName) || file.insertSheet(sheetName)
 
 
  var header = sheet.getRange(1,1,1,8)
  header.setValues([["MP", "Course", "Date", "Name", "Grade", "Score", "Percent", "Note"]])
  header.setFontWeight("bold")
  header.setHorizontalAlignment("center")
  sheet.setFrozenRows(1)
 
  const numRows = sheet.getLastRow() -1
  if(numRows > 0) {
    deleteExisting(sheet, data)
  }
  
  const newValues = data.grades.forEach(function (grade) {
    const row = [data.markingPeriod, data.course, grade.date, grade.name, grade.grade, grade.score, grade.percentage, grade.notes]   
    sheet.appendRow(row)
  })  
  
    sheet.getRange(2,4,sheet.getLastRow(),3).setHorizontalAlignment("right")
    sheet.autoResizeColumns(1,7)
    sheet.getRange(2,1, sheet.getLastRow() -1, sheet.getLastColumn()).sort([{column: 3, ascending: false}, {column: 2, ascending: true }])
}
  
function deleteExisting(sheet, data) {
  const range = sheet.getRange(2, 1, sheet.getLastRow() -1, sheet.getLastColumn()) 
  range.sort([{column: 1, ascending: true}, { column: 2, ascending: true}])
  const values = range.getValues()
  var startIndex = -1
  var endIndex = 0
  for (var i = 0; i < values.length; i++ ) {
    if(values[i][0] === data.markingPeriod && values[i][1] === data.course) {
      if(startIndex < 0) {
        startIndex = i
      }
      if(endIndex < i) {
        endIndex = i
      }
    }
  }
  if(startIndex >= 0 && endIndex > 0) {
    Logger.log(data.course)
    Logger.log("startIndex=" + startIndex + ", endIndex=" + endIndex + "lastRow=" + sheet.getLastRow())
    sheet.deleteRows(startIndex+2, endIndex-startIndex)
  }
}
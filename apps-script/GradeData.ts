class GradeData {
  markingPeriod: string
  updatedDate: string
  course: string
  teacher: string
  overallGrade: string
  assignments: Array<Assignment>
}
class Assignment {
  date: string
  name: string 
  grade: string 
  score: string
  percentage: string
  notes: string
}

export { GradeData, Assignment }


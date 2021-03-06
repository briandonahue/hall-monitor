const parser = require('src/progress-report-parser')

module.exports.assignments = async (event) => {
  const { body } = event
  console.log(body)
  const result = parser(body)
  console.log(result)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Request Handled'
    }),
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
}

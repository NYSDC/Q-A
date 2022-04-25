const express = require('express')
const { helpful, create, read, report } = require('../db/model.js')
const cors = require('cors');
const mongodb = require('mongodb')
const db = require('../db/model.js')
const bodyParser = require('body-parser')
const app = express()
const util = require('util')

app.use(express.urlencoded())
app.use(express.json())
app.use(cors())
const PORT = 3001


// app.get('/testRoute', (req, res) => res.end('Hello from Server!'))


app.listen(PORT, () => {
  console.log(`Node.js App running on port ${PORT}...`)
})

////////////////////////////////////////////////////////////////
// /////////gets a question or answer ////////////// //
////////////////////////////////////////////////////////////////

app.get(`/qa/*/answers`, async (req, res) => {
  console.log('getting answers for a question')
  console.log(req.originalUrl)
  let question_ID = req.originalUrl.split('/')[2];
  console.log(question_ID)
  let result = await read(Number(question_ID), 'answer')
  data = {
    question: question_ID,
    page: 0,
    count: 1000,
    results: result,
  }
  console.log(result)
  res.send(data);
})
app.get(`/qa/*`, async (req, res) => {
  console.log('product_ID being fetched')
  const product_ID = req.originalUrl.split('/')
  let result = await read(Number(product_ID[product_ID.length - 1]), 'question')
  let data = { product_id: product_ID[product_ID.length - 1], results: result }
  console.log(util.inspect(data, { depth: null }))
  res.send(data);
})


////////////////////////////////////////////////////////////////
// /////////post a question or answer ////////////// //
////////////////////////////////////////////////////////////////
app.post(`/qa/*/answers`, async (req, res) => {
  console.log(req.originalUrl)
  console.log(req.body)
  let question_ID = req.originalUrl.split('/')[2];
  console.log(question_ID)
  let result = await create(Number(question_ID), 'answer', req.body)
  res.status(201).send(result)
})
app.post(`/qa/*`, async (req, res) => {
  console.log(req.originalUrl)
  const product_ID = req.originalUrl.split('/')
  // product_ID = 1 ********for testing**********
  console.log(product_ID)
  console.log(req.body)
  let result = await create(Number(product_ID[product_ID.length - 1]), 'question', req.body)
  res.status(201).send(result)
  // let result = await create(product_ID, 'question', req.body) *******for testing*********
})

app.put(`/qa/question/*`, (req, res) => {
  console.log(req.originalUrl)
})
app.put(`/qa/answer/*`, (req, res) => {
  console.log(req.originalUrl)
})

// const markQAsHelpful = (questionId) => {
// app.put(`/qa/question/${questionId}/helpful`, (req, res) => {

// });

// const reportQuestion = (questionId) => {
// app.put(`/qa/question/${questionId}/report`, (req, res) => {

// });

// const markAnsAsHelpful = (answerID) => {
// app.put(`/qa/answer/${answerID}/helpful`, (req, res) => {

// });

// const reportAns = (answerID) => {
// app.put(`/qa/answer/${answerID}/report`, (req, res) => {

// });

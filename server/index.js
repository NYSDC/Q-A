const express = require('express')
const { create, read } = require('../db/model.js')
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

app.listen(PORT, () => {
  console.log(`Node.js App running on port ${PORT}...`)
})

////////////////////////////////////////////////////////////////
// /////////gets a question or answer ////////////// //
////////////////////////////////////////////////////////////////

app.get(`/qa/*/answers`, async (req, res) => {
  let question_ID = req.originalUrl.split('/')[2];
  let result = await read(Number(question_ID), 'answer');
  data = {
    question: question_ID,
    page: 0,
    count: 1000,
    results: result,
  }
  res.send(data);
})
app.get(`/qa/*`, async (req, res) => {
  const product_ID = req.originalUrl.split('/');
  let result = await read(Number(product_ID[product_ID.length - 1]), 'question');
  let data = { product_id: product_ID[product_ID.length - 1], results: result };
  res.send(data);
})

app.get(`/loaderio-d150342dff852d4510d89250af8bff80.html`, (req, res) => {
  res.send('loaderio-d150342dff852d4510d89250af8bff80')
})


////////////////////////////////////////////////////////////////
// /////////post a question or answer ////////////// //
////////////////////////////////////////////////////////////////
app.post(`/qa/*/answers`, async (req, res) => {
  let question_ID = req.originalUrl.split('/')[2];
  let result = await create(Number(question_ID), 'answer', req.body);
  res.status(201).send(result);
})
app.post(`/qa/*`, async (req, res) => {
  const product_ID = req.originalUrl.split('/');
  // product_ID = 1 ********for testing**********
  let result = await create(Number(product_ID[product_ID.length - 1]), 'question', req.body);
  res.status(201).send(result);
  // let result = await create(product_ID, 'question', req.body) *******for testing*********
})


////////////////////////////////////////////////////////////////
//post helpful or reported are not endpoints that are used  //
////////////////////////////////////////////////////////////////
// app.put(`/qa/question/*`, (req, res) => {
//   console.log(req.originalUrl)
// })
// app.put(`/qa/answer/*`, (req, res) => {
//   console.log(req.originalUrl)
// })


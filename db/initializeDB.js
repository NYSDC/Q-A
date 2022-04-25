const mongodb = require('mongodb')
const db = require('../db/model.js')
// uploading CSV into Database
// mongoimport --type csv -d QA -c test_questions --headerline --drop test_questions.csv
// mongoimport --type csv -d QA -c test_photos --headerline --drop test_photos.csv
// mongoimport --type csv -d QA -c test_answers --headerline --drop test_answers.csv

// const mongoose = require('mongoose');

// mongoose.connect('mongodb')


const intiDB = async function () {

  /////////////////FOR QUESTIONS ENDPOINT//////////////////////

  //updates fields to have correct names for answers, questions, photos
  // db.test_answers.update({}, { $rename: { "date_written": "date", "helpful": "helpfulness" } }, false, true)
  await db.answers.aggregate([{ $project: { "_id": 0, "date": "$date_written", "id": 1, "helpfulness": "$helpful", "question_id": 1, "body": 1, "answerer_name": 1 } }, { $out: 'answers_without_photos1' }])
  await db.answers_without_photos1.aggregate([{ $addFields: { reported: "false" } }, { $out: 'answers_without_photos1' }])
  await db.questions.update({}, { $rename: { "id": "question_id", "date_written": "question_date", "helpful": "question_helpfulness", "body": "question_body" } }, false, true)
  // Assumes that question_photos are already written in correct format

  // Alters reported to say "true" or "false"
  await db.questions.updateMany(
    {},
    [
      {
        $set: {
          reported: {
            $switch: {
              branches: [
                { case: { $eq: ["$reported", 0] }, then: false },
                { case: { $eq: ["$reported", 1] }, then: true }
              ],
              default: ""
            }
          }
        }
      }
    ]
  )

  // combines photos into answers
  await db.answerPhotos.createIndex({ answer_id: 1 })
  await db.answers_without_photos1.aggregate([{ $lookup: { from: 'answerPhotos', localField: 'id', foreignField: 'answer_id', as: 'photos' } }, { $out: 'answers_with_photos1' }])

  // creating the proper nesting for answers inside of questions (converts array to object) when implementing this into aggregate pipeline:
  await db.answers_with_photos1.createIndex({ question_id: 1 })
  await db.questions.aggregate([
    { $lookup: { from: 'answers_with_photos1', localField: 'question_id', foreignField: 'question_id', as: 'answers' } },
    { $out: 'questions_with_answers0' }
  ])

  await db.questions_with_answers0.aggregate([
    {
      $addFields: {
        answers: {
          $arrayToObject: {
            $map: {
              input: "$answers",
              in: {
                k: { $toString: "$$this.id" },
                v: "$$this"
              }
            }
          }
        }
      }
    },
    { $out: 'questions_with_final' }
  ])

  /////////////////FOR Answers ENDPOINT (answers_with_photos2)//////////////////////

  //updates fields to have correct names for answers, questions, photos
  await db.answers.aggregate([{ $project: { "_id": 0, "date": "$date_written", "reported": false, "helpfulness": "$helpful", "answer_id": "$id", "question_id": 1, "body": 1, "answerer_name": 1 } }, { $out: 'answers_without_photos2' }])
  await db.answers_without_photos2.aggregate([{ $addFields: { reported: "false" } }, { $out: 'answers_without_photos2' }])


  // Assumes that question_photos are already written in correct format


  // combines photos into answers

  await db.answers_without_photos2.aggregate([{ $lookup: { from: 'answerPhotos', localField: 'answer_id', foreignField: 'answer_id', as: 'photos' } }, { $out: 'answers_with_photos_final' }])

  await db.test_answers.aggregate([{ $addFields: { reported: "false" } }])




  // *************** INDEX FINAL TABLES *******************
  // answers needs to have the questionID and answerID indexed
  // quesitons needs to have the productID and questionID indexed
}

initDB()
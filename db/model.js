const { MongoClient } = require("mongodb");
const util = require('util');
require('dotenv').config()


// const uri = "mongodb://18.117.159.187:27017";
console.log('is this undefined?', process.env.USER_NAME)
const uri = `mongodb://${process.env.USER_NAME}:${process.env.PSWD}@${process.env.HOST}:27017`;
const client = new MongoClient(uri);
client.connect();
const db = client.db("QA");

////////////////////////////////////////////////////////////////
// /////////gets data from the database ////////////// //
////////////////////////////////////////////////////////////////
const read = async function (ID, type) {
  try {
    if (type === 'answer') {
      const answers = db.collection("answers_final");
      const results = await answers.find({ "question_id": ID }).toArray();
      return results;
    } else {
      const questions = db.collection("questions_final");
      const results = await questions.find({ "product_id": ID }).toArray();
      return results;
    }
  } catch (ex) {
    console.error(`Something bad happened ${ex}`);
  }
  // finally {
  //   client.close();
  // }
}

// read(1136, 'answer')

////////////////////////////////////////////////////////////////
//////////////// Adds a question or an Answer///////////////////
////////////////////////////////////////////////////////////////
const create = async function (ID, type, data) {
  try {
    if (type === 'answer') {
      const answers = db.collection("answers_final");
      const answerResults = await answers.find({}, { answer_id: 1, _id: 0 }).sort({ answer_id: -1 }).limit(1).toArray();
      const answerToInsertIntoAnswers = {
        answer_id: answerResults[0].answer_id + 1,
        question_id: ID,
        body: data.body,
        answerer_name: data.name,
        answerer_email: data.email,
        reported: "false",
        date: new Date().toISOString(),
        helpfulness: 0,
        photos: data.photos
      }
      const answerToInsertIntoQuestions = {
        ...answerToInsertIntoAnswers,
        id: answerToInsertIntoAnswers.answer_id,
      }
      delete answerToInsertIntoQuestions.answer_id;

      // changing answers collection
      const insertAnswerResults = await answers.insertOne(answerToInsertIntoAnswers);

      // changing questions collection
      const questions = db.collection("questions_final");
      const questionResults = await questions.find({ "question_id": ID }).toArray();
      const newAnswersForQuestion = { ...questionResults[0].answers, [answerToInsertIntoQuestions.id]: answerToInsertIntoQuestions }
      await questions.updateOne({ "question_id": ID }, { $set: { "answers": newAnswersForQuestion } });
    } else {
      const questions = db.collection("questions_final");
      const answerResults = await questions.find({}, { question_id: 1, _id: 0 }).sort({ question_id: -1 }).limit(1).toArray();
      const questionToInsertIntoQuestions = {
        product_id: ID,
        asker_name: data.name,
        asker_email: data.email,
        reported: "false",
        question_body: data.body,
        question_date: new Date().toISOString(),
        question_helpfulness: 0,
        question_id: answerResults[0].question_id + 1,
        answers: {}
      }
      // console.log(util.inspect(questions, { depth: null }))
      questions.insertOne(questionToInsertIntoQuestions);
    }
  } catch (ex) {
    console.log(`An error occured ${ex}`);


  }
  //  finally {
  //   client.close()
  // }
}
// create(3, 'question')

////////////////////////////////////////////////////////////////
///////////////// Report Question or Answer/////////////////////
////////////////////////////////////////////////////////////////
// const report = async function (ID, type) {
//   // const client = new MongoClient(uri)
//   try {
//     // await client.connect()
//     // const db = client.db("QA");
//     if (type === 'answer') {
//       const answers = db.collection("test_answers_with_photos2");
//       // const answers = db.collection("answers_final");
//       const answerResults = await answers.updateOne({ "answer_id": ID }, { $set: { "reported": 'true' } })
//       const answer = await answers.find({ "answer_id": ID }).toArray();
//       const questions = db.collection("test_questions2");
//       const questionToChange = await questions.find({ "question_id": answer[0].question_id }).toArray()
//       const newAnswers = { ...questionToChange[0].answers, [ID]: { ...questionToChange[0].answers[ID], reported: 'true' } };
//       await questions.updateOne({ "question_id": answer[0].question_id }, { $set: { "answers": newAnswers } })
//     } else {
//       const questions = db.collection("test_questions2");
//       await questions.updateOne({ "question_id": ID }, { $set: { "reported": "true" } })
//     }
//   } catch (ex) {
//     console.log(`An error occured ${ex}`)


//   }
//   //  finally {
//   //   client.close()
//   // }
// }

// report(1, 'question')



////////////////////////////////////////////////////////////////
///////////////// Helpful Question or Answer/////////////////////
////////////////////////////////////////////////////////////////
// const helpful = async function (ID, type) {
//   // const client = new MongoClient(uri)
//   try {
//     // await client.connect()
//     // const db = client.db("QA");
//     if (type === 'answer') {

//       // /////increments helpfulness for answers collection
//       const answers = db.collection("test_answers_with_photos2");
//       // const answers = db.collection("answers_final");
//       const answerToIncrease = await answers.find({ "answer_id": ID }).toArray();
//       const newHelpfulnessScore = answerToIncrease[0].helpfulness + 1;
//       await answers.updateOne({ "answer_id": ID }, { $set: { "helpfulness": newHelpfulnessScore } })

//       // /////increments helpfulness for questions collection
//       const questions = db.collection("test_questions2");
//       const questionToChange = await questions.find({ "question_id": answerToIncrease[0].question_id }).toArray()
//       const answersToChange = questionToChange[0].answers
//       const changedHelpfulness = answersToChange[ID]
//       const newAnswers = { ...answersToChange, [ID]: { ...answersToChange[ID], helpfulness: newHelpfulnessScore } };
//       await questions.updateOne({ "question_id": answerToIncrease[0].question_id }, { $set: { "answers": newAnswers } })
//     } else {
//       const questions = db.collection("test_questions2");
//       const questionToIncrease = await questions.find({ "question_id": ID }).toArray();
//       const newHelpfulnessScore = questionToIncrease[0].helpfulness + 1;
//       console.log(newHelpfulnessScore)
//       await questions.updateOne({ "question_id": ID }, { $set: { "question_helpfulness": newHelpfulnessScore } })
//     }
//   } catch (ex) {
//     console.log(`An error occured ${ex}`)


//   }
//   //  finally {
//   //   client.close()
//   // }
// }

// helpful(3, 'question')


module.exports = { read, create }

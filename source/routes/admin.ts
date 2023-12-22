import express from 'express';
import { Contents } from '../models/contents';
import { Faq, FaqAnswer } from '../models/faq';
import { Status } from '../models/servserStatus';
import { Auth } from '../models/auth';
const router = express.Router();

router.post("/status/:code", async (req, res) => {
  const code = req.params.code;
  // code -> 0 = 서버 정상
  // 1 -> 점검중
  // 2 -> 테스트 플라이트 전용
  let currentStatus = await Status.findOne({})
  currentStatus!.code = parseInt(code)
  await currentStatus?.save()
  res.status(200).send()
})

router.get("/main/contents", async (req, res) => {
  const type = `${req.query.type}`;
  const result = await Contents.findOne({ type: type }).sort({ _id: -1 });
  if (!result) {
    res.status(404).json({
      error: "Empty content list"
    })
    return;
  }
  res.status(200).json({
    message: "Successfully read content list",
    result: result
  });
})
router.get("/main/contents/history", async (req, res) => {
  const type = `${req.query.type}`;
  const result = await Contents.find({ type: type }).sort({ _id: -1 });
  if (!result) {
    res.status(404).json({
      error: "Empty content list"
    })
    return;
  }
  res.status(200).json({
    message: "Successfully read content list",
    result: result
  });
})

router.post("/main/contents", async (req, res) => {
  console.log(req.body);
  const newData = req.body.data;
  console.log(newData);
  const newContents = new Contents(newData);
  try {
    await newContents.save();
  } catch(error) {
    console.error("Error while saving contents");
    console.error(error);
    res.status(400).json({
      error: error
    })
  }
  res.status(200).json({
    result: newContents
  });
});

router.get('/faq/list', async (req, res) => {
  const faqs = await Faq.list();
  res.status(200).json({
    statusCode: 0,
    message: "faqs successfully read.",
    result: faqs

  })
})

router.post('/faq/answer/:faqId', async (req, res) => {
  const faqId = req.params.faqId;
  const { title, content } = req.body;
  const answerData = {
    faqId, title, content, createdAt: Date.now()
  }
  const newAnswer = await FaqAnswer.create(answerData);
  res.status(200).json({
    statusCode: 0,
    message: "Answer successfully uploaded",
    result: newAnswer
  })
})

router.post("/authorize", async (req, res) => {
  const type = `${req.body.type}`;
  const productId = `${req.body.productId}`;
  const code = `${req.body.code}`;
  const message = req.body.message;
  if (!type || !productId || !code || !message) {
    res.status(200).json({
      statusCode: -1,
      message: "essential data not found.",
      result: {}
    })
    return;
  }
  try {
    const result = await Auth.findOneAndUpdate({ productId }, { code, lastAt: Date.now(), message }, { new: true });
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result
    })
  } catch(error) {
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    })
  }
})

export default router;

import express from 'express';
import { Filter } from '../models/filter';
import { Guideline } from '../models/guideline';
import { Contents } from '../models/contents';
import { Faq, FaqAnswer } from '../models/faq';

const router = express.Router();
// authorization
const auth = {
  UNAUTHORIZED: "unauthorized",
  DENIED: "denied",
  AUTHORIZED: "authorized"
};

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
  const status = `${req.body.status}`;
  if (!type || !productId || !status) {
    res.status(400).json({
      error: "essential data not found."
    });
    return;
  }
  if (status !== auth.AUTHORIZED && status !== auth.DENIED && status !== auth.UNAUTHORIZED) {
    res.status(400).json({
      error: `${status} is not proper status code.`
    });
    return;
  }
  if (type === "Filter") {
    const filter = await Filter.getFromObjId(productId);
    if (!filter) {
      res.status(404).json({
        error: "filter not found."
      });
      return;
    }
    filter.authStatus = status;
    let result: any = {};
    try {
      result = await filter.save();
    } catch(error) {
      console.error("error while save filter.")
      console.error(error);
      res.status(401).json({
        error: error
      });
    }
    console.log(result);
    res.status(200).json({
      message: "successfully changed.",
      result: result
    })
    return;
  } else if (type === "Guideline") {
    const guideline = await Guideline.getFromObjId(productId);
    if (!guideline) {
      res.status(404).json({
        error: "guideline not found."
      });
      return;
    }
    guideline.authStatus = status;
    let result: any = {};
    try {
      result = await guideline.save();
    } catch(error) {
      console.error("error while save filter.")
      console.error(error);
      res.status(401).json({
        error: error
      });
    }
    console.log(result);
    res.status(200).json({
      message: "successfully changed.",
      result: result
    })
    return;
  } else {
    res.status(401).json({
      error: "no exact type you sent."
    });
    return;
  }
})

export default router;

import express from 'express';
import formidable from 'formidable';
import { Storage } from '@google-cloud/storage';
const router = express.Router();
const storage = new Storage({ keyFilename: "firebasekey.json" })

router.post("/upload", async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(401).json({
        error: err
      });
      return;
    }
    const image = (files.image ?? [])[0];
    const type = fields.type;
    if (!image || !type) {
      res.status(402).json({
        error: "not essential input."
      })
      return;
    }
    const bucket = storage.bucket("gs://imica-kr.appspot.com");
    let imageUrl = "";
    const downLoadPath = "https://firebasestorage.googleapis.com/v0/b/imica-kr.appspot.com/o/";
    try {
      if (image.size !== 0) {
        const imageResponse = await bucket.upload(image.filepath, {
          destination: `${type}/${Date.now()}.png`,
          resumable: true,
        });
        imageUrl =
          downLoadPath +
          encodeURIComponent(imageResponse[0].name) +
          "?alt=media";
      } else {
        res.status(400).json({
          error: "image file size is zero."
        })
        return;
      }
    } catch(error) {
      res.status(401).json({
        error: error
      });
    }
    res.status(200).json({
      message: "Image uploaded successfully.",
      result: {
        url: imageUrl,
        type: type
      }
    })
  })
})

export default router;
import express from 'express';
import formidable from 'formidable';
import AWS from 'aws-sdk';
import fs from 'fs';
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: 'AKIAXCOGHQE4QCHHWEFA',
  secretAccessKey: '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',
  region: 'ap-southeast-2'
});

router.post("/upload", async (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (error, fields, files) => {
    if (error) {
      res.status(200).json({
        statusCode: -1, 
        message: error,
        result: {}
      });
      return;
    }
    const fFiles: formidable.File[] = files.image ?? [];
    const image = fFiles[0]
    const fType: String[] = fields.type ?? [];
    const type = fType[0];

    
    if (!image || !type) {
      res.status(200).json({
        statusCode: -1,
        message: "not essential input.",
        result: {}
      })
      return;
    }
    const fileType = image.originalFilename?.split('.').pop(); // 파일의 확장자 
    if (!fileType) {
      res.status(200).json({
        statusCode: -1,
        message: "not essential input.",
        result: {}
      })
      return;
    }
    let imageUrl = "";

    try {
      if (image.size !== 0) {
        const file = fs.readFileSync(image.filepath)
        const uploadParams = {
          Bucket: 'cufit-image-bucket',
          Key: `${type}/${Date.now()}.${fileType}`,
          Body: file,
        };
        console.log("after params", image.filepath)
        let data = await s3.upload(uploadParams).promise();
        imageUrl = data.Location;
        res.status(200).json({
          statusCode: 0,
          message: "Image uploaded successfully.",
          result: {
            url: imageUrl,
            type: type
          }
        })
        return;
      } else {
        res.status(200).json({
          statusCode: -1,
          message: "image file size is zero.",
          result: {}
        })
        return;
      }
    } catch(error) {
      console.log(error)
      res.status(200).json({
        statusCode: -1,
        message: error,
        result: {}
      });
      return;
    }
  })
})

router.delete("/delete", async (req, res) => {
  const fileName = req.body.fileName;
  const type = req.body.type;
  
  const bucketName = 'cufit-image-bucket';

  //* 단일 객체 삭제
  const objectParams_del = {
    Bucket: bucketName,
    Key: `${type}/${fileName}.png`
  };
  try {
    let result = await s3.deleteObject(objectParams_del).promise()
    res.status(200).json({
      statusCode: 0,
      message: "Success",
      result
    })
  } catch(error) {
    console.error(error);
    res.status(200).json({
      statusCode: -1,
      message: error,
      result: {}
    })
    return;
  }
})

export default router;
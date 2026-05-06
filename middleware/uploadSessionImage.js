import multer from 'multer'

const storage = multer.memoryStorage()

const imageFileFilter = (req, file, cb) => {
  if (file && file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true)
    return
  }
  cb(new Error('Please upload an image file (JPEG, PNG, WebP, etc.)'))
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter,
})

const uploadSingle = upload.single('sessionImage')

export const uploadSessionImage = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (!err) {
      next()
      return
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      err.status = 400
      err.message = 'Image must be 5MB or smaller'
      next(err)
      return
    }

    err.status = err.status || 400
    next(err)
  })
}

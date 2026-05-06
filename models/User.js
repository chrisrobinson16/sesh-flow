import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
  },
  { timestamps: true },
)

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password
    return ret
  },
})

const User = mongoose.model('User', userSchema)

export default User

import mongoose from 'mongoose'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

interface UserAttrs {
  email: string
  password: string
}
interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttrs): UserDocument
}
interface UserDocument extends mongoose.Document {
  email: string
  password: string
  comparePassword: (password: string) => Promise<boolean>
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true }
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      }
    }
  }
)

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const salt = randomBytes(8).toString('hex')
    const buf = (await scryptAsync(this.get('password'), salt, 64)) as Buffer
    this.set('password', `${buf.toString('hex')}.${salt}`)
  }

  done()
})

userSchema.methods.comparePassword = async function (userPassword: string): Promise<boolean> {
  const [hashedPassword, salt] = this.password.split('.')
  const buf = (await scryptAsync(userPassword, salt, 64)) as Buffer
  return buf.toString('hex') === hashedPassword
}

userSchema.statics.build = (user: UserAttrs) => new User(user)
const User = mongoose.model<UserDocument, UserModel>('user', userSchema)

export { User }

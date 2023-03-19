import { BadRequestError, validationRequest } from '@moimio/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { User } from '../models/user'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post(
  '/api/user/signin',
  [
    body('email').isEmail().withMessage('invalid Email'),
    body('password').trim().notEmpty().withMessage('invalid password')
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      throw new BadRequestError('invalid credentials')
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials')
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_KEY || 'secret'
    )
    req.session = { jwt: token }

    res.status(200).send(user)
  }
)

export { router as signinRouter }

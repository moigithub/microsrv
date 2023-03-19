import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { BadRequestError, validationRequest } from '@moimio/common'
import { User } from '../models/user'
import jwt from 'jsonwebtoken'
const router = express.Router()

router.post(
  '/api/user/signup',
  [
    body('email').isEmail().withMessage('Email invalid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('password must be at least 4 characters, and 20 char max')
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new BadRequestError('Invalid email or password')
    }

    const user = User.build({ email, password })
    await user.save()

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_KEY || 'secret'
    )
    req.session = { jwt: token }

    res.status(201).send(user)
  }
)

export { router as signupRouter }

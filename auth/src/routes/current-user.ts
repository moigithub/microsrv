import express, { Request, Response } from 'express'
import { currentUser, requireAuth } from '@moimio/common'

const router = express.Router()

router.get(
  '/api/user/currentuser',
  currentUser,
  /*requireAuth,*/ (req: Request, res: Response) => {
    return res.send({ currentUser: req.currentUser || null })
  }
)

export { router as currentuserRouter }

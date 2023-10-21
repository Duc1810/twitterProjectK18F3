import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersRouter from '~/routes/users.routes'
import databaService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email == 'test@gmail.com' && password === '123456') {
    return res.json({
      message: 'Login successful',
      data: [
        { name: 'Điệp', yob: 1999 },
        { name: 'Hùng', yob: 2004 },
        { name: 'Được', yob: 1994 }
      ]
    })
  }
  res.status(400).json({
    message: 'Login failed',
    result: []
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const { email, password, name, date_of_birth } = req.body
  try {
    const result = await usersService.register(req.body)

    return res.json({
      message: 'Register successfully',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'Register failed'
    })
  }
}
//nên bắt try catch vì chơi với database dễ bị lỗi

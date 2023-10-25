import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersRouter from '~/routes/users.routes'
import databaService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.request'
export const loginController = async (req: Request, res: Response) => {
  //nếu nó vào được đậy, tức là đã đưa email password đúng
  //server tạo ra accessToken và refresh_token để đưa client
  const { user }: any = req
  const user_id = user._id //objectId
  //server phải tọa ra access_token và refresh_token để đưa cho client
  const result = await usersService.login(user_id.toString())
  return res.json({
    messge: 'Login successfully',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const { email, password, name, date_of_birth } = req.body
  const result = await usersService.register(req.body)
  return res.json({
    message: 'Register successfully',
    result
  })
}
//nên bắt try catch vì chơi với database dễ bị lỗi
//hàm aysnc mới dùng wrapAysnc

import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersRouter from '~/routes/users.routes'
import databaService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '~/models/requests/User.request'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

//biết có user nên để as User
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //nếu nó vào được đậy, tức là đã đưa email password đúng
  //server tạo ra accessToken và refresh_token để đưa client
  const user = req.user as User
  const user_id = user._id as ObjectId
  //vì khi tạo server tự tạo objectid nên định nghĩa bắt buộc phải có
  //server phải tọa ra access_token và refresh_token để đưa cho client
  const result = await usersService.login(user_id.toString())
  return res.json({
    messge: USERS_MESSAGES.LOGIN_SUSSCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const { email, password, name, date_of_birth } = req.body
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}
//nên bắt try catch vì chơi với database dễ bị lỗi
//hàm aysnc mới dùng wrapAysnc

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  //lấy refresh_token từ req.body
  const { refresh_token } = req.body
  //và vào database chỉ có xóa refresh_token này
  //logout vào database xóa refresh_token
  const result = await usersService.logout(refresh_token)
  //nếu có thì xóa
  res.json(result)
}

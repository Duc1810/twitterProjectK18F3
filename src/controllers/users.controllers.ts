import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersRouter from '~/routes/users.routes'
import databaService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayLoad
} from '~/models/requests/User.request'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'

//biết có user nên để as User
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //nếu nó vào được đậy, tức là đã đưa email password đúng
  //server tạo ra accessToken và refresh_token để đưa client
  const user = req.user as User
  const user_id = user._id as ObjectId
  //vì khi tạo server tự tạo objectid nên định nghĩa bắt buộc phải có
  //server phải tọa ra access_token và refresh_token để đưa cho client
  //.toString để nó biết là kiẻu dữ liệu đưa lên là string nếu không là ObjectId
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

export const emailVerifyController = async (req: Request, res: Response) => {
  //kiểm tra thằng user này đã verify hay chưa
  const { user_id } = req.decoded_email_verify_token as TokenPayLoad

  //dựa vào user_idf tìm user và xem thử nó đã verify chưa
  const user = await databaService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  if (user.email_verify_token !== (req.body.email_verify_token as string)) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  //nếu mà xuống đc đây đây nghĩa là user này chưa verify ,chưa bị banned, và khớp mã
  // mình tiế hành update: verify: 1, xóa email_verify_token, update_at
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}
export const resendEmailVerifyController = async (req: Request, res: Response) => {
  //nếu code vào đc đấy nghĩa là đã qua được tầng accessTokenValidator
  //trong req đã có decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayLoad
  //lấy user từ database
  const user = await databaService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.verify == UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  if (user.verify == UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //nếu chưa verify thì tiến hành update cho user mã mới
  const result = await usersService.resendEmailVerify(user_id)
  return res.json(result)
}
export const forgotpasswordController = async (req: Request, res: Response) => {
  const { _id } = req.user as User
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
  //lấy user id từ req.user
  //tiến hành update lại forgot_password_token
}
export const vefifForgotPasswordTokenContrller = async (req: Request, res: Response) => {
  res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  //muốn cập nhật mật khẩu mới thì cần user id và password mới
  const { user_id } = req.decoded_forgot_verify_token as TokenPayLoad
  const { password } = req.body
  //cập nhật password mới cho user có user_id này
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}
export const getMeController = async (req: Request, res: Response) => {
  //muốn lấy thông tincủa user thfi cần user_id
  const { user_id } = req.decoded_authorization as TokenPayLoad
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    reusult: user
  })
}

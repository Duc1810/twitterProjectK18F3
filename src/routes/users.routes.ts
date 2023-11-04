import { Router } from 'express'
import {
  emailVerifyController,
  forgotpasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  vefifForgotPasswordTokenContrller
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotpasswordvalidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'

import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
//request  handler: miđleware ,controller : req,res,next
//error handler: err,req,res,next
//hàm bth: next(new )
//kt accc ,re rồi xóa
usersRouter.post('/logout', refreshTokenValidator, wrapAsync(logoutController))

/*
  des: verify email 
  method : post
  path: /users/Verify_email
  body: {
    email_verify_token: string
//nếu mà em nhấp vào link
 thì em sẽ tạo ra 1 cái req gửi lên verifyEmail lên server
  }
  //vì là đừng dẫn nên chỉ bấm là post
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))
/*
des: resend verify email
method: post
pathL /users/resend-verify-email
headers: {Authorization: "Bearer access_token"}

*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))
/*
des : forgot password
method: post
path: /users/forgot-password
body: {
  email: string
}
*/
usersRouter.post('/forgot-password', forgotpasswordvalidator, wrapAsync(forgotpasswordController))
/*
des: verify forgot password
method: post
path: /users?verify-forgot-password
body: {
  forgot_password_token: string
}
*/
/* des : reset password
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(vefifForgotPasswordTokenContrller)
)
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)
/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))
export default usersRouter

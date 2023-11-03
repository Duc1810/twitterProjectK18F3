import User from '~/models/schemas/User.schema'
import databaService from './database.services'
import { register } from 'module'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
config()
class UsersService {
  //viết hàm nhận vào user id để bỏ vào payload tọa access token

  //viết hàm nhận vào user id để bỏ vào payload tọa refresh token
  //chơi với server là luôn dùng await để đợi truy suất dữ liệu
  async checkEmailExit(email: string) {
    const user = await databaService.users.findOne({ email })
    return Boolean(user)
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    const result = await databaService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    //lấy ra id dùng isertedId
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id.toString())
    //lưu refresh_token vào database
    await databaService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    //giả lập gửi mail cho gửi dùng
    //nên chỉ trả về acc và ref
    console.log('email_verify_token :', email_verify_token)
    return { access_token, refresh_token }
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    //lưu refresh_token vào database
    await databaService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_token, refresh_token }
  }

  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }
  //kh cần asayn vì tham return ra kết quả rồi ,sao signToken kh có await vì chưa kí thì lấy gì đợi
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string //thêm
    })
  }
  private signForgotPasswordVerifytoken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_VERIFY_TOKEN as string
    })
  }
  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  async logout(refresh_token: string) {
    await databaService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }
  async verifyEmail(user_id: string) {
    //cập nhật lại user
    await databaService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    // const [token] = await Promise.all([
    //   this.signAccessTokenAndRefreshToken(user_id),
    //   databaService.users.updateOne(
    //     { _id: new ObjectId(user_id) }, //tìm user thông qua _id
    //     { $set: { email_verify_token: '', updated_at: '$$NOW', verify: UserVerifyStatus.Verified } }
    //     //set email_verify_token thành rỗng,và cập nhật ngày cập nhật, cập nhật status của verify
    //   )
    // ])
    //tạo acccess_token và refresh_token
    const [acccess_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    await databaService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return { acccess_token, refresh_token }
  }
  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    //cập nhật lại user
    await databaService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //giả lập gửi email
    console.log(email_verify_token)
    return { message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS }
  }
  async forgotPassword(user_id: string) {
    //tạo ra forgot password_token
    const forgot_password_token = await this.signForgotPasswordVerifytoken(user_id)
    await databaService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            forgot_password_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
    console.log(forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TORESET_PASSWORD
    }
  }
}
const usersService = new UsersService()
export default usersService

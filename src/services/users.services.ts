import User from '~/models/schemas/User.schema'
import databaService from './database.services'
import { register } from 'module'
import { RegisterReqBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
import { config } from 'dotenv'
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
    const result = await databaService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    //lấy ra id
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    return [access_token, refresh_token]
  }
  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    return [access_token, refresh_token]
  }

  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  //kh cần asayn vì tham return ra kết quả rồi ,sao signToken kh có await vì chưa kí thì lấy gì đợi
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }
  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
}
const usersService = new UsersService()
export default usersService

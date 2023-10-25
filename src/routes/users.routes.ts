import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.get('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
//request  handler: miđleware ,controller : req,res,next
//error handler: err,req,res,next
//hàm bth: next(new )
export default usersRouter

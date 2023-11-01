import { Request, Response, NextFunction } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'

import { EntityError, ErrorWithStatus } from '~/models/Errors'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObject) {
      //lấy msg từng lỗi ra
      const { msg } = errorObject[key] //phân rã lấy msg
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      entityError.errors[key] = msg

      next(entityError)
    }
  }
}

//vì đây là lỗi từ người dùng chuyền lên

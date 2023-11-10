import express, { NextFunction } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { Request, Response } from 'express'
import { error } from 'console'
import { defaultErrorHandler } from './middlewares/error.middlewares'
const app = express()
app.use(express.json())
const PORT = 4000
databaseService.connect()
//chứa api liên quan tới user
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/users', usersRouter)
app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})

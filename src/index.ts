import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

const app = express()
app.use(express.json())
const PORT = 3000
databaseService.connect()
//chứa api liên quan tới user
app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/users', usersRouter)
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})

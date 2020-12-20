import express from 'express'
import userRouter from './routers/user'
import loanRequestRouter from './routers/loan-request'
import visitRouter from './routers/visit'
import callRouter from './routers/call'
import whatsappMessageRouter from './routers/whatsapp-message'

require('./db/mongoose')

const App = express()

App.use(express.json())

/**
 * Routers
 */
App.use(userRouter)
App.use(loanRequestRouter)
App.use(visitRouter)
App.use(callRouter)
App.use(whatsappMessageRouter)

export default App

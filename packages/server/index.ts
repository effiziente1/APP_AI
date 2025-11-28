import express from 'express'
import dotenv from 'dotenv'
import OpenAI from 'openai'
import router from './routes'

dotenv.config()

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const app = express()

// Manual CORS middleware for Angular dev server
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }

    next()
})

app.use(express.json())
app.use(router)
const port = process.env.PORT || 3000


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})


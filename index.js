import 'dotenv/config'

import express from 'express'
var app = express()
  
// User inputs
app.get('/', (req, res) => {
  res.sendFile('./landing.html', {root: '.'})
})

app.get('/logo.svg', (req, res) => {
  res.sendFile('./assets/QueryBuddy-Large.svg', {root: '.'})
})

app.get('/favicon.ico', (req, res) => {
  res.sendFile('./favicon.ico', {root: '.'})
})

app.get('*', (req, res) => {
  res.status(302).redirect('/')
})

var port = 3000
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
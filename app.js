const express = require('express')
const app = express()

app.use(express.static(__dirname + "/public"));

app.set('view engine', 'jade')
app.set('views', 'views')

app.listen(3000, (err) => {
  if(err){
    console.log(err)
  }
  console.log("Server Starting at 3000 port!")
})

// 홈페이지
app.get('/', (req, res) => {
  console.log(__dirname)
  res.sendFile(__dirname + '/public/main.html')
})
// 혹시모를 홈페이지 jade 버전
app.get('/main', (req, res) => {
  res.render('main')
})

app.get('/signIn', (req, res) => {
  res.sendFile(__dirname + '/public/login.html')
})

app.get('/signUp', (req, res) => {
  res.sendFile(__dirname + '/public/signUp.html')
})

app.get('/dashboard', (req, res) => {
  res.render('dashboard')
})

app.get('/bmiCalc', (req, res) => {
  res.render('bmiCalc')
})

app.get('/exerciseRec', (req, res) => {
  res.render('exerciseRec')
})

app.get('/exerciseLib', (req, res) => {
  res.send('운동 라이브러리 개설 예정')
})

app.get('/community', (req, res) => {
  res.render('community')
})
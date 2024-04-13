const express = require('express')
const app = express()

app.use(express.static(__dirname + "/public"));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'jade')
app.set('views', 'views')

app.listen(3000, (err) => {
  if(err){
    console.log(err)
  }
  console.log("Server Starting at 3000 port!")
})

app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/public/test.html')
})
app.get('/test2', (req, res) => {
  res.sendFile(__dirname + '/public/test2.html')
})
app.get('/test3', (req, res) => {
  res.sendFile(__dirname + '/public/test3.html')
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
  res.sendFile(__dirname + '/public/signIn.html')
})
app.post('/signIn', (req, res) => {
  let id = req.body.id
  let password = req.body.password

  res.send(id + ', '+ password)
})


app.get('/signUp', (req, res) => {
  res.sendFile(__dirname + '/public/signUp.html')
})
app.post('/signUp', (req, res) => {
  let id = req.body.user_id
  let password = req.body.user_password
  let name = req.body.user_name
  let email = req.body.user_email

  res.send(name + ', ' + email +  ', ' + id + ', ' + password)
})



app.get('/dashboard', (req, res) => {
  res.render('dashboard')
})

app.get('/bmiCalc', (req, res) => {
  res.render('bmiCalc')
})
app.post('/bmiCalc', (req, res) => {
  let gender = req.body.gender
  let age = req.body.age
  let height = req.body.height
  let weight = req.body.weight

  console.log(gender)

  res.render('bmiCalc', {gender : gender, age : age, height : height, weight : weight})
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
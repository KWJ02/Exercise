const express = require('express')
const mysql = require('mysql')
const session = require('express-session')
const conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'ER' // 데이터베이스 이름 유의
})
const app = express()

app.use(express.static(__dirname + "/public"));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret : 'exerciseRec123',
  resave : true,
  saveUninitialized : false,
}))

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
app.get('/main', (req, res) => {
  if(req.session.name){
    res.render('main', {name : req.session.name})
  } else {
    res.sendFile(__dirname + '/public/main.html')
  }
})
// 혹시모를 홈페이지 jade 버전
// app.get('/main', (req, res) => {
//   res.render('main')
// })



// **********************************로그인
app.get('/signIn', (req, res) => {
  res.sendFile(__dirname + '/public/signIn.html')
})
app.post('/signIn', (req, res) => {
  let id = req.body.id
  let password = req.body.password

  // SELECT, UPDATE, DELETE는 항상 WHERE 사용
  sql = 'SELECT * FROM users WHERE user_id=? AND user_pw=?'
  conn.query(sql, [id, password], (err, result) => {
    if(err){
      console.log(err)
      res.status(500).send('Internal Server Error')
    } else {
      req.session.name = result[0].name
      req.session.email = result[0].email
      req.session.save(() =>{
        res.redirect('/main')
      })
    }
  })
})


// ********************************회원가입
app.get('/signUp', (req, res) => {
  res.sendFile(__dirname + '/public/signUp.html')
})
app.post('/signUp', (req, res) => {
  let id = req.body.user_id
  let password = req.body.user_password
  let email = req.body.user_email
  let name = req.body.user_name

  let sql = 'INSERT INTO users (user_id, user_pw, email, name) VALUES (?,?,?,?)'
  conn.query(sql,[id,password,email,name],(err, result) => {
    if(err){
      console.log(err)
      res.status(500).send('Interner Server Error')
    } else {
      res.redirect('/signIn')
    }
  })
})



app.get('/dashboard', (req, res) => {
  res.render('dashboard')
})

app.get('/bmiCalc', (req, res) => {
  if(req.session.name){
    res.render('bmiCalc', {name : req.session.name})
  } else {
    res.render('bmiCalc')
  }
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
  if(req.session.name){
    res.render('exerciseRec', {name : req.session.name})
  } else {
    res.render('exerciseRec')
  }
})

app.get('/exerciseLib', (req, res) => {
  res.send('운동 라이브러리 개설 예정')
})

app.get('/community', (req, res) => {
  if(req.session.name){
    res.render('community', {name : req.session.name})
  } else {
    res.render('community')
  }
})
const express = require('express')
const mysql = require('mysql')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const conn = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'ER' // 데이터베이스 이름 유의
})
const app = express()

// 세션 미들웨어 설정
app.use(session({
  secret: 'your-secret-key', // 세션을 암호화하는 데 사용되는 키
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : '',
    database : 'ER'
  })
}))

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

// ********************************** 홈페이지
app.get('/main', (req, res) => {
  if(req.session.user_id){
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('main', {name : result[0].name})
      }
    })
  } else {
    res.sendFile(__dirname + '/public/main.html')
  }
})

// ********************************** 로그인
app.get('/signIn', (req, res) => {
  res.sendFile(__dirname + '/public/signIn.html')
})
app.post('/signIn', (req, res) => {
  let id = req.body.id
  let password = req.body.password

  // 사용자 인증 과정
  sql = 'SELECT * FROM users WHERE user_id=? AND user_pw=?'
  conn.query(sql, [id, password], (err, result) => {
    if(err){
      console.log(err)
      res.status(500).send('Internal Server Error')
    } else {
      if (result.length > 0) {
        // 로그인 성공 시 세션 설정, 사용자의 아이디만 세션에 저장
        req.session.user_id = result[0].user_id
        req.session.save(() =>{
          res.redirect('/main')
        })
      } else {
        // 로그인 실패 시 메시지 출력 또는 리다이렉션
        res.send('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    }
  })
})
// ********************************** 로그아웃
app.post('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/main')
})


// ********************************** 회원가입
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


// ********************************** 대시보드
app.get('/dashboard', (req, res) => {
  res.render('dashboard')
})

// ********************************** bmi 계산기
app.get('/bmiCalc', (req, res) => {
  if(req.session.user_id){
    let alertMessage = req.query.alertMessage
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('bmiCalc', {name : result[0].name, alertMessage : alertMessage})
      }
    })
  } else {
    res.render('bmiCalc')
  }
})
app.post('/bmiCalc', (req, res) => {
  let gender = req.body.gender
  let age = req.body.age
  let height = req.body.height
  let weight = req.body.weight
  let bmi = ((weight / (height * height)) * 10000).toFixed(2)
  let normalMinimumWeight = ((height * height) / 10000 * 18.55).toFixed(1)
  let normalMaximumWeight = ((height * height) / 10000 * 24.95).toFixed(1)

  if(req.session.user_id){
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('bmiCalc', {name : result[0].name, bmi : {bmi, normalMinimumWeight, normalMaximumWeight}, age : age, gender : gender, height : height, weight : weight})
      }
    })
  } else {
    res.render('bmiCalc', {bmi : {bmi, normalMinimumWeight, normalMaximumWeight}, age : age, gender : gender, height : height, weight : weight})
  }
})

// ********************************** bmi 값 저장, 새로고침은 되는데 값 저장이 안됨
app.post('/bmiCalc/bmiRecord', (req, res) => {
  let gender = req.body.gender
  let age = req.body.age
  let height = req.body.height
  let weight = req.body.weight
  let bmi = ((weight / (height * height)) * 10000).toFixed(2)
  let normalMinimumWeight = ((height * height) / 10000 * 18.55).toFixed(1)
  let normalMaximumWeight = ((height * height) / 10000 * 24.95).toFixed(1)

  if(req.session.user_id){
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('bmiCalc', {alertMessage : '대시보드에 저장되었습니다!', name : result[0].name, bmi : {bmi, normalMinimumWeight, normalMaximumWeight}, age : age, gender : gender, height : height, weight : weight})
      }
    })
  } else {
    res.render('signIn')
  }
});

app.get('/checkLogin', (req, res) => {
  if (req.session.user_id) {
    res.status(200).json({ loggedIn: true });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});


// ********************************** 운동추천 폼
app.get('/exerciseRec', (req, res) => {
  if(req.session.user_id){
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('exerciseRec', {name : result[0].name})
      }
    })
  } else {
    res.render('exerciseRec')
  }
})

// ********************************** 운동 라이브러리
app.get('/exerciseLib', (req, res) => {
  res.send('운동 라이브러리 개설 예정')
})


// ********************************** 커뮤니티
app.get('/community', (req, res) => {
  if(req.session.user_id){
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('community', {name : result[0].name})
      }
    })
  } else {
    res.render('community')
  }
})
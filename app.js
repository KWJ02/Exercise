const express = require('express')
const app = express()

app.use(express.static(__dirname + "/public"));

app.listen(3000, (err) => {
  if(err){
    console.log(err)
  }
  console.log("Server Starting at 3000 port!")
})

// 홈페이지
app.get('/', (req, res) => {
  console.log(__dirname)
  res.sendFile(__dirname + '/public/mainView.html')
})

app.get('/signIn', (req, res) => {
  res.send('로그인 창 페이지입니다. html이나 jade이용해서 sendFile이나 render할거에요')
})

app.get('/bmiCalc', (req, res) => {
  res.send("BMI 계산 페이지 입니다.")
})

app.get('/exerciseRec', (req, res) => {
  res.send("운동 추천 페이지 입니다.")
})

app.get('/dashboard', (req, res) => {
  res.send("대시보드 페이지 입니다.")
})

app.get('/community', (req, res) => {
  res.send("커뮤니티 페이지 입니다.")
})
const express = require('express')
const cookieParser = require('cookie-parser')
const mysql = require('mysql')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const router = express.Router();
const moment = require('moment');
const MySQLStore = require('express-mysql-session')(session)
const conn = mysql.createConnection({
  host : 'localhost',
  user : 'db',
  password : 'a123456&',
  database : 'db' // 데이터베이스 이름 유의
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
    user : 'db',
    password : 'a123456&',
    database : 'db'
  })
}))

app.use(express.static(__dirname + "/public"));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.set('view engine', 'jade')
app.set('views', 'views')

app.listen(3000, (err) => {
  if(err){
    console.log(err)
  }
  console.log("Server Starting at 3000 port!")
})

app.get('/test', (req, res) => {
  res.render('signUp')
})
app.get('/test1', (req, res) => {
  res.sendFile(__dirname + '/public/test1.html')
})
app.get('/test2', (req, res) => {
  res.sendFile(__dirname + '/public/test2.html')
})

// ********************************** 홈페이지
app.get('/main', (req, res) => {
  if(req.session.user_id){
    let sql = 'SELECT name, user_id from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('main', {name : result[0].name, id : result[0].user_id})
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
  let alertMessage = ''

  // 사용자 인증 과정
  let sql = 'SELECT * FROM users WHERE user_id=?'
  conn.query(sql, id, (err, result) => {
    if(err){
      console.log(err)
      res.status(500).send('Internal Server Error')
    }

    if (result.length > 0) {
      // 로그인 성공 시 세션 설정, 사용자의 아이디만 세션에 저장
      let sql = 'SELECT * FROM users WHERE user_pw=?'
      conn.query(sql, password, (err, result) => {
        if(err){
          console.log(err)
          res.status(500).send('Internal Server Error')
        }
        
        if(result.length > 0){
          req.session.user_id = result[0].user_id
          req.session.save(() =>{
            res.redirect('/main')
          })
        } else {
          alertMessage = "암호가 틀렸습니다."
          res.render('signIn', {alertMessage : alertMessage})
        }
        
      })
    } else {
      // 로그인 실패 시 메시지 출력 또는 리다이렉션
      alertMessage = '존재하지 않는 계정입니다.'
      res.render('signIn', {alertMessage : alertMessage});
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
  let alertMessage = ''

  let sql = 'SELECT user_id, name FROM users WHERE user_id=? AND name=?'
  conn.query(sql,[id, name],(err, result) => {
    if(err){
      console.log(err)
      res.status(500).send('Interner Server Error')
    } 

    if(result.length == 0){
      let sql = 'INSERT INTO users (user_id, user_pw, email, name) VALUES (?,?,?,?)'
      conn.query(sql, [id, password, email, name], (err, result) => {
        if(err){
          console.log(err)
          res.status(500).send('Interner Server Error')
        } else {
          alertMessage = "회원가입이 완료되었습니다."
          res.render('signIn', {alertMessage : alertMessage})
        }
      })
    } else {
      alertMessage = "이미 존재하는 아이디입니다."
      res.render('signUp', {alertMessage : alertMessage, inform : {id, password, email, name}})
    }
  })
})

// ********************************** bmi 계산기
app.get('/bmiCalc', (req, res) => {
  if(req.session.user_id){
    let alertMessage = req.query.alertMessage
    let sql = 'SELECT name, user_id from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('bmiCalc', {name : result[0].name, alertMessage : alertMessage, id : result[0].user_id})
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

  res.cookie('gender', gender)
  res.cookie('age', age)
  res.cookie('height', height)
  res.cookie('weight', weight)
  res.cookie('bmi', bmi)
  res.cookie('normalMinimumWeight', normalMinimumWeight)
  res.cookie('normalMaximumWeight', normalMaximumWeight)
  

  if(req.session.user_id){
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('bmiCalc', {name : result[0].name, bmi : bmi, normalMinimumWeight : normalMinimumWeight, normalMaximumWeight : normalMaximumWeight, age : age, gender : gender, height : height, weight : weight})
      }
    })
  } else {
    res.render('bmiCalc', {bmi : bmi, normalMinimumWeight : normalMinimumWeight, normalMaximumWeight : normalMaximumWeight, age : age, gender : gender, height : height, weight : weight})
  }
})

// ********************************** bmi기록 / insert문 중복 수행 오류
app.post('/bmiRecord', (req, res) => {
  const userInput = req.cookies
  if(req.session.user_id){
    let id = req.session.user_id
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      }
      if(result.length > 0) {
        let sql2 = 'INSERT INTO userinput (age, height, weight, bmi) VALUES (?,?,?,?)'
        conn.query(sql2, [userInput.age, userInput.height, userInput.weight, userInput.bmi], (err, rows) => {
          if(err){
            console.log(err)
            res.status(500).send('Internal Server Error')
          } else {
            res.render('bmiRecord', {alertMessage : '대시보드에 저장되었습니다.'})
          }
        })
      }
    })
  } else {
    console.log('10')
    res.redirect('../signIn')
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
    let sql = 'SELECT name, user_id from users WHERE user_id = ?'
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('exerciseRec', {name : result[0].name, id : result[0].user_id})
      }
    })
  } else {
    res.render('exerciseRec')
  }
})

app.post('/exerciseRec', (req, res) => {
  let pos = req.body['options-position']
  let part = req.body['options-parts']
  let diff = req.body['options-difficulty']
  let sql = 'SELECT name FROM exercises WHERE pos = ? AND part = ?'


})

// ********************************** 운동 라이브러리
app.get('/exerciseLib', (req, res) => {
  res.send('운동 라이브러리 개설 예정')
})

app.get('/community', (req, res) => {
  if(req.session.user_id) {
    let sql = 'SELECT name, user_id from users WHERE user_id = ?';
    conn.query(sql, req.session.user_id, (err, result) => {
      if(err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
        const userName = result[0].name;
        const query = req.query.query; // 검색어 가져오기
        const perPage = 6; // 한 페이지에 표시할 게시글 수
        const page = req.query.page || 1; // 페이지 매개변수 가져오기, 기본값은 1

        // 게시물 쿼리를 페이지에 따라 가져오기
        let sqlPosts = `SELECT post_id, title, content, name, nameInput, created_at, view_count 
                        FROM posts`;

        if (query) {
          // 검색어가 있는 경우 WHERE 절을 추가하여 검색을 수행합니다.
          sqlPosts += ` WHERE title LIKE '%${query}%' OR content LIKE '%${query}%'`;
        }

        sqlPosts += ` ORDER BY created_at DESC 
                      LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`;

        conn.query(sqlPosts, (err, postsResult) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error fetching posts');
          } else {
            // Moment.js를 사용하여 created_at 값을 원하는 형식으로 변환
            postsResult.forEach(post => {
              post.created_at = moment(post.created_at).format('YYYY-MM-DD HH:mm:ss');
            });

            // 다음 페이지가 있는지 확인
            const hasNextPage = postsResult.length === perPage;

            res.render('community', { name: userName, id: result[0].user_id, posts: postsResult, page, hasNextPage });
          }
        });
      }
    });
  } else {
    // 세션이 없는 경우
    const query = req.query.query; // 검색어 가져오기
    const perPage = 6; // 한 페이지에 표시할 게시글 수
    const page = req.query.page || 1; // 페이지 매개변수 가져오기, 기본값은 1

    // 게시물 쿼리를 페이지에 따라 가져오기
    let sqlPosts = `SELECT post_id, title, content, name, nameInput, created_at, view_count 
                    FROM posts`;

    if (query) {
      // 검색어가 있는 경우 WHERE 절을 추가하여 검색을 수행합니다.
      sqlPosts += ` WHERE title LIKE '%${query}%' OR content LIKE '%${query}%'`;
    }

    sqlPosts += ` ORDER BY created_at DESC 
                  LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`;

    conn.query(sqlPosts, (err, postsResult) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error fetching posts');
      } else {
        // Moment.js를 사용하여 created_at 값을 원하는 형식으로 변환
        postsResult.forEach(post => {
          post.created_at = moment(post.created_at).format('YYYY-MM-DD HH:mm:ss');
        });

        // 다음 페이지가 있는지 확인
        const hasNextPage = postsResult.length === perPage;

        res.render('community', { posts: postsResult, page, hasNextPage });
      }
    });
  }
});

// 커뮤니티 페이지에 새 게시물 추가하기
app.post('/community', (req, res) => {
  const { post_id, title, content, name, nameInput, created_at, view_count } = req.body;
  
  // 게시물 추가를 위한 SQL 쿼리
  const sql = 'INSERT INTO posts (post_id, title, content, name, nameInput, created_at, view_count) VALUES (?, ?, ?, ?, ?, ?, 0)';
  conn.query(sql, [post_id, title, content, name, nameInput, created_at, view_count], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error creating post');
    } else {
      res.redirect('/community'); // 새 게시물이 추가되면 커뮤니티 페이지로 리다이렉트
    }
  });
});


 // 글쓰기 페이지 렌더링
 app.get('/write', (req, res) => {
  // 세션에서 사용자 정보 가져오기
  const userId = req.session.user_id;
  if(userId){
    let sql = 'SELECT name from users WHERE user_id = ?'
    conn.query(sql, userId, (err, result) => {
      if(err){
        console.log(err)
        res.status(500).send('Internal Server Error')
      } else {
        res.render('write', { name: result[0].name }) // write 파일을 렌더링하며 사용자 이름 전달
      }
    })
  } else {
    res.redirect('/signIn'); // 로그인 페이지로 리다이렉트
  }
})

// 게시물 작성 페이지에서 게시물을 DB에 저장하는 엔드포인트
app.post('/write', (req, res) => {
  const { post_id, title, content, name, nameInput, created_at, view_count } = req.body;
  const userId = req.session.user_id;

  // 사용자의 이름을 가져오기 위한 쿼리
  const sqlGetUserName = 'SELECT name FROM users WHERE user_id = ?';
  conn.query(sqlGetUserName, userId, (err, userResult) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching user data');
    } else {
      if (userResult.length > 0) { // 사용자 정보가 존재하는 경우
        const name = userResult[0].name; // 사용자 이름
        // 게시물 추가를 위한 SQL 쿼리
        const sql = 'INSERT INTO posts (post_id, title, content, name, nameInput, created_at, view_count) VALUES (?, ?, ?, ?, ?, ?, 0)';
        conn.query(sql, [post_id, title, content, name, nameInput, created_at, view_count], (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error creating post');
          } else {
            res.redirect('/community'); // 작성이 완료되면 커뮤니티 페이지로 리다이렉트
          }
        });
      } else { // 사용자 정보가 없는 경우
        res.status(404).send('User not found');
      }
    }
  });
});

// 특정 게시글의 내용을 가져오는 엔드포인트
app.get('/board/:postId', (req, res) => {
  const postId = req.params.postId;
  const sql = 'SELECT * FROM posts WHERE post_id = ?';
  conn.query(sql, postId, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching post content');
    } else {
      if (result.length > 0) {
        res.send(result[0]); // 게시글 내용을 JSON 형식으로 응답
      } else {
        res.status(404).send('Post not found');
      }
    }
  });
});

// viewPost 페이지 렌더링
app.get('/viewPost', (req, res) => {
  const postId = req.query.postId;
  console.log(postId)

  // postId를 이용하여 해당 게시글의 내용을 DB에서 조회
  const sqlGetPostContent = 'SELECT * FROM posts WHERE post_id = ?';
  conn.query(sqlGetPostContent, postId, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching post content');
      } else {
          const post = result[0];
          if (!post) {
              res.status(404).send('Post not found');
              return;
          }
          
          if (req.session.user_id) {
              // 사용자 인증이 되어 있으면 사용자 정보를 가져와서 함께 전달
              const sqlGetUserName = 'SELECT name FROM users WHERE user_id = ?';
              conn.query(sqlGetUserName, req.session.user_id, (err, userResult) => {
                  if (err) {
                      console.error(err);
                      res.status(500).send('Error fetching user data');
                  } else {
                      const userName = userResult[0].name;
                      res.render('viewPost', { post, name: userName });
                  }
              });
          } else {
              // 사용자 인증이 안 되어 있으면 게시글만 전달
              res.render('viewPost', { post });
          }
      }
  });
});


// POST /comments - 새로운 댓글 생성
router.post('/comments', (req, res) => {
  const { content } = req.body;
  const authorId = req.session.user_id || null; // 사용자가 인증되어 있지 않으면 null

  if (!content) {
    res.status(400).send('댓글 내용이 전달되지 않았습니다.');
    return;
  }

  const sql = 'INSERT INTO comments (content, author_id) VALUES (?, ?)';
  const values = [content, authorId];

  // 쿼리 실행
  conn.query(sql, values, (err, result) => {
      if (err) {
          console.error('댓글 생성 오류:', err);
          res.status(500).send('댓글 생성 실패');
          return;
      }
      console.log('댓글이 성공적으로 생성되었습니다.');
      res.status(201).send('댓글이 성공적으로 생성되었습니다.');
  });
});


app.get('/myPage', (req, res) => {
  if(req.session.user_id){
    let date = new Date()
    let month = date.getMonth() + 1
    let sevenDaysAgo = new Date(date);
    sevenDaysAgo.setDate(date.getDate() - 7)
    let dayOfSevenDaysAgo = sevenDaysAgo.getDate();

    const userId = req.session.user_id
    sql = 'SELECT name FROM users WHERE user_id = ?'
    conn.query(sql, userId, (err, result) => {
      if(err){
        res.send('Internal Server Error')
      } else {
        res.render('myPage', {name : result[0].name, month : month, sevenDaysAgo : dayOfSevenDaysAgo})
      }
    })
  } else {
    res.redirect('/signIn')
  }
})

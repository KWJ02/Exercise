const express = require('express')
const cookieParser = require('cookie-parser')
const mysql = require('mysql')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const moment = require('moment');
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(session)
const router = express.Router();
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
  res.render('recommend')
})
app.get('/test1', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
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

// ********************************** bmi기록
app.post('/bmiRecord', (req, res) => {
  const userInput = req.cookies;
  if(req.session.user_id){
    let id = req.session.user_id;
    let sql = 'SELECT name from users WHERE user_id = ?';
    conn.query(sql, id, (err, result) => {
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
      if(result.length > 0) {
        const date = new Date()
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0'); 
        timeStamp = `${year}-${month}-${day}`;

        let sql2 = 'INSERT INTO userinput (user_id, age, height, weight, bmi, date) VALUES (?,?,?,?,?,?)';
        conn.query(sql2, [id, userInput.age, userInput.height, userInput.weight, userInput.bmi, timeStamp], (err, rows) => {
          if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
          } else {
            res.render('bmiRecord', {alertMessage : '대시보드에 저장되었습니다.'});
          }
        });
      }
    });
  } else {
    res.redirect('../signIn');
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
    res.redirect('../signIn')
  }
})

app.post('/recommend', (req, res) => {
  if(req.session.user_id){
    let pos = req.body['options-position']
    let part = req.body['options-parts']
    let diff = req.body['options-difficulty'] // diff만 영어로, pos와 part는 한글로나옴

    let sql = 'SELECT name FROM exercise WHERE pos = ? AND part = ? ORDER BY RAND() LIMIT 1'
    conn.query(sql, [pos,part], (err, rows) => {
      if(err){
        console.log(err)
        res.send('Internal Server Error')
      }
      let name = rows[0].name
      res.render('recommend', {recResult : {name, pos, part, diff}})
    })
  } else {
    res.render('../signIn')
  }
})

app.get('/recommend', (req, res) => {
  if(req.session.user_id){
    res.render('recommend')
  } else {
    res.render('signIn')
  }
})


// ********************************** 운동 라이브러리
app.get('/exerciseLib', (req, res) => {
  res.send('운동 라이브러리 개설 예정')
})

app.get('/myPage/exerciseManage', (req, res) => {
  let sql = 'SELECT * FROM exercise'
  if(req.session.user_id === 'admin'){
    conn.query(sql,(err, rows) => {
      if(err){
        console.log(err)
        res.send('Internal Server Error')
      }
      res.render('exerciseManage', {rows : rows})
    })
  } else {
    res.redirect('/signIn')
  }
})

app.post('/myPage/exerciseManage', (req, res) => {
  let pos = req.body.pos
  let part = req.body.part
  let name = req.body.name

  let sql = 'INSERT INTO exercise (name, pos, part) VALUES (?,?,?)'
  conn.query(sql, [name, pos, part], (err, rows) => {
    if(err){
      console.log(err)
      res.send('Internal Server Error')
    }
    let sql2 = 'SELECT * FROM exercise'
    conn.query(sql2, (err, rows) => {
      if(err){
        console.log(err)
        res.send('Internal Server Error')
      }
      res.render('exerciseManage', {alertMessage : "성공적으로 저장되었습니다!", rows : rows})
    })
  })
})

app.post('/myPage/deleteExercise', (req, res) => {
  const id = req.body.id;
  console.log(`Received delete request for ID: ${id}`);
  const query = 'DELETE FROM exercise WHERE id = ?';
  conn.query(query, [id], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (result.affectedRows > 0) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: 'Not Found' });
    }
  });
});

app.get('/myPage/userManage', (req, res) => {
  if(req.session.user_id === 'admin'){
    res.render('userManage')
  } else {
    res.render('signIn')
  }
})


app.get('/community', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect('/signIn');
  }
  
  const query = req.query.query;
  const perPage = 6;
  let page = parseInt(req.query.page) || 1;

  let sql = 'SELECT name, user_id from users WHERE user_id = ?';
  conn.query(sql, userId, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }

    if (!result.length) {
      return res.redirect('/signIn');
    }

    const userName = result[0].name;
    let sqlPosts = `SELECT post_id, title, content, name, created_at, view_count FROM posts`;

    if (query) {
      sqlPosts += ` WHERE title LIKE '%${query}%' OR content LIKE '%${query}%'`;
    }

    sqlPosts += ` ORDER BY created_at DESC`;

    conn.query(sqlPosts, (err, postsResult) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching posts');
      }

      const totalPosts = postsResult.length;
      const totalPages = Math.ceil(totalPosts / perPage);

      // 페이지 번호가 범위를 벗어나지 않도록 조정
      if (page < 1) {
        page = 1;
      } else if (page > totalPages) {
        page = totalPages;
      }

      const startIndex = (page - 1) * perPage;
      const endIndex = Math.min(startIndex + perPage, totalPosts);

      const postsOnPage = postsResult.slice(startIndex, endIndex);
      postsOnPage.forEach(post => {
        post.created_at = moment(post.created_at).format('YYYY-MM-DD HH:mm:ss');
      });

      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      res.render('community', { name: userName, id: result[0].user_id, posts: postsOnPage, page, hasNextPage, hasPreviousPage });
    });
  });
});


// 커뮤니티 페이지에 새 게시물 추가하기
app.post('/community', (req, res) => {
  const { post_id, title, content, created_at } = req.body;
  const userId = req.session.user_id; // 세션에서 user_id 가져오기

  if (!userId) {
    return res.status(401).send('로그인이 필요합니다.');
  }

  // 사용자 이름을 가져오는 쿼리
  const sqlGetName = 'SELECT name FROM users WHERE user_id = ?';
  conn.query(sqlGetName, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).send('사용자 정보를 가져오는 중 오류가 발생했습니다.');
    }

    if (!userResult.length) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }

    const userName = userResult[0].name;

    // 게시물을 추가하는 쿼리
    const sqlInsertPost = 'INSERT INTO posts (post_id, title, content, name, created_at, view_count) VALUES (?, ?, ?, ?, ?, 0)';
    conn.query(sqlInsertPost, [post_id, title, content, userName, created_at], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('게시물을 작성하는 중 오류가 발생했습니다.');
      }
      res.redirect('/community'); // 새 게시물이 추가되면 커뮤니티 페이지로 리다이렉트
    });
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
  const { post_id, title, content, created_at } = req.body;
  const userId = req.session.user_id;

  // 사용자의 이름을 가져오기 위한 쿼리
  const sqlGetUserName = 'SELECT name FROM users WHERE user_id = ?';
  conn.query(sqlGetUserName, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching user data');
    } else {
      if (userResult.length > 0) { // 사용자 정보가 존재하는 경우
        const name = userResult[0].name; // 사용자 이름
        // 게시물 추가를 위한 SQL 쿼리
        const sql = 'INSERT INTO posts (post_id, title, content, name, created_at, view_count) VALUES (?, ?, ?, ?, ?, 0)';
        conn.query(sql, [post_id, title, content, name, created_at], (err, result) => {
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
  conn.query(sql, [postId], (err, result) => {
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

// 특정 게시글의 내용을 가져오는 엔드포인트
app.get('/viewPost', (req, res) => {
  const postId = req.query.postId;

  // postId를 이용하여 해당 게시글의 내용을 DB에서 조회
  const sqlGetPostContent = 'SELECT * FROM posts WHERE post_id = ?';
  conn.query(sqlGetPostContent, [postId], (err, postResult) => {
    if (err) {
      console.error(err);
      res.status(500).send('게시글 내용을 불러오는 중 오류가 발생했습니다.');
    } else {
      const post = postResult[0];
      if (!post) {
        res.status(404).send('게시글을 찾을 수 없습니다.');
        return;
      }

      // 댓글 가져오는 쿼리 수정
      const sqlGetComments = `
        SELECT 
          c.comment_id,
          c.content, 
          c.created_at, 
          (SELECT COUNT(*) FROM likes WHERE comment_id = c.comment_id) AS like_count, 
          u.name AS author_name
        FROM comments c 
        LEFT JOIN users u ON c.author_id = u.user_id 
        WHERE c.post_id = ? AND c.parent_comment_id IS NULL`;

      // 답글 가져오는 쿼리 수정
      const sqlGetReplies = `
        SELECT 
          r.reply_id,
          r.parent_comment_id,
          r.content AS reply_content,
          r.created_at AS reply_created_at,
          u_reply.name AS reply_author_name,
          (SELECT COUNT(*) FROM likes WHERE reply_id = r.reply_id) AS like_count
        FROM replies r
        LEFT JOIN users u_reply ON r.author_id = u_reply.user_id 
        WHERE r.post_id = ?`;

      conn.query(sqlGetComments, [postId], (err, commentsResult) => {
        if (err) {
          console.error(err);
          res.status(500).send('댓글을 불러오는 중 오류가 발생했습니다.');
          return;
        }

        const comments = commentsResult;

        conn.query(sqlGetReplies, [postId], (err, repliesResult) => {
          if (err) {
            console.error(err);
            res.status(500).send('답글을 불러오는 중 오류가 발생했습니다.');
            return;
          }

          // 댓글에 답글을 계층 구조로 추가
          const repliesByCommentId = repliesResult.reduce((acc, reply) => {
            acc[reply.parent_comment_id] = acc[reply.parent_comment_id] || [];
            acc[reply.parent_comment_id].push(reply);
            return acc;
          }, {});

          comments.forEach(comment => {
            comment.replies = repliesByCommentId[comment.comment_id] || [];
          });

          if (req.session.user_id) {
            // 사용자 인증이 되어 있으면 사용자 정보를 가져와서 함께 전달
            const sqlGetUserName = 'SELECT name FROM users WHERE user_id = ?';
            conn.query(sqlGetUserName, [req.session.user_id], (err, userResult) => {
              if (err) {
                console.error(err);
                res.status(500).send('사용자 정보를 불러오는 중 오류가 발생했습니다.');
              } else {
                const userName = userResult[0].name;
                post.view_count++;
                res.render('viewPost', { post, name: userName, comments });
              }
            });
          } else {
            // 사용자 인증이 안 되어 있으면 게시글과 댓글만 전달
            post.view_count++;
            res.render('viewPost', { post, comments });
          }
        });
      });
    }
  });
});

// 댓글 작성
router.post('/:postId/comment', (req, res) => {
  const postId = req.params.postId;
  const { content } = req.body;
  const authorId = req.session.user_id;

  if (!content) {
    return res.status(400).send('댓글 내용이 제공되지 않았습니다.');
  }

  const sql = 'INSERT INTO comments (post_id, content, author_id) VALUES (?, ?, ?)';
  const values = [postId, content, authorId];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error('댓글 작성 오류:', err);
      return res.status(500).send('댓글 작성 실패');
    }
    res.redirect(`/viewPost?postId=${postId}`);
  });
});

// 답글 작성
router.post('/:postId/reply', (req, res) => {
  const { content, parent_comment_id } = req.body;
  const postId = req.params.postId;
  const authorId = req.session.user_id || null;

  if (!content) {
    return res.status(400).send('답글 내용이 제공되지 않았습니다.');
  }

  // 트랜잭션 시작
  conn.beginTransaction((err) => {
    if (err) {
      console.error('트랜잭션 시작 오류:', err);
      return res.status(500).send('트랜잭션 시작 실패');
    }

    const sql = 'INSERT INTO replies (post_id, content, author_id, parent_comment_id) VALUES (?, ?, ?, ?)';
    const values = [postId, content, authorId, parent_comment_id];

    conn.query(sql, values, (err, result) => {
      if (err) {
        return conn.rollback(() => {
          console.error('답글 작성 오류:', err);
          return res.status(500).send('답글 작성 실패');
        });
      }

      conn.commit((err) => {
        if (err) {
          return conn.rollback(() => {
            console.error('트랜잭션 커밋 오류:', err);
            return res.status(500).send('트랜잭션 커밋 실패');
          });
        }

        console.log('답글이 성공적으로 작성되었습니다.');
        res.redirect(`/viewPost?postId=${postId}`);
      });
    });
  });
});

module.exports = router;

// 댓글 좋아요 라우터 정의
router.post('/:commentId/like', (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  // 사용자가 이미 좋아요를 눌렀는지 확인하는 SQL 쿼리
  const sqlCheckLike = 'SELECT COUNT(*) AS likeCount FROM likes WHERE comment_id = ? AND user_id = ?';
  conn.query(sqlCheckLike, [commentId, userId], (err, result) => {
    if (err) {
      console.error('좋아요 여부 확인 중 오류 발생:', err);
      return res.status(500).json({ error: '좋아요 여부 확인 실패' });
    }

    const likeCount = result[0].likeCount;

    if (likeCount > 0) {
      return res.status(400).json({ error: '이미 좋아요를 눌렀습니다.' });
    }

    // 좋아요 정보를 데이터베이스에 삽입하는 SQL 쿼리
    const sqlInsertLike = 'INSERT INTO likes (comment_id, user_id) VALUES (?, ?)';
    conn.query(sqlInsertLike, [commentId, userId], (err) => {
      if (err) {
        console.error('댓글 좋아요 처리 중 오류 발생:', err);
        return res.status(500).json({ error: '댓글 좋아요 처리 실패' });
      }

      // 증가된 좋아요 수를 확인하는 SQL 쿼리
      const sqlGetLikeCount = 'SELECT COUNT(*) AS likeCount FROM likes WHERE comment_id = ?';
      conn.query(sqlGetLikeCount, [commentId], (err, result) => {
        if (err) {
          console.error('좋아요 수 조회 중 오류 발생:', err);
          return res.status(500).json({ error: '좋아요 수 조회 실패' });
        }

        const updatedLikeCount = result[0].likeCount;
        res.json({ likeCount: updatedLikeCount });
      });
    });
  });
});

// 댓글 좋아요 취소 라우터 정의
router.post('/:commentId/unlike', (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  // 사용자의 좋아요 정보를 삭제하는 SQL 쿼리
  const sqlDeleteLike = 'DELETE FROM likes WHERE comment_id = ? AND user_id = ?';
  conn.query(sqlDeleteLike, [commentId, userId], (err) => {
    if (err) {
      console.error('댓글 좋아요 취소 중 오류 발생:', err);
      return res.status(500).json({ error: '댓글 좋아요 취소 실패' });
    }

    // 감소된 좋아요 수를 확인하는 SQL 쿼리
    const sqlGetLikeCount = 'SELECT COUNT(*) AS likeCount FROM likes WHERE comment_id = ?';
    conn.query(sqlGetLikeCount, [commentId], (err, result) => {
      if (err) {
        console.error('좋아요 수 조회 중 오류 발생:', err);
        return res.status(500).json({ error: '좋아요 수 조회 실패' });
      }

      const updatedLikeCount = result[0].likeCount;
      res.json({ likeCount: updatedLikeCount });
    });
  });
});

// 답글 좋아요 라우터 정의
router.post('/:replyId/like', (req, res) => {
  const replyId = req.params.replyId;
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  // 사용자가 이미 좋아요를 눌렀는지 확인하는 SQL 쿼리
  const sqlCheckLike = 'SELECT COUNT(*) AS likeCount FROM reply_likes WHERE reply_id = ? AND user_id = ?';
  conn.query(sqlCheckLike, [replyId, userId], (err, result) => {
    if (err) {
      console.error('좋아요 여부 확인 중 오류 발생:', err);
      return res.status(500).json({ error: '좋아요 여부 확인 실패' });
    }

    const likeCount = result[0].likeCount;

    if (likeCount > 0) {
      return res.status(400).json({ error: '이미 좋아요를 눌렀습니다.' });
    }

    // 좋아요 정보를 데이터베이스에 삽입하는 SQL 쿼리
    const sqlInsertLike = 'INSERT INTO reply_likes (reply_id, user_id) VALUES (?, ?)';
    conn.query(sqlInsertLike, [replyId, userId], (err) => {
      if (err) {
        console.error('답글 좋아요 처리 중 오류 발생:', err);
        return res.status(500).json({ error: '답글 좋아요 처리 실패' });
      }

      // 증가된 좋아요 수를 확인하는 SQL 쿼리
      const sqlGetLikeCount = 'SELECT COUNT(*) AS likeCount FROM reply_likes WHERE reply_id = ?';
      conn.query(sqlGetLikeCount, [replyId], (err, result) => {
        if (err) {
          console.error('좋아요 수 조회 중 오류 발생:', err);
          return res.status(500).json({ error: '좋아요 수 조회 실패' });
        }

        const updatedLikeCount = result[0].likeCount;
        res.json({ likeCount: updatedLikeCount });
      });
    });
  });
});

// 답글 좋아요 취소 라우터 정의
router.post('/:replyId/unlike', (req, res) => {
  const replyId = req.params.replyId;
  const userId = req.session.user_id;

  if (!userId) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  // 사용자의 좋아요 정보를 삭제하는 SQL 쿼리
  const sqlDeleteLike = 'DELETE FROM reply_likes WHERE reply_id = ? AND user_id = ?';
  conn.query(sqlDeleteLike, [replyId, userId], (err) => {
    if (err) {
      console.error('답글 좋아요 취소 중 오류 발생:', err);
      return res.status(500).json({ error: '답글 좋아요 취소 실패' });
    }

    // 감소된 좋아요 수를 확인하는 SQL 쿼리
    const sqlGetLikeCount = 'SELECT COUNT(*) AS likeCount FROM reply_likes WHERE reply_id = ?';
    conn.query(sqlGetLikeCount, [replyId], (err, result) => {
      if (err) {
        console.error('좋아요 수 조회 중 오류 발생:', err);
        return res.status(500).json({ error: '좋아요 수 조회 실패' });
      }

      const updatedLikeCount = result[0].likeCount;
      res.json({ likeCount: updatedLikeCount });
    });
  });
});

module.exports = router;

app.use('/comments', router);

// Reply posting
router.post('/:postId/reply', (req, res) => {
  const { content, parent_comment_id } = req.body;
  const postId = req.params.postId;
  const authorId = req.session.user_id || null; // If user is not authenticated, set to null

  if (!content) {
    res.status(400).send('Reply content not provided');
    return;
  }

  const sql = 'INSERT INTO replies (post_id, content, author_id, parent_comment_id) VALUES (?, ?, ?, ?)';
  const values = [postId, content, authorId, parent_comment_id];

  conn.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error creating reply:', err);
      res.status(500).send('Reply creation failed');
      return;
    }
    console.log('Reply successfully created.');
    res.redirect(`/viewPost?postId=${postId}`);
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
        if(req.session.user_id === "admin"){
          res.render('adminPage', {name : result[0].name, month : month, sevenDaysAgo : dayOfSevenDaysAgo})
        } else {
          res.render('myPage', {name : result[0].name, month : month, sevenDaysAgo : dayOfSevenDaysAgo})
        }
      }
    })
  } else {
    res.redirect('/signIn')
  }
})
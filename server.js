const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const bodyParser= require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const helmet = require('helmet');

app.use(helmet());
app.disable('x-powered-by');

require('dotenv').config();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;
const port = process.env.PORT;
var db;

app.listen( port, function(){
  console.log ('listening on port: '+port)
});
////////////////////db연결
console.log ('connect to DB')
MongoClient.connect(process.env.DB_URL, {useUnifiedTopology: true },function(에러, client){
    if (에러) return console.log(에러);

    db = client.db('IS')
    
  })


///////////////////포트설정




  

  // Passport.js 세션관련///////////////////////////////////////////////////////////////////////////
  const passport = require('passport');
  const LocalStrategy = require('passport-local').Strategy;
  const session = require ('express-session');

  app.use(session({name:'Login',secret : '비밀코드', resave : false , saveUninitialized : false}));
  app.use(passport.initialize());
  app.use(passport.session());
  //요청과 응답 사이에 뭔가 실행되는 코드들 app.use(미들웨어), isAuthenticated()로 로그인한지아닌지 파악가능
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});
  
//<<<<<<<<<<<<<<<<<<<///////////////세션만들기//////////////////////////////////////////
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'Password',
    session: true, //세션을 서버에 만들것인지 
    passReqToCallback: false, //email, password말고도 더 검증하고 싶으면 true로 바꾸고
  }, function (입력한아이디, 입력한비번, done) { // 여기에 매개변수로 더 넣을 수 있음
    console.log(입력한아이디, 입력한비번);

    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(입력한비번, salt, function(err, hash) {
          // Find hash in your password DB.
          db.collection('User').findOne({ email: 입력한아이디 }, function (에러, 결과) {
            if (에러) return done(에러);
            if (!결과) return done(null, false, { message: '존재하지않는 아이디요' });
              const match = bcrypt.compareSync(입력한비번,결과.비밀번호);
                console.log(match);
              if(match){
                return done(null, 결과);
              }else{
                return done(null, false, { message: '비번틀렸어요' });
              }
          });//db닫기  
  });//bycrypt hash 닫기
  }); // gensalt 닫기

} ));
 //////////////////세션만들기////////////////////////////////////////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  //검사끝
  passport.serializeUser(function (user, done) { // 여기 user는 위에 검증이 성공했을 시에 결과가 들어옴
    console.log(user);
    done(null, user.email) // email를 사용해서 세션을 저장
  });
  // id를 사용해서 세션을 저장시키는 코드(로그인 성공시 발동)
  passport.deserializeUser(function (email, done) {//email = 위의 user.email
    console.log('deserializeUser',email );
    db.collection('User').findOne({ email: email }, function (에러, 결과) {
      done(null, 결과);
    })
  }); 
  //이 세션 데이터를 가진 사람을 db에서 찾아와 주세요(마이페이지 접속시 발동)

  //로그인 했는지 아닌지 미들웨어
  function 로그인했니(요청, 응답, next) { 
    console.log(요청.user);
    if (요청.user) { 
      next() 
    } 
    else { 
      응답.send('로그인해라'); 
    } 
  } 
  app.get('/debug', function(요청,응답){
    응답.json({
      "세션": 요청.session, // 세션 데이터
      "유저": 요청.user, // 유저 데이터(뒷 부분에서 설명)
      "요청패스포트": 요청._passport, // 패스포트 데이터(뒷 부분에서 설명)
    })
}) // 세션정보 볼 페이지...



//index 페이지//////////////////////////////////////////////////////////////////////////////////////////////
app.get('/', function(요청, 응답){
  
  응답.render('index.ejs'
  )
})
//로그인 로그아웃 Register관련 라우터////////////////////////////////////////////////////////////////////////
app.get('/Login', function(요청, 응답){
  응답.render('Login.ejs')
})

app.post('/Loginprocess',passport.authenticate('local',{
  failureRedirect : '/fail'
}),function(요청, 응답){
  console.log('로그인완료')
    요청.session.save(function(){
      console.log(요청.session);
      응답.redirect('/')
    });
  });

app.get('/Logout', function(req, res){ 
  
  console.log(req.session);
  req.logout();
  console.log(req.session);
  //console.log(req.user);
  res.redirect('/'); });

app.get('/fail', function(요청, 응답){
    응답.render('fail.ejs')
})
app.get('/noright', function(요청, 응답){
  응답.render('noright.ejs')
})
app.get('/Register', function(요청,응답){
  응답.render('./Register/Register.ejs')
});


app.post('/RegisterID',function(요청, 응답){
  let code = ['1단계','2단계','3단계','4단계','5단계']; // 허락할 코드
  let 권한 = ['1','2','3','4','5'];
  if(!code.includes(요청.body.code)){
    응답.render('./wrongcode.ejs');
  }else{
      let indexofcode = code.indexOf(요청.body.code,0);
      요청.body.right = 권한[indexofcode];              //권한 부여
      bcrypt.genSalt(saltRounds, function(err, salt) { //비밀번호 암호화해서 저장하기
        bcrypt.hash(요청.body.password, salt, function(err, hash) {
            // Store hash in your password DB.
            console.log(요청.body.password,hash);
            db.collection('User').insertOne( {이름 : 요청.body.name, _id : 요청.body.studentID, email : 요청.body.email, 비밀번호 : hash, 닉네임: 요청.body.nickname, 권한: 요청.body.right} , function(에러, 결과){
              if(에러){console.log(에러)}
              console.log('저장완료');
              응답.redirect('/');})
        });
    });
}

});









// Navbar Router //////////////////////////////////////////////////////////////////////////
//app.use('/', require('./routes/Study2022.js'));
app.use('/', require('./routes/Study2022.js')); //Study2022
app.use('/', require('./routes/Project2022.js'));//project2022
app.use('/', require('./routes/edu.js')); //교육자료
app.use('/', require('./routes/announce.js')); //공지사항
app.use('/', require('./routes/news.js')); //뉴스
app.use('/', require('./routes/archive.js')); //Archive
//삭제검색//////////////////////////////////////////////////////////////////

app.delete('/delete',로그인했니 ,function(요청,응답){
  요청.body._id=parseInt(요청.body._id)
  var 삭제할데이터 = {_id : 요청.body._id, Author:요청.user.닉네임}
  console.log(삭제할데이터);
  db.collection('posting').deleteOne(삭제할데이터, function(에러, 결과){
      console.log(결과);
      if(에러){console.log(에러)}
      응답.status(200).send({message: '성공 '});
  });
})

app.get('/search', (요청, 응답)=>{
  console.log(요청.query);
  var 검색조건 = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: 요청.query.value,
          path: ['title', 'description']  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        }
      }
    },
    // id 순 정렬 { $sort : { _id : 1 } },
    { $project : { title : 1, _id : 1, score: {$meta: "searchScore"} } } //score 순 정렬
  ]
  db.collection('posting').aggregate(검색조건).toArray((에러, 결과)=>{
    console.log(결과)
    응답.render('search.ejs', { 글목록 : 결과});
  })
})
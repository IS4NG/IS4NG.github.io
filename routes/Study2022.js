/////다른것도 이것처럼 나누긴해야함....
var router = require('express').Router();
var db;
markdown=require('markdown').markdown;
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(process.env.DB_URL, {useUnifiedTopology: true },function(에러, client){
    if (에러) return console.log(에러);
    
    db = client.db('IS')

  })


  function 로그인했니(요청, 응답, next) { 
    console.log(요청.user);
    if (요청.user) { 
      next() 
    } 
    else { 
      응답.render('Login.ejs') 
    } 
  } 



router.get('/Study/2022', function(요청,응답){
    console.log(요청.user);
    var searchquery = { board : 'Study2022'};
    db.collection('posting').find(searchquery).sort({_id:-1}).toArray(function(에러, 결과){
      console.log(결과);
        응답.render('./2022s/2022a.ejs', { 글목록 : 결과});
    });
  })

  router.get('/Study/2022/create',  로그인했니,function(요청,응답){
    응답.render('./2022s/create.ejs')
  })
  router.post('/Study/2022/post',로그인했니,function(요청,응답){
    let today = new Date();
    let year = today.getFullYear(); 
    let month = today.getMonth() + 1
    let date = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    요청.body.time = year +'-' +month +'-' +date +' ' +hours + ':' + minutes + ':' + seconds;
    요청.body.board = 'Study2022'
    
    db.collection('counter').findOne({name:'posting'},function(에러, 결과){
        var 게시물갯수 = 결과.totalPost
        db.collection('posting').insertOne( {_id: 게시물갯수 ,board : 요청.body.board, title : 요청.body.제목, time : 요청.body.time ,reference : 요청.body.reference, description : 요청.body.description, Author : 요청.user.닉네임, Power : 요청.user.권한} , function(에러, 결과){
            
            db.collection('counter').updateOne({name:'posting'},{ $inc : {totalPost:1}},function(에러,결과){
                if(에러){return console.log(에러)}
                console.log('저장완료');  
                응답.redirect('/Study/2022');
            })
        })
        
    });
  
  })

  router.get('/Study2022/detail/:id', function(요청, 응답){
    db.collection('posting').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
      결과.description = markdown.toHTML(결과.description);
      응답.render('2022s/2022b.ejs', {data : 결과} )
    })
  });
  
  router.get('/Study2022/edit/:id', 로그인했니,function(요청, 응답){
    요청.body._id = parseInt(요청.params.id);
    console.log(요청.body._id);
    var 수정할데이터 = {_id : 요청.body._id, Author:요청.user.닉네임}
    db.collection('posting').findOne(수정할데이터, function(에러, 결과){
        if(에러||결과==null||결과==undefined||결과==NaN){
          console.log('권한이없습니다.');
          응답.redirect('/noright');}else{
        응답.render('2022s/edit.ejs', {data : 결과} )
          }
    })
  });
  router.post('/Study2022/edit/put',function(요청,응답){
    let today = new Date();
    let year = today.getFullYear(); 
    let month = today.getMonth() + 1
    let date = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    요청.body.time = year +'-' +month +'-' +date +' ' +hours + ':' + minutes + ':' + seconds;
    요청.body.description = 요청.body.description + '\n' + '['+요청.body.time +'에 수정됨]';
    db.collection('posting').updateOne({_id : parseInt(요청.body.id) },{$set : { title : 요청.body.제목, reference : 요청.body.reference, description : 요청.body.description}} ,function(에러, 결과){
        if(에러){console.log(에러)}
        console.log(결과);
        응답.redirect('/Study/2022')
    })
  });




module.exports = router;
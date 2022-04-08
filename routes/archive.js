////Project2022
var router = require('express').Router();
var db;
require('dotenv').config();
markdown=require('markdown').markdown;
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



router.get('/Archive', function(요청,응답){
    console.log(요청.user);
    var searchquery = { board : 'Archive'};
    db.collection('posting').find(searchquery).sort({_id:-1}).toArray(function(에러, 결과){
      console.log(결과);
        응답.render('./Archive/Archivea.ejs', { 글목록 : 결과});
    });
  })

  router.get('/Archive/create',  로그인했니,function(요청,응답){
    응답.render('./Archive/create.ejs')
  })
  router.post('/Archive/post',로그인했니,function(요청,응답){
    let today = new Date();
    let year = today.getFullYear(); 
    let month = today.getMonth() + 1
    let date = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    요청.body.time = year +'-' +month +'-' +date +' ' +hours + ':' + minutes + ':' + seconds;
    요청.body.board = 'Archive'
    
    db.collection('counter').findOne({name:'posting'},function(에러, 결과){
        var 게시물갯수 = 결과.totalPost
        db.collection('posting').insertOne( {_id: 게시물갯수 ,board : 요청.body.board, title : 요청.body.제목, time : 요청.body.time ,reference : 요청.body.reference, description : 요청.body.description, Author : 요청.user.닉네임, Power : 요청.user.권한} , function(에러, 결과){
            
            db.collection('counter').updateOne({name:'posting'},{ $inc : {totalPost:1}},function(에러,결과){
                if(에러){return console.log(에러)}
                console.log('저장완료');  
                응답.redirect('/Archive');
            })
        })
        
    });
  
  })

  router.get('/Archive/detail/:id', function(요청, 응답){
    db.collection('posting').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
      결과.description = markdown.toHTML(결과.description);
      응답.header("Content-Security-Policy", "img-src * ");
      응답.header("Cross-Origin-Embedder-Policy", "credentialless");  
      응답.render('./Archive/Archiveb.ejs', {data : 결과} )
    })
  });
  
  router.get('/Archive/edit/:id', 로그인했니,function(요청, 응답){
    요청.body._id = parseInt(요청.params.id);
    var 수정할데이터 = {_id : 요청.body._id}
    db.collection('posting').findOne(수정할데이터, function(에러, 결과){
        console.log(결과);
        if(에러||결과==null||결과==undefined||결과==NaN){응답.redirect('/noright');}else{
        응답.render('Archive/edit.ejs', {data : 결과} )
      }
    })
  });
  router.post('/Archive/edit/put',function(요청,응답){
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
        응답.redirect('/Archive')
    })
  });




module.exports = router;
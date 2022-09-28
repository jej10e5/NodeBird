const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); //추가적인 로그를 위한 패키지
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

const {sequelize} = require('./models');
const passportConfig = require('./passport');

const app = express();
passportConfig(); //패스포트 설정
app.set('port',process.env.PORT || 8001);
app.set('view engine','html');

nunjucks.configure('views',{
    express:app,
    watch:true,
});

sequelize.sync({force:false})
    .then(()=>{
        console.log('데이터베이스 연결 성공');
    })
    .catch((err)=>{
        console.error(err);
    });

app.use(morgan('dev'));//개발 환경에서의 추가적인 로그
//정적인 파일들을 제공하는 패키지 - static
app.use(express.static(path.join(__dirname,'public'))); //css나 html, js 파일을 한군데 모아놓고 연결하여 쓰기 위함
app.use('/img',express.static(path.join(__dirname,'uploads'))); //uploads에 있는 파일만 제공
//요청 본문에 있는 데이터를 해석해서 req.body 객체로 만들어주는 미들웨어 body-parser (express내장)
app.use(express.json());//json형식의 데이터 전달방식
app.use(express.urlencoded({extended:false})); //폼전송 방식 : url-encoded, 
//extended:false 이면 querystring모듈을 사용하여 쿼리 스트링해석, true면 qs모듈을 사용하여 해석 (qs는 querystring 모듈 기능을 좀 더 확장한 모듈)

//요청에 동봉된 쿠키를 해석해 req.cookies 객체로 만듦
app.use(cookieParser(process.env.COOKIE_SECRET)); //비밀키 넣어주기

//express-session 세션 관리용 미들웨어, 데이터를 임시적으로 저장할 때 유용
//세션 관리 시 클라이언트에 쿠키를 보냄.
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET, //cookie와 비밀키 같게
    cookie:{
        httpOnly:true,
        secure:false, //https 환경이 아닐때도 사용하기 위함
    },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/',pageRouter); // ./routes/page으로 연결
app.use('/auth',authRouter);
app.use('/post',postRouter);
app.use('/user',userRouter);

app.use((req,res,next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
})

app.use((err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
})
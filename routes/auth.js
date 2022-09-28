const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const { route } = require('./page');

const router = express.Router();

//post /join -> 회원가입
router.post('/join',isNotLoggedIn, async(req,res,next)=>{
    const{email,nick,password} = req.body; //정보를 받아옴
    try{
        const exUser = await User.findOne({where:{email}}); //기존의 db에 같은 이메일이 존재하면
        if(exUser){
            return res.redirect('/join?error=exist'); //리다이렉트
        }
        //그렇지 않다면
        const hash = await bcrypt.hash(password,12); //비밀번호 암호화
        await User.create({
            email,
            nick,
            password:hash,
        });
        return res.redirect('/'); //메인화면으로 이동
    }catch(error){
        console.error(error);
        return next(error);
    }
});

//post /login -> 로그인
router.post('/login',isNotLoggedIn, async(req,res,next)=>{
    passport.authenticate('local',(authError,user,info)=>{
        if(authError){
            console.error(authError);
            return next(authError);
        }
        if(!user){
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user,(loginError)=>{
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req,res,next);
});

//get /logout -> 로그아웃
router.get('/logout',isLoggedIn,(req,res)=>{
    //req.logout(); 기존에는 이렇게 사용되었으나
    //asynchronous function으로 바뀌어 다음처럼 사용된다.
    req.logout(function(err){
        if(err){return next(err);}
        req.session.destroy(); //세션에 저장된 정보 지우기
        res.redirect('/'); //메인페이지로 돌리기
    }); //req.user객체를 제거
    console.log("로그아웃");
});


router.get('/kakao',passport.authenticate('kakao'));

router.get('/kakao/callback',passport.authenticate('kakao',{
    failureRedirect:'/',
}), (req,res)=>{
    res.redirect('/');
});

module.exports=router;



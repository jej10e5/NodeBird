//웹 서버 프레임워크 모듈 추가하기
const express = require('express');
//라우터에 접근 권한을 제어하는 미들웨어 추가하기
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {Post,User,Hashtag} = require('../models');

//라우터 사용을 위해 express에 내장된 router사용
const router = express.Router();

router.use((req,res,next)=>{
    //초기화
    res.locals.user = req.user; //세션에 저장된 user의 정보 가져오기
    res.locals.followerCount = req.user? req.user.Followers.length:0;
    res.locals.followingCount = req.user? req.user.Followings.length:0;
    res.locals.followerIdList=req.user? req.user.Followers.map(f=>f.id):[];
    next(); //다음 미들웨어로 넘기기
});

//GET /profile
router.get('/profile',isLoggedIn,(req,res)=>{ 
    res.render('profile',{title:'내 정보 - NodeBird'});
});

//GET /join
router.get('/join',isNotLoggedIn,(req,res)=>{
    res.render('join',{title:'회원가입 - NodeBird'});
});

//GET /
router.get('/', async (req,res,next)=>{
    try{
        //posts테이블을 모두 가져오면서
        const posts = await Post.findAll({
            //관련된 users도 가져오는데
            include:{//join의 역할
                model:User,
                //users 중에서 id랑 nick만 가져옴
                attributes:['id','nick'],
            },
            order:[['createdAt','DESC']],
        });
        res.render('main',{
            title:'NodeBird',
            twits: posts,
    });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/hashtag',async(req,res,neaxt)=>{
    const query = req.query.hashtag; //쿼리스트링으로 해시태그 이름을 받고 
    if(!query){ //해쉬태그가 없으면 메인화면으로 리다이렉트
        return res.redirect('/');
    }
    try{
        const hashtag = await Hashtag.findOne({where:{title:query}});
        let posts=[];
        if(hashtag){
            posts = await hashtag.getPosts({include:[{model:User}]});
        }
        return res.render('main',{
            title:`${query}|NodeBird`,
            twits:posts,
        });
    }catch(error){
        console.error(error);
        return next(error);
    }
})

module.exports = router;
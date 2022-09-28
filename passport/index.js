const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

//passport 모듈 내부에는 serialize와 deserialize가 있음
module.exports=()=>{
    //로그인시 실행
    passport.serializeUser((user,done)=>{
        done(null,user.id); //첫번째 인수는 error, 두번째 인수에는 저장하고 싶은 데이터
        //사용자의 정보 객체를 세션에 아이디로 저장
    });

    //매 요청시 실행
    //serialize에서 done의 두번째 인수로 넣었던 것이
    //deserialize에서 첫번째 인수가 됨
    passport.deserializeUser((id,done)=>{
        User.findOne({
            where:{id},
            include:[{
                model:User,
                attributes:['id','nick'],
                as:'Followers',
            },{
                model:User,
                atrributes:['id','nick'],
                as:'Followings',
            }],
        })
            .then(user=>done(null,user)) //req.user에 저장
            .catch(err=>done(err));
        //세션에 저장한 아이디를 통해 사용자 정보 객체를 불러옴
    });
    
    local();
    kakao();
};


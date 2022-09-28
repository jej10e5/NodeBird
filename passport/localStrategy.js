const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
    }, async (email,password, done)=>{
        try{
            //전달받은 email가 User에 있는지 찾기
            const exUser = await User.findOne({where:{email}});
            if(exUser){
                //비밀번호는 암호화해서 저장했기 때문에 bcrypt.
                //compare을 사용해서 db에 있는 비밀번호와 전달받은 비밀번호를 비교한다.
                const result = await bcrypt.compare(password, exUser.password);
                if(result){
                    done(null,exUser);
                }else{
                    done(null, false, {message : '비밀번호가 일치하지 않습니다.'});
                }
            }else{ //User에 없는 eamil 
                done(null,false,{message:'가입되지 않은 회원입니다.'});
            }
        }catch(error){
            console.error(error);
            done(error);
        }
    }));
};
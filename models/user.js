//mysql을 사용하기 위해 sequelize 모듈 추가
const Sequelize = require('sequelize');

//사용자의 정보를 저장하는 User 모델 만들기
//email, nick(닉네임), password, provider(로컬 로그인인지 zsns로그인인지), snsId(sns로그인시 로그인 아이디)
module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            email:{
                type:Sequelize.STRING(40),
                allowNull:true,
                unique:true,
            },
            nick:{
                type:Sequelize.STRING(15),
                allowNull:false,
            },
            password:{
                type:Sequelize.STRING(100),
                allowNull:true,
            },
            provider:{
                type:Sequelize.STRING(10),
                allowNull:false,
                defaultValue:'local',
            },
            snsId:{
                type:Sequelize.STRING(30),
                allowNull:true,
            },
        },{
            sequelize,
            timestamps:true, //createdAt, updateAt
            underscored:false,
            modelName:'User',
            tableName:'users',
            paranoid:true, //deleteAt
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    //다른 테이블과의 관계
    static associate(db){
        //한 user는 여러개의 post를 작성할 수 있음, 1(User):N(Post)
        db.User.hasMany(db.Post);
        // User 한 명이 여러명의 팔로워를 가질 수 있고
        // User 한 명이 여러명을 팔로잉 할 수 도 있음  -> N : M 관계
        // N:M 관계에서는 model 이름을 through 옵션을 통해 설정 할 수 있음
        db.User.belongsToMany(db.User,{
            foreingKey:'followingId',
            as:'Followers',
            through:'Follow',
        });
        db.User.belongsToMany(db.User,{
            foreingKey:'followingId',
            as:'Followings',
            through:'Follow',
        })
    }
}


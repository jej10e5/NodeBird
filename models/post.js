const Sequelize = require('sequelize');

//content, img
module.exports = class Post extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            content:{
                type:Sequelize.STRING(140),
                allowNull:false,
            },
            img:{
                type:Sequelize.STRING(200),
                allowNull:true,
            },
        },{
            sequelize, 
            timestamps:true, 
            underscored:false,
            modelName:'Post',
            tableName:'posts',
            paranoid:false,
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci',
        });
    }
    static associate(db){
        //한명의 사용자가 여러개의 게시글을 작성할 수 있음 1 (User):N (Post)
        db.Post.belongsTo(db.User);
        //한개의 포스터에는 여러개의 해쉬태그가 달릴 수 있다.
        //한개의 해쉬태그는 여러 포스터에 포함 될 수 있다.  -> N:M 관계
        db.Post.belongsToMany(db.Hashtag, {through:'PostHashtag'});
    }
}
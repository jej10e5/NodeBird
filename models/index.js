//시퀄라이즈는 모델과 mysql의 테이블을 연결해주는 역할
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

//model불러오기
const User = require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
//db객체에 모델 담기
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

//db와 model 연결
User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);

//다른 테이블과의 관계 연결하기
User.associate(db);
Post.associate(db);
Hashtag.associate(db);

module.exports = db;

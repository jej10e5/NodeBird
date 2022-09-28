const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {Post, Hashtag} = require('../models');
const {isLoggedIn} =require('./middlewares');

const router = express.Router();

try{
    fs.readdirSync('uploads');
}catch(error){
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage:multer.diskStorage({
        destination(req,file,cb){
            cb(null,'uploads/');
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null,path.basename(file.originalname,ext)+Date.now()+ext);
        },
    }),
    limits:{fileSize:5*1024*1024},
});

//POST /post/img -> 이미지 업로드
router.post('/img',isLoggedIn, upload.single('img'),(req,res)=>{
    console.log(req.file);
    res.json({url:`/img/${req.file.filename}`}); //이미지 저장
});

const upload2 = multer();
router.post('/',isLoggedIn, upload2.none(), async(req,res,next)=>{
    try{
        const post = await Post.create({
            content: req.body.content,
            img:req.body.url,
            UserId:req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s#]+/g); //해쉬태그 뽑아내기
        if(hashtags){
            const result = await Promise.all(
                hashtags.map(tag => {
                    return Hashtag.findOrCreate({ //findOrCreate 시퀄라이즈는 있으면 찾아오고 없으면 만들어냄
                        where:{title:tag.slice(1).toLowerCase()}, //앞에 붙은 #을 제거하고 소문자로 바꾸어서 저장
                    })
                }),
            );
            await post.addHashtags(result.map(r=>r[0])); //결과값으로 [모델,생성여부]를 반환하므로 모델만 추출
        }
        res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
});

module.exports=router;
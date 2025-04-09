import dotenv from 'dotenv'; 
dotenv.config();

import path from 'path';

import { unlink,access } from 'fs';

import express from 'express';
const server = express();

import cors from 'cors'; 
server.use(cors());



import multer from 'multer'
const storage = multer.diskStorage({
    destination: "./upload/img_ideas",
    
    filename: (request, file, callback) => {
        const newFileName = Math.floor(Math.random() * 801) * Math.floor(Math.random() * 742) + Math.floor(Math.random() * 218) ;
        const ext = path.extname(file.originalname);
        callback(null, newFileName + ext);
        
      }
      
});
const upload = multer({ storage : storage })



import { readIdeas,createIdea,deleteIdea,checkUser,addLike,readLikes } from './data_base.js'


server.use(express.urlencoded({ extended: true }));
server.use(express.json());

/*
if(process.env.TESTS){
    server.use("/tests",express.static("./tests")); 
}
*/

server.post("/home", async (request,response,next) => {
    try{
       
        let user_name = request.body.username;
        let userpassword = request.body.password;

        let match = await checkUser(user_name,userpassword);
        
        if(match){
            
            response.status(200);

            return response.send(match)
        }
        next()

       
    }catch(error){
        response.status(500);

        response.json({ error : error });
    }
})


server.get("/ideas", async (request,response) => {
    try{
        let ideas = await readIdeas();

        response.json(ideas);

    }catch(error){

        response.status(500);

        response.json({ error : "server error" })
    }
});

server.get("/idea/:id", (request,response) => {
    
})

server.post("/upload/img_ideas", upload.single("img"), async (request,response) => {
    try{
        console.log("contenido del request",request)
        console.log("contenido del request.file",request.file)
        const idea_name = request.body.filename;
        const file_name = request.file.filename;
        const extension = path.extname(request.file.originalname);
        /*
        response.json({ 
            url : `/upload/img_ideas/${newFileName}`,
            fileName :  file_name,
            ideaName : idea_name
        });
*/      
        let id = await createIdea(file_name,idea_name);
        console.log("este es el id", id)
        return response.json({id});

       
    }catch(error){
        response.status(500);
        console.log("aqui el error 500 del middleware upload img",error)
        response.json({ error : "server error"});
    }
    
})

server.use('/upload', express.static('upload'));


server.delete("/idea/delete/:id", async (request,response,next) => {
    try{

        let deletedIdea = await deleteIdea(request.params.id);

        if(deletedIdea == 1){
            response.status(204);

            return response.send("");
        }

        next();


    }catch(error){

        response.status(500);

        response.json({ error : "server error" });

    }
})

/*
server.get("/upload/img_ideas", async (req,res) => {
    try{
    
        let ideas = await readIdeas()

        respuesta.json(ideas)
    }catch(error){
        res.status(500);

        res.json({ error : "error en el servidor"});
    }  
})
*/

server.post("/add-like", async (request,response) => {

    let {likes,user} = request.body

    try{
        
        let id = await addLike({likes,user});

        return response.json({likes});

    }catch(error){

        response.status(500);

        response.json({ error : error })

    }
    
})

server.post("/likes", async (request,response) => {




    
    console.log("request.body es igual a",request.body)
    let {user} = request.body
    
    try{
        let likes = await readLikes({user});
        console.log("respnse en index?js",request.body);
        response.json({likes});

    }catch(error){

        response.status(500);

        response.json({ error : error })
    }
    
});


server.use((error,request,response,next) => { 

    response.status(400); 
    console.log("middleware 400")

    response.json({ error : "request error" });
});

server.use((request,response) => { 

    response.status(404);
    console.log("middleware 404")

    response.send("404 not found");
});

server.listen(process.env.PORT);
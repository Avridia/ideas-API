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



import { readIdeas,createIdea,deleteIdea } from './data_base.js'


server.use(express.urlencoded({ extended: true }));
server.use(express.json());


if(process.env.TESTS){
    server.use("/tests",express.static("./tests")); 
}


server.get("/ideas", async (request,response) => {
    try{
        let ideas = await readIdeas();

        response.json(ideas);

    }catch(error){

        response.status(500);

        response.json({ error : "server error" })
    }
});


server.post("/upload/img_ideas", upload.single("img"), async (request,response) => {
    try{
       
        const idea_name = request.body.filename;
        const file_name = request.file.filename;
        const extension = path.extname(request.file.originalname);
        const newFileName = `${file_name}${extension}`;
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

        response.json({ error : "server error"});
    }
    
})

server.use('/upload', express.static('upload'));


server.delete("/idea/delete/:id", async (request,response,next) => {
    try{

        let deletedIdea = await deleteIdea(request.params.id);


        if(deletedIdea == 1){
            response.status(204);

            unlink("../upload/img_ideas/:id", (error) => {
                if(error){
                    return console.log("ha habido un error",error)
                }
                console.log("se ha verificado el archivo")
            })

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

server.listen(process.env.PORT);
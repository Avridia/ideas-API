/* __________ MODULES IMPORTATION ______________________________ */
import dotenv from 'dotenv'; 
dotenv.config();

import path from 'path';


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

/* __________ FUNCTIONS IMPORTATION ______________________________ */
import { readIdeas,createIdea,deleteIdea,checkUser,addLike,readLikes,infoModal,editInfo,deleteLike } from './data_base.js'


/* __________ MIDDLEWARES ______________________________ */
server.use(express.urlencoded({ extended: true }));
server.use(express.json());


server.post("/home", async (request,response,next) => { /* for username y password verification */
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


server.get("/ideas", async (request,response) => { /* to get the ideas from the data base */
    try{

        let ideas = await readIdeas();

        response.json(ideas);

    }catch(error){

        response.status(500);

        response.json({ error : "server error" })
    }
});


server.post("/upload/img_ideas", upload.single("img"), async (request,response) => { /* to upload files from the app to the data base */
    try{

        const idea_name = request.body.filename;
        const file_name = request.file.filename;
     
        let id = await createIdea(file_name,idea_name);
        
        return response.json({id});

       
    }catch(error){

        response.status(500);
        
        response.json({ error : "server error"});
    }
    
})

server.use('/upload', express.static('upload'));


server.delete("/idea/delete/:id", async (request,response,next) => { /* to delete an idea from the data base */
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


server.post("/add-like", async (request,response) => { /* to add a like */

    let {likes,user,likesDBLoading} = request.body

    try{
        
        let id = await addLike({likes,user,likesDBLoading});

        return response.json({likes});

    }catch(error){

        response.status(500);

        response.json({ error : error })

    }
    
})

server.post("/likes", async (request,response) => { /* to read the likes from the data base */

    let {user} = request.body
    
    try{

        let likes = await readLikes({user});
        
        response.json({likes});

    }catch(error){

        response.status(500);

        response.json({ error : error })
    }
    
});

server.post("/modal/:id", async (request,response) => { /* to get the extra informacion from the data base */
   
    let {id} = request.body;

    try{

        let {idea_name,info} = await infoModal({id});

        response.json({idea_name,info})

    }catch(error){

        response.status(500);

        response.json({ error : error })
    }
})


server.put("/likes/edit/text/:id", async (request,response) => { /* to modify the extra information */

    try{

        let {infoCard} = request.body; 
     
        let EditedInfo = await editInfo(infoCard,request.params.id);

        response.status(204);

        return response.send("");
        

    }catch(error){

        response.status(500);

        response.json({ error : "server error" });

    }
})

server.delete("/likes/delete/:id", async (request,response) => { /* to delete a like from the data base */
    try{

        let {user} = request.body

        let deletedLike = await deleteLike(user,request.params.id);

        if(deletedLike == 1){
            response.status(204);

            return response.send("");
        }

    }catch(error){

        response.status(500);
     
        response.json({ error : "server error" });

    }
})


server.use((error,request,response,next) => { /* error middleware */

    response.status(400); 

    response.json({ error : "request error" });
});

server.use((request,response) => { /* NEXT middleware */

    response.status(404);

    response.send("404 not found");
});

server.listen(process.env.PORT);
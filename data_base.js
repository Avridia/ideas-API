/* __________ MODULES IMPORTATION ______________________________ */
import postgres from 'postgres';
import dotenv from 'dotenv'; 
dotenv.config();

/* __________ FUNCTIONS ______________________________ */
function conect(){ 
    return postgres({
        host : process.env.DB_HOST,
        port : process.env.DB_PORT,
        database : process.env.DB_NAME,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD
    });
}


export function checkUser(user_name,userpassword){
    return new Promise((fulfill,reject) => {

        const conexion = conect();

        conexion`SELECT * FROM users WHERE user_name = ${user_name}`
        .then( user => {
            conexion.end();

            if(user.length == 0){
                return reject({ error : "user not found in the database" })
            }
            return user[0].user_password == userpassword ? fulfill(user) : reject({ error : "password doesn't match with user" })
        })
        .catch( error => {
            conexion.end();
            reject({ error : "data base error" });
        });
    });
}

export function readIdeas(){
    return new Promise((fulfill,reject) => {

        const conexion = conect();

        conexion`SELECT * FROM ideas`
        .then( ideas => {
            conexion.end();
            fulfill(ideas);
        })
        .catch( error => {
            conexion.end();
            reject({ error : "data base error" });
        });
    });
}


export function createIdea(file_name,idea_name){
    return new Promise((fulfill,reject) => {

        const conexion = conect();

        let url = `/upload/img_ideas/${file_name}`
        
        conexion`INSERT INTO ideas (url,file_name,idea_name) VALUES (${url},${file_name},${idea_name}) RETURNING id`
        .then( ([{id,url}]) => {
            conexion.end();
            fulfill(id,url);
        })
        .catch( error => {
            conexion.end();
            reject({ error : "data base error" });
        });
    });
}

export function deleteIdea(id){
    return new Promise((fulfill,reject) => {
        const conexion = conect(); 

        conexion`DELETE FROM ideas WHERE id = ${id}` 
        .then( ({count}) => { 
            conexion.end();
            fulfill(count);
        })
        .catch( error => {
            conexion.end();
            console.log("aqui", error) 
            reject({ error : "data base error" }); 
        });
    });
}

export function addLike({likes,user,likesDBLoading}){
    return new Promise((fulfill,reject) => {

        const conexion = conect();

        let id_from_Likes = likes.map(like => like.id)
        let IDLikes = likesDBLoading.map(item => item.liked_id)
        let idLikes = [...new Set([...IDLikes, ...id_from_Likes])] // with Set we avoid duplicated ids

        
        conexion`UPDATE users SET liked_id = ${idLikes} WHERE user_name = ${user} RETURNING liked_id`
        .then( ([{liked_id}]) => {
            conexion.end();
            
            fulfill({liked_id,likes});
        })
        .catch( error => {
            conexion.end();

            reject({ error : "data base error" });
        });

    });
}

export function readLikes({user}){
    return new Promise((fulfill,reject) => {

        const conexion = conect();

        // selecting two columns in two different tables, unnesting values from liked_id's array and rename the individual values, then joining the ids
        conexion`SELECT unnest_liked_id.liked_id, ideas.url
                    FROM users 
                    JOIN LATERAL unnest(users.liked_id) AS unnest_liked_id(liked_id) ON TRUE 
                    JOIN ideas ON ideas.id = unnest_liked_id.liked_id 
                    WHERE users.user_name = ${user}`
        .then( likes => {
            conexion.end();
           
            fulfill(likes);
        })
        .catch( error => {
            conexion.end();

            reject({ error : "data base error" });
        });
        
    });
}

export function infoModal({id}){
    return new Promise((fulfill,reject) => {

        const conexion = conect();

        conexion`SELECT idea_name,info FROM ideas WHERE id = ${id}`
        .then( ([{idea_name,info}]) => {
            conexion.end();
            
            fulfill({idea_name,info});
        })
        .catch( error => {
            conexion.end();
      
            reject({ error : "data base error" });
        });
        
    });
}

export function editInfo(infoCard,id){ 
    return new Promise((fulfill,reject) => {
        const conexion = conect(); 

        conexion`UPDATE ideas SET info = ${infoCard} WHERE id = ${id}` 
        .then( ({count}) => {
            conexion.end();

            fulfill(count);
        })
        .catch( error => {
            conexion.end(); 

            reject({ error : "database error" }); 
        });
    });
};

export function deleteLike(user,id){ 
    return new Promise((fulfill,reject) => {
        const conexion = conect(); 
        
        conexion`UPDATE users SET liked_id = array_remove(liked_id,${id}) WHERE user_name = ${user}` 
        .then( ({count}) => {  
            conexion.end();

            fulfill(count);
        })
        .catch( error => {
            conexion.end(); 
    
            reject({ error : "database error" }); 
        });
    });
}
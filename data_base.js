import postgres from 'postgres';
import dotenv from 'dotenv'; 
dotenv.config();

function conect(){ 
    return postgres({
        host : process.env.DB_HOST,
        port : process.env.DB_PORT,
        database : process.env.DB_NAME,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD
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
            reject({ error : "data base error 1" });
        });
    });
}


export function createIdea(file_name,idea_name){
    return new Promise((fulfill,reject) => {

        const conexion = conect();

        let url = `/upload/img_ideas/${file_name}`
        
        conexion`INSERT INTO ideas (url,file_name,idea_name) VALUES (${url},${file_name},${idea_name}) RETURNING id`
        .then( ([{id}]) => {
            conexion.end();
            fulfill(id);
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
            reject({ error : "data base error 1" }); 
        });
    });
}
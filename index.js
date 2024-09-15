import express, { response } from "express";
import { database } from "./config.js";
import { set, ref, push, update, child, get } from "firebase/database";
import { sendEmail } from "./emailer.js";
import bodyParser from "body-parser";

let app = new express()
app.use(express.json({limit:'10mb'}));

app.post('/rawJSONView', async (req,res)=>{

    try{

    let content = req.body

    let responseKey = push(child(ref(database),"responses")).key

    await set(ref(database , "responses/" + responseKey),content)
    res.status(200).send("Updated database")
    

    }
    catch{
        console.log('error updating database')
    }
    
})
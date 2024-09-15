import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin'


import { getDatabase, ref,set } from "firebase/database";

import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config()
const key = process.env.ADMIN_INFO
const serviceAccount = JSON.parse(Buffer.from(key,'base64').toString('utf-8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://codejams2024-default-rtdb.firebaseio.com"
});
const database = admin.database();

const write = (s, id)=>{
    set(ref(database,'blah/' + id), {
        word: s
    });
    console.log("successfully written")
    return


}




export {database}
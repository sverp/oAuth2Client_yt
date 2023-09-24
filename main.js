
import donenv from 'dotenv';
import express, { application } from 'express';
import { google } from 'googleapis';
import axios from 'axios';
import fs from 'fs'
import { error } from 'console';

donenv.config({})


const app = express();
const PORT = process.env.NODE_ENV || 8080


const videoPAth = 'firstvid.mkv';
let usertoken = ""

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
)

const service = google.youtube({
    version: "v3",
    auth : oauth2Client
});



oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    console.log(tokens.refresh_token);
  }
  console.log(tokens.access_token);
});

const scopes = [
    'https://www.googleapis.com/auth/youtube'
]

app.get('/context',(req,res) => {
    
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true,
    })
    res.redirect(url);
})

app.get('/api/oauth/google', async (req,res) => {
    const code = req.query.code;
    let {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    usertoken = tokens
    res.send("ok")
    
})

app.get('/request', async (req,res) => {
    console.log(oauth2Client);
    service.videos.insert({
        auth: oauth2Client,
        part: 'snippet,contentDetails,status',
        requestBody: {
            snippet: {
                title: 'my video form nodejs',
                description: 'tihs is my video from nodejs 8:00pm',
            },
            status: {
                privacyStatus: 'private',
            }
        },
        media : {
            body : fs.createReadStream('firstvid.mkv')
        },
    })

    res.send("ok yt")

})



app.listen(PORT, () => {
    console.log("sever listening to port ", PORT);
});
const port = process.env.PORT || 8080
const state = require('./state.js')
const express = require("express");
const chrome = require('./chrome.js')
const scheduler = require('./scheduler.js')

async function robot(){

    const app = express();
    
    await createServer(app)
    await apiCalls(app)   
    
    async function createServer(app){
        return new Promise((resolve, reject) => {
            const server = app.listen(port, (error) => {
                if(error){
                    reject(error)
                }
                console.log(`> Server now running on: ${server.address().address}:${port}`);
                resolve(server)
            });

        })
    }

    async function apiCalls(app){
        app.get("/index.js", async (req, res) => {

            if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
                return res.status(401).json({ message: 'Missing Authorization Header' });
            }

            const base64Credentials =  req.headers.authorization.split(' ')[1];
            const credentialsApi = Buffer.from(base64Credentials, 'base64').toString('ascii');
            
            const credentials = {
                cpf: credentialsApi.split(':')[0],
                pass: credentialsApi.split(':')[1]
            } 
            let content
            try{
                content = state.load_api(base64Credentials)
                console.log('> Loading from cache...')
            }catch(error){
                try{
                    content = await chrome(credentials)
                    state.save_api(content,base64Credentials)
                    await scheduler()
                }catch(error){
                    return res.status(401).json({ message: 'Service unavailable. '+error });
                }
            }

            res.set({ 'content-type': 'application/json; charset=utf-8' });
            res.statusCode = 200
            res.end(JSON.stringify(content))
        });
    }
}

module.exports = robot
const port = process.env.PORT || 8080
const state = require('./state.js')
const app = require("express")();
const ioreq = require('socket.io')

const chrome = require('./chrome.js')
const scheduler = require('./scheduler.js')

async function robot(){
    
    const server = await createServer(app)
    const io = ioreq(server)
    const client = await createSockets(io,server)
    await apiCalls(app,client)   
    
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

    async function createSockets(io,server){
        io.on('connection', (socket) => { 
            console.log('Connected socket.')
            io.on('error', (error) => {
                
            })

            io.on('finish', (error) => {
                
            })
        })

        const client = io(`${server.address().address}:${server.address().port}`)
        return client
    }

    async function apiCalls(app,client){
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
                    res.status(200).json({ message: 'The request is good, but the result still not ready. Try again later.'});

                    content = await chrome(credentials)
                    state.save_api(content,base64Credentials)
                    await scheduler(base64Credentials)
                }catch(error){
                    console.log(`Error: ${error}`)
                    return res.status(401).json({ message: 'Service unavailable'});
                }
            }
            return res.status(200).json(content); 
        });
    }
}

module.exports = robot
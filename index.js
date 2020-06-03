
const robots = {
    server: require('./robots/server.js'),
    scheduler: require('./robots/scheduler.js')
}

async function start(){

    await robots.server()
    
}

start()
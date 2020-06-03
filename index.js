
const robots = {
    server: require('./robots/server.js'),
    chrome: require('./robots/chrome.js')
}

async function start(){

    await robots.server()
    await robots.chrome()
    
}

start()
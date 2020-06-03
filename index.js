
const robots = {
    chrome: require('./robots/chrome.js')
}

async function start(){

    await robots.chrome()
    
}

start()
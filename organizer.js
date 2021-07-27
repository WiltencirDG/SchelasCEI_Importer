const state = require("../robots/state.js");
const fs = require('fs')
const content = state.load_api('<base64>');
let assets = require('./easynvest.json')
console.log(assets)
let broker = 'EASYNVEST';
if (assets.length != 0) {
    let count = 0;
    for (let assetIndex = 0; assetIndex < assets.length; assetIndex++) {
        content.push({
            corretora: broker,
            entries: {
                data: assets[assetIndex][0],
                tipo: assets[assetIndex][1],
                acao: assets[assetIndex][4],
                quantidade: assets[assetIndex][6],
                preco: assets[assetIndex][7],
                total: assets[assetIndex][8]
            }
        })
        console.log(count)
        count++;
    }
} else {
    content.push({
        corretora: broker,
        entries: {}
    })
}

state.save_api(content, '<base64>')
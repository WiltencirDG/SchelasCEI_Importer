const fs = require('fs')
const contentFilePath = './assets.json'
const contentFilePathSave = './files/'
const rawContentFilePath = './assets_raw.json'

function save_api(content, contentFileName){
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePathSave+contentFileName, contentString)
}

function load_api(contentFileName){
    const fileBuffer = fs.readFileSync(contentFilePathSave+contentFileName, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

function save(content){
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

function load(){
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

function save_raw(content){
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(rawContentFilePath, contentString)
}

function load_raw(){
    const fileBuffer = fs.readFileSync(rawContentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

module.exports = {
    save,
    load,
    save_raw,
    load_raw,
    save_api,
    load_api
}
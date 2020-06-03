const puppeteer = require('puppeteer')
const ceiCredentials = require('../credentials/cei.json')
const state = require('./state.js')

async function robot(){
    
    
    const chrome = await openChrome()
    const page = await openNewPage(chrome)
    await navigateToCEI(page)
    await loginToCEI(page)
    await navigateToAssets(page)
    const corretoras = await getAllCorretoras(page)
    const assets = await fetchAssets(page, corretoras)
    state.save(assets)
    //await organizeAssets(assets)
    await closeChrome(chrome)

    async function openChrome(){
        console.log('> Opening Google Chrome...')
        const chrome = await puppeteer.launch()
        return chrome
    }   

    async function openNewPage(chrome){
        const page = await chrome.newPage()
        return page
    }

    async function navigateToCEI(page){        
        await page.goto('https://cei.b3.com.br/CEI_Responsivo/', {waitUntil: 'networkidle2'});
    }

    async function loginToCEI(page){
        console.log('> Logging in to B3...')
        await page.type('#ctl00_ContentPlaceHolder1_txtLogin', ceiCredentials.cpf);
        await page.type('#ctl00_ContentPlaceHolder1_txtSenha', ceiCredentials.pass);

        await page.click('#ctl00_ContentPlaceHolder1_btnLogar');
        
        await page.waitForNavigation({timeout: 50000});
        
        console.log('> You\'re logged in.')
    }
    
    async function navigateToAssets(page){
        await page.goto('https://cei.b3.com.br/CEI_Responsivo/negociacao-de-ativos.aspx')
    }
    
    async function getAllCorretoras(page){
        console.log('> Fetching corretoras...')
        const corretorasSelect = await page.evaluate(() => Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_ddlAgentes'), element => element.innerText.replace(/\t/g,'')))
        const corretorasArray = corretorasSelect[0].split(/\n/g)
        const corretoras = []
        for(let corretora of corretorasArray){
            
            if(corretora != 'Selecione'){
                corretoras.push({
                    value: corretora.split('-')[0].trim(),
                    name: corretora.split('-')[1].trim()
                })
            }
        }
        return corretoras
    }
    
    async function fetchAssets(page, corretoras){
        console.log('> Fetching your assets...')
        const content = []
        for(let corretora of corretoras){
            console.log(`> Fetching from ${corretora.name}...`)
            await navigateToAssets(page)
            await page.select('#ctl00_ContentPlaceHolder1_ddlAgentes',corretora.value)
            await page.click('#ctl00_ContentPlaceHolder1_btnConsultar')
            await page.waitFor(3000)
            
            content.push({
                corretora: corretora.name,
                table:
                await page.evaluate(
                    () => Array.from(
                        document.querySelectorAll('table > tbody > tr'),
                        row => Array.from(row.querySelectorAll('th, td'), cell => cell.innerText)
                    ))
            })
        }
        
        return content
    }

    async function closeChrome(chrome){
        await chrome.close()
    }
}

module.exports = robot
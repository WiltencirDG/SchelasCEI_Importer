const puppeteer = require('puppeteer')
const ceiCredentials = require('../credentials/cei.json')
const state = require('./state.js')

async function robot(){
    
    
    const chrome = await openChrome()
    const page = await openNewPage(chrome)
    await navigateToCEI(page)
    await loginToCEI(page)
    await navigateToAssets(page)
    const brokers = await getAllBrokers(page)
    const assets = await fetchAssets(page, brokers)
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
    
    async function getAllBrokers(page){
        console.log('> Fetching brokers...')
        const brokersSelect = await page.evaluate(() => Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_ddlAgentes'), element => element.innerText.replace(/\t/g,'')))
        const brokersArray = brokersSelect[0].split(/\n/g)
        const brokers = []
        for(let broker of brokersArray){
            
            if(broker != 'Selecione'){
                brokers.push({
                    value: broker.split('-')[0].trim(),
                    name: broker.split('-')[1].trim()
                })
            }
        }
        return brokers
    }
    
    async function fetchAssets(page, brokers){
        console.log('> Fetching your assets...')
        const content = []
        for(let broker of brokers){
            console.log(`> Fetching from ${broker.name}...`)
            await navigateToAssets(page)
            await page.select('#ctl00_ContentPlaceHolder1_ddlAgentes',broker.value)
            await page.click('#ctl00_ContentPlaceHolder1_btnConsultar')
            await page.waitFor(3000)
            
            content.push({
                broker: broker.name,
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
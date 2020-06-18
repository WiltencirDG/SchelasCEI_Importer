const puppeteer = require('puppeteer')

async function robot(ceiCredentials){
        
    const chrome = await openChrome()
    const page = await openNewPage(chrome)
    await navigateToCEI(page)
    await loginToCEI(page)
    await navigateToAssets(page)
    const brokers = await getAllBrokers(page)
    const assets = await fetchAssets(page, brokers)
    const content = await organizeAssets(assets)
    await closeChrome(chrome)
    return content

    async function openChrome(){
        console.log('> Opening Google Chrome...')
        const chrome = await puppeteer.launch({'args' : [
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ],timeout: 60000})
        return chrome
    }   

    async function openNewPage(chrome){
        const page = await chrome.newPage({timeout: 60000})
        return page
    }

    async function navigateToCEI(page){        
        await page.goto('https://cei.b3.com.br/CEI_Responsivo/', {waitUntil: 'networkidle2'});
    }

    async function loginToCEI(page){
        console.log('> Logging in to B3...')
        await page.type('#ctl00_ContentPlaceHolder1_txtLogin', ceiCredentials.cpf);
        await page.type('#ctl00_ContentPlaceHolder1_txtSenha', ceiCredentials.pass);

        
        console.time('Took')
        await page.click('#ctl00_ContentPlaceHolder1_btnLogar');
    
        try{
            await page.waitForNavigation({timeout: 120000});

        }catch(error){
            console.timeEnd('Took')
            console.log('> Sadly, B3 is unavailable right now. Please, try again soon!')
            throw new Error('unavailable')
        }

        console.timeEnd('Took')
        console.log('> You\'re logged in.')
    }
    
    async function navigateToAssets(page){
        await page.goto('https://cei.b3.com.br/CEI_Responsivo/negociacao-de-ativos.aspx', {timeout: 60000})
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
            //await page.waitForNavigation()
            await page.waitFor(2500)
            
            let table = []

            try{
                table = await page.evaluate(
                    () => Array.from(
                        document.querySelector('table').querySelectorAll('tbody > tr'),
                        row => Array.from(row.querySelectorAll('th, td'), cell => cell.innerText)
                    ))

                console.log(`> ${table.length} results for ${broker.name}.`)

            }catch(error){
                console.log(`> No results for ${broker.name}.`)
            }

            content.push({
                broker: broker.name,
                table                
            })
        }
        
        return content
    }

    async function organizeAssets(assets){
        console.log('> Organizing your assets...')
        const content = []
       
        const brokers = assets.map((asset) => {return asset.broker})
        let assetsFiltered 
        for(let broker of brokers){
           
            assetsFiltered = assets.filter((asset) => asset.broker == broker).map((asset) => {return asset.table})
            
            if(assetsFiltered[0].length != 0){
                for( let assetIndex = 0; assetIndex < assetsFiltered[0].length; assetIndex++){
                    let asset = assetsFiltered[0][assetIndex]
                    content.push({
                        corretora: broker,
                        entries: {
                            data: asset[0],
                            tipo: asset[1],
                            acao: asset[4],
                            quantidade: asset[6],
                            preco: asset[7],
                            total: asset[8]
                        }
                    })
                }
            }else{
                content.push({
                    corretora: broker,
                    entries: {}
                })
            }
        }
        return content
    }

    async function closeChrome(chrome){
        console.log('> Closing Google Chrome...')
        await chrome.close()
    }
}

module.exports = robot
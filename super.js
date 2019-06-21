//
let request = require("request-promise-native")
let fs = require("fs")
let {JSDOM} = require("jsdom")
let crypto = require("crypto")

//m
const URL_WINE_STORE = "https://shop.vinvico.ro/"
let CRAWL_LIVE // whether or not we're downloading fresh, new crawling data

//
let readMostRecentFileInFolder = (folderPath) => fs.readFileSync(`${folderPath}/${fs.readdirSync(folderPath).sort((a,b) => a<b ? 1 : -1)[0]}`).toString() // The most "recent" after sorting the file names

let getWinesFromWebsite = (html) => {
    let document = new JSDOM(html).window.document

    let productsElement = document.querySelector(".products")
    let products = []   

    let getProductDataFromElement = (element) => {
        let url_more_info = element.children[0].href
        let url_img = element.children[0].children[0].children[0].src
        let fabrication_year = element.children[1].children[0].children[0].textContent
        let name = element.children[1].children[0].children[1].textContent
        let price = element.children[1].children[1].children[0].textContent

        return {name, fabrication_year, price, url_img, url_more_info}
    }

    for(let productElement of productsElement.children){
        let productData = getProductDataFromElement(productElement)
        products.push(productData)
    }

    fs.writeFileSync(`./crawl/products/wines_${new Date().getTime()}.txt`, JSON.stringify(products))
    // console.log(products[0])
}

let crawl = async() => {
    try{
        console.log(`Crawling Wine data... (${CRAWL_LIVE ? "LIVE" : "OFFLINE"})`)

        let html
        if(CRAWL_LIVE){
            html = await request(URL_WINE_STORE)
            fs.writeFileSync(`./crawl/websites/index/index_${new Date().getTime()}.html`, html)
        }
        else {
            html = readMostRecentFileInFolder("./crawl/websites/index")
        }
        getWinesFromWebsite(html)
        await crawlDetailedData()
    }catch(e){throw e}
}

let crawlDetailedData = async() => {
    try{
        console.log("Crawling detailed wine data...")
        let wines = JSON.parse(readMostRecentFileInFolder("./crawl/products"))
        for(let [index, wine] of wines.entries()){
            console.log(`Crawling ${wine.url_more_info} [${index+1} / ${wines.length}]`)
            let html
            let url_sha = crypto.createHash("sha256").update(wine.url_more_info).digest("hex")
            if(CRAWL_LIVE){
                html = await request(wine.url_more_info)
                fs.writeFileSync(`./crawl/websites/wines/${url_sha}.html`, html)
            }
            else{
                html = fs.readFileSync(`./crawl/websites/wines/${url_sha}.html`).toString()
            }
            let document = new JSDOM(html).window.document
            let wineDetailsElement = document.querySelectorAll(".woocommerce-product-attributes-item__value")
            // console.log(wineDetailsElement.length+" "+url_sha)
            if(wineDetailsElement.length){ // This wine/product has more details on its page
                let getDetailFromDetailsList = (key) => {
                    let detailsList = document.querySelectorAll(".woocommerce-product-attributes-item")

                    for(let row of detailsList)
                        if(row.children[0].textContent.includes(key))
                            return row.children[1].textContent.replace("\n", "")
                }

                let description = getDetailFromDetailsList("ALCOOL")
                let alcohol_content = wineDetailsElement[1].textContent
                let volume = wineDetailsElement[2].textContent

                wines[index].description = getDetailFromDetailsList("TIP PRODUS")
                wines[index].alcohol_content = getDetailFromDetailsList("ALCOOL")
                wines[index].volume = getDetailFromDetailsList("VOLUM")
            }
        }
        // console.log(wines[0])
        fs.writeFileSync(`./crawl/products_detailed/wines_detailed_${new Date().getTime()}.txt`, JSON.stringify(wines))
    }catch(e){throw e}
}

let main = async() => {
    try{
        let action = process.argv[2]
        if(action === "crawl-live"){
            CRAWL_LIVE = true
            await crawl()
        } else if(action === "crawl-offline") {
            CRAWL_LIVE = false
            await crawl()
        }

        console.log("Done!")
    }catch(e){console.log(e)}
}

//
main()
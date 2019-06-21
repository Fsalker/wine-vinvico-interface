let app = require("express")()
let https = require("https")
let fs = require("fs")

app.get("/wineData.txt", (req, res) => {
    let html = require("fs").readFileSync("./wineData.txt")
    res.end(html)
})

app.get("/", (req, res) => {
    let html = require("fs").readFileSync("./index.html")
    res.end(html)
})

let server
let HTTPS_ENABLED = false
let http_options

try{
    const CERTIFICATE_LOCATION = "/etc/letsencrypt/live/andrei-puiu.dev"
    http_options = {
        key: fs.readFileSync(`${CERTIFICATE_LOCATION}/privkey.pem`),
        cert: fs.readFileSync(`${CERTIFICATE_LOCATION}/cert.pem`),
    }
    HTTPS_ENABLED = true
}catch(e){
    console.log("Failed to acquire HTTPS certificate")
    console.log(e)
}

if(!HTTPS_ENABLED)
    app.listen(1337)
else{
    https.createServer(http_options, app).listen(1337)
}
console.log("Wine Visualiser listening on PORT 1337...")

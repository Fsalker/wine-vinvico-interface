let app = require("express")()

app.get("/wineData.txt", (req, res) => {
    let html = require("fs").readFileSync("./wineData.txt")
    res.end(html)
})

app.get("/", (req, res) => {
    let html = require("fs").readFileSync("./index.html")
    res.end(html)
})
app.listen(1337)
console.log("Wine Visualiser listening on PORT 1337...")
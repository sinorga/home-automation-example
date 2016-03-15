var express = require('express')
var path = require('path')
var compression = require('compression')

var app = express()
app.use(compression())

// static files
app.use(express.static(path.join(__dirname, 'public')))

// SPA, index.html is everything
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// go, go, go
var PORT = process.env.PORT || 8080
app.listen(PORT, function () {
  console.log('production server listening at http://localhost:' + PORT)
})

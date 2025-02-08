var fName = ''

import 'dotenv/config'

import cors from 'cors'
import express from 'express'
var app = express()
  
import fs from 'fs';
import path from 'path'
import multer from 'multer'

import hostRequestEndpoint from './hostRequest.js'
import hostThreadEndpoints from './hostThreads.js'

import config from './config.js'
var appsList = config.appsList

// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var storage = multer.diskStorage({
  destination: function (req, file, callback) {

    // Uploads is the Upload_folder_name
    callback(null, "temp")
  },
  filename: function (req, file, callback) {
    fName = file.originalname
    callback(null, file.originalname)
  }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1000 * 1000 * 1000;

var upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, callback) {

    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png|webp|gif/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = path.extname(file.originalname).toLowerCase()
    extname = filetypes.test(extname);

    if (mimetype && extname) {
      fName = file.originalname
      return callback(null, fName);
    }

    callback("Error: File upload only supports the " + "following filetypes - " + filetypes, null);
  }
  // mypic is the name of file attribute
}).single("image");

app.use(express.json())

// User inputs
app.get('/', function(req, res) {
  res.redirect('/chat')
})

app = hostRequestEndpoint(app)

appsList.forEach(function(aName, i) {
  var hPath = `/get${aName[0].toUpperCase()}${aName.slice(1)}`
  var fPath = `./apps/${aName[0].toLowerCase()}${aName.slice(1)}.js`
  app.get(hPath, cors(corsOptions), function(req, res) {
    import(fPath).then(function(module) {
      module.default(req, res)
    })
  })
})

app.post("/uploadFile",function (req, res) {
  // Error MiddleWare for multer file upload, so if any
  // error occurs, the image would not be uploaded!
  upload(req, res, function(err) {
    if(err) {
      // ERROR occurred (here it can be occurred due
      // to uploading image of size greater than
      // 1MB or uploading different file type)
      res.send(err)
    }
    else {
      // SUCCESS, image successfully uploaded
      // res.send(fName)
      var url = `/chat?`
      
      var hasParent = req.query.hasParent
      if (!!hasParent) url = `/upload?sucess=true&`
      
      url += `filelocation=temp-storage&name=${fName}`
      
      var p = req.query.p
      if (!!p) url += `&prompt=${p}`

      var t = req.query.t
      if (!!t) url += `&type=${t}`

      var isBulk = req.query.isBulk
      if (!!isBulk) url += `&isBulk=${isBulk}`
      
      res.redirect(url)
    }
  })
})

app.get('/temp*', function(req, res) {
  var name = req.query.name
  var file = '/temp.html'
  if (!!name) {
    file = `/temp/${name}`
  }
  res.sendFile(file, {root: '.'})
})

app.get('/listImages', function(req, res) {
  var files = fs.readdirSync('temp')
  res.json(files)
})

app.get('/clearImages', function(req, res) {
  const directory = `./temp`;

  fs.readdir(directory, (err, files) => {
    if (err) res.send(err);

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) res.send(err);
      });
    }
    res.send('cleared!')
  });
})

app.get('/viewImage', function(req, res) {
  var url = req.query.u
  if (!!atob(url)) url = atob(url)
  var p = req.query.p

  var viewImage = fs.readFileSync('viewImage.html', 'utf8')
  viewImage = viewImage.split('$[src]').join(url)
  viewImage = viewImage.split('$[prompt]').join(p)

  res.send(viewImage)
})

app = hostThreadEndpoints(app)

app.get('*', function(req, res) {
  var path = req.path
  if (path.startsWith('/')) path = path.slice(1)
  if (path.endsWith('/')) path = path.slice(0, -1)
  if (!path.includes('.')) path = `${path}.html`
  if (!fs.existsSync(`./${path}`)) {
    path = '404.html'
  }
  res.sendFile(path, {root: '.'})
})

app.listen(8080, function() {
  console.log('Server started on port 8080')
})
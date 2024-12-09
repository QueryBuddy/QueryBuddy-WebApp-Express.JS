import newRequest from './request.js'

function host(app) {
  app.get('/sendRequest', function(req, res) {
    var prompt = req.query.p
    var type = req.query.t
    var urls = req.query.urls
    var voice = req.query.v
    var systemId = req.query.systemid
    var startingMessage = req.query.startingmessage
    prompt = decodeURIComponent(prompt)
    if (!!urls) {
      if (urls.includes(',')) urls = urls.split(',')
      else urls = [urls]
    }
    newRequest(
      res, prompt, type, urls=urls, voice=voice,
      systemId=systemId, startingMessage=startingMessage
    )
  })

  return app
}

export default host
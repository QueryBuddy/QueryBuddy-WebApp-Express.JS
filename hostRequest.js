import newRequest from './request.js'

function host(app) {
  app.post('/sendRequest', function(req, res) {
    var userId = req.body.userid
    var prompt = req.body.p
    var type = req.body.t
    var urls = req.body.urls
    var voice = req.body.v
    var systemId = req.body.systemid
    var startingMessage = req.body.startingmessage
    prompt = decodeURIComponent(prompt)
    if (!!urls) {
      if (urls.includes(',')) urls = urls.split(',')
      else urls = [urls]
    }
    newRequest(
      res, userId, prompt, type, urls=urls, voice=voice,
      systemId=systemId, startingMessage=startingMessage
    )
  })

  return app
}

export default host
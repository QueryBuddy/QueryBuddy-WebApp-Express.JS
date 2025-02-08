import createThread from './threads/create.js'
import deleteThread from './threads/delete.js'

function host(app) {
  app.post('/createThread', createThread)

  app.delete('/deleteThread', deleteThread)
  return app
}

export default host
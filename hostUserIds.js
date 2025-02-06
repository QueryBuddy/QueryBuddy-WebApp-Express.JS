import createUserId from './userId/create.js'
import deleteUserId from './userId/delete.js'

function host(app) {
  app.post('/createUserId', createUserId)

  app.delete('/userClose', deleteUserId)
  return app
}

export default host
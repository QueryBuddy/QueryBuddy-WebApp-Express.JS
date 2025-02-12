const FileObj = (...types) => ({ type: 'file', types });

const importFile = async (model) => {
    const a = await import(`./models/${model}.js`);
    return a.default;
}

const models = {
    'gpt-4o': {
        provider: 'OpenAI',
        types: ['text', FileObj('image', 'audio')],
    }
}

Object.keys(models).forEach(key => {
    var actions = importFile(key);
    if (actions.default) actions = actions.default
    models[key].model = key
    models[key].provider = { id: models[key].provider.toLowerCase, name: models[key].provider }
    models[key].actions = actions
})

function hostModels(app) {
  app.post('/models', (req, res) => res.json(models))

  return app
}

export { models, hostModels };
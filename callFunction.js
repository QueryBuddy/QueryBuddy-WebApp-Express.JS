import appsConfig from './appsConfig.js'

export async function callFunction(name, args) {
    // Get the app configuration
    const appConfig = appsConfig.appsData[name]
    if (!appConfig) {
        return `Error: Function ${name} not found`
    }

    const func = await import(`./apps/${name}.js`)
    const result = await func.default(args)
    return result
}

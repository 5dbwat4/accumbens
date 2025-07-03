import fs from 'fs'

export default function get3rdpartylist() {
    const virtualModuleId = 'virtual:get-3rd-party-libs'
    const resolvedVirtualModuleId = '\0' + virtualModuleId
    return {
        name: 'unplugin-list-3rd-party-libs',
        // This plugin is used to generate a list of 3rd party libraries
        // which is those from `node_modules`.
        // It returns array of {name: string, version: string, author: string, license: string} objects.
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId
            }
        },
        load(id) {
            if (id === resolvedVirtualModuleId) {
                const { dependencies } = require('../package.json')
                //if cache hit:
                // if (fs.existsSync('node_modules/.cache/3rd-party-libs.json')) {
                //     const cache = JSON.parse(fs.readFileSync('node_modules/.cache/3rd-party-libs.json', 'utf-8'))
                //     if (JSON.stringify(cache.dependencies) === JSON.stringify(dependencies)) {
                //         return `export default ${JSON.stringify(cache.libs)}`
                //     } else {
                //         console.warn('3rd-party libs cache is invalid, regenerating...')
                //     }
                // }
                const libs = Object.entries(dependencies)
                    .map(([name, version]) => {
                        try {
                            // const pkg = require(`${name}/package.json`)
                            // console.log(`./node_modules/${name}/package.json`)
                            if( !fs.existsSync(`./node_modules/${name}/package.json`)) {
                                console.warn(`Package ${name} does not have a package.json file.`)
                                return {
                                    name,
                                    version: version,
                                    author: '',
                                    license: '',
                                    description: '',
                                    url:""
                                }
                            }
                            const pkg = JSON.parse(fs.readFileSync(`node_modules/${name}/package.json`, 'utf-8'))
                            return { 
                                name,
                                version: pkg.version || version,
                                author: pkg.author,
                                license: pkg.license,
                                description: pkg.description || '',
                                url: pkg.homepage || pkg.repository?.url || ''
                            }
                        } catch (e) {
                            console.warn(`Failed to load package.json for ${name}:`, e)
                            return {
                                name,
                                version: version,
                                author: '',
                                license: '',
                                description: '',
                            }
                        }
                    })
                // fs.writeFileSync(
                //     'node_modules/.cache/3rd-party-libs.json',
                //     `${JSON.stringify({dependencies,libs}, null, 2)}`
                // )
                return `export default ${JSON.stringify(libs)}`
            }
        },
    }
}
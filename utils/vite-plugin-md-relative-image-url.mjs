import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import mdx from 'remark-mdx'
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from 'unist-util-visit'

function isTransformableAssetUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (url.startsWith('/')) return false
  if (url.startsWith('//')) return false
  if (url.startsWith('#')) return false
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) return false
  return true
}

function appendUrlQuery(url) {
  // const hashIndex = url.indexOf('#')
  // const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url
  // const hash = hashIndex >= 0 ? url.slice(hashIndex) : ''

  // if (/\?(?:[^#]*&)?url(?:[=&]|$)/.test(base)) {
  //   return `${base}${hash}`
  // }

  // const separator = base.includes('?') ? '&' : '?'
  // return `${base}${separator}url${hash}`
  if (!url.startsWith('./')||url.startsWith('../')) {
    url = './' + url
  }
  if (url.includes('?')) {
    console.log(`[vite-plugin-md-relative-image-url] Warning: URL "${url}" already contains a query string. Appending additional query parameters may cause issues.`)
    return `${url}&url`
  }
  if (url.includes('#')) {
    console.log(`[vite-plugin-md-relative-image-url] Warning: URL "${url}" already contains a hash fragment. Appending query parameters before the hash may cause issues.`)
    const [base, hash] = url.split('#', 2)
    return `${base}?url#${hash}`
  }
  return `${url}?url`

}

function imageToJsx(importName, alt, title) {
  const titleAttr = title ? ` title=${JSON.stringify(title)}` : ''
  return `<img src={${importName}} alt=${JSON.stringify(alt || '')}${titleAttr} loading="lazy"/>`
}

function getImportInsertOffset(tree) {
  if (!Array.isArray(tree.children) || tree.children.length === 0) return 0

  let offset = 0
  let index = 0
  while (index < tree.children.length) {
    const node = tree.children[index]
    if (node.type !== 'yaml' && node.type !== 'toml') break
    if (!node.position?.end?.offset) break
    offset = node.position.end.offset
    index += 1
  }

  return offset
}

function applyReplacements(source, replacements) {
  if (replacements.length === 0) return source

  const ordered = [...replacements].sort((a, b) => b.start - a.start)
  let output = source
  for (const item of ordered) {
    output = `${output.slice(0, item.start)}${item.value}${output.slice(item.end)}`
  }
  return output
}

export default function vitePluginMdRelativeImageUrl() {
  const parser = unified().use(remarkParse).use(remarkFrontmatter, ['yaml', 'toml']).use(remarkGfm).use(remarkMath).use(mdx)

  return {
    name: 'accumbens:md-relative-image-url',
    enforce: 'pre',
    transform(code, id) {
      const filePath = id.split('?')[0]
      // if (!/\.(md)$/i.test(filePath)) return null
      // if (filePath.includes('/node_modules/') || filePath.includes('\\node_modules\\')) return null
      if(!filePath.includes('/noting/')) return null

      
      if(!filePath.endsWith('.mdx')) return null

      const tree = parser.parse(code)
      const definitions = new Map()

      visit(tree, 'definition', (node) => {
        if (!node.identifier || !node.url) return
        definitions.set(String(node.identifier).toLowerCase(), node)
      })

      let importIndex = 0
      const importByUrl = new Map()
      const replacements = []

      const ensureImport = (rawUrl) => {
        if (importByUrl.has(rawUrl)) return importByUrl.get(rawUrl)
        const importName = `__acc_img_${importIndex}`
        importIndex += 1
        const importPath = appendUrlQuery(rawUrl)
        importByUrl.set(rawUrl, { importName, importPath })
        return { importName, importPath }
      }

      visit(tree, 'image', (node) => {
        const url = node.url
        if (!isTransformableAssetUrl(url)) return
        if (!node.position?.start?.offset && node.position?.start?.offset !== 0) return
        if (!node.position?.end?.offset && node.position?.end?.offset !== 0) return

        const { importName } = ensureImport(url)
        replacements.push({
          start: node.position.start.offset,
          end: node.position.end.offset,
          value: imageToJsx(importName, node.alt, node.title),
        })
      })

      visit(tree, 'imageReference', (node) => {
        if (!node.identifier) return
        const def = definitions.get(String(node.identifier).toLowerCase())
        if (!def || !def.url) return
        if (!isTransformableAssetUrl(def.url)) return
        if (!node.position?.start?.offset && node.position?.start?.offset !== 0) return
        if (!node.position?.end?.offset && node.position?.end?.offset !== 0) return

        const { importName } = ensureImport(def.url)
        replacements.push({
          start: node.position.start.offset,
          end: node.position.end.offset,
          value: imageToJsx(importName, node.alt, def.title),
        })
      })

      if (replacements.length === 0) return null

      const transformed = applyReplacements(code, replacements)
      const imports = [...importByUrl.values()].map(({ importName, importPath }) => `import ${importName} from ${JSON.stringify(importPath)}`)
      const importBlock = imports.join('\n')

      const insertOffset = getImportInsertOffset(tree)
      if (insertOffset === 0) {
        return `${importBlock}\n\n${transformed}`
      }

      const before = transformed.slice(0, insertOffset)
      const after = transformed.slice(insertOffset)
      const prefix = before.endsWith('\n') ? '' : '\n'
      const suffix = after.startsWith('\n') ? '' : '\n'

      console.log(`[vite-plugin-md-relative-image-url] Transformed ${id} with ${imports.length} image imports.`)
      // console.log("form: ", code)
      // console.log("to: ", `${before}${prefix}\n\n${importBlock}\n\n${suffix}${after}`)

      return `${before}${prefix}\n\n${importBlock}\n\n${suffix}${after}`
    },
  }
}
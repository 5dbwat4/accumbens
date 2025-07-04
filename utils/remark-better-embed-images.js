/**
 * @import {Image, Root} from 'mdast'
 * @import {VFile} from 'vfile'
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import isRelativeUrl from 'is-relative-url'
import mimes from 'mime/lite'
import {visit} from 'unist-util-visit'

/**
 * Embed local images as data URIs.
 *
 * @returns
 *   Transform.
 */
export default function remarkEmbedImages() {
  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {Promise<void>}
   *   Nothing.
   *
   *   Note: seems that using `undefined` is not inferred correctly by `unified`.
   */
  return async function (tree, file) {
    const base = file.dirname ? path.resolve(file.cwd, file.dirname) : file.cwd
    /** @type {Array<[Image, string]>} */
    const nodes = []
    /** @type {Array<Promise<string>>} */
    const promises = []

    visit(tree, 'image', function (node) {
      console.log('remark-embed-images',base,node, node.url, isRelativeUrl(node.url), node.url.startsWith('/'))
      if (node.url && isRelativeUrl(node.url) && !node.url.startsWith('/')) {
        const filePath = path.resolve(base, node.url)
        // const mime = mimes.getType(path.extname(filePath))
        // if (mime) {
        //   nodes.push([node, mime])
        //   promises.push(fs.readFile(filePath, 'base64'))
        // }
        node.url = "/@fs/" + filePath
      }
    })

    const results = await Promise.all(promises)
    let index = -1
    while (++index < results.length) {
      const [node, mime] = nodes[index]
      const result = results[index]
      node.url = 'data:' + mime + ';base64,' + result
    }
  }
}

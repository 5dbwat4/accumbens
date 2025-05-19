/**
 * @import {Root} from 'hast'
 */
import { visit } from 'unist-util-visit'
// import { encodePPX } from '../codecForPropertyPass'


export default function rehypeReplacement() {
    const elementReplacementMap = {
        'img': 'n-image',
        'a':'element-a',
    }
    /**
     * @param {Root} tree
     * @return {undefined}
     */
    return function (tree) {
        visit(tree, 'element', (node, index, parent) => {
            // tag name replacement
            if (node.tagName in elementReplacementMap) {
                node.tagName = elementReplacementMap[node.tagName]
            }

            // heading replacement
            switch (node.tagName) {
                case 'h1':
                    node.tagName = 'acc-heading'
                    node.properties.level = 1
                    break
                case 'h2':
                    node.tagName = 'acc-heading'
                    node.properties.level = 2
                    break
                case 'h3':
                    node.tagName = 'acc-heading'
                    node.properties.level = 3
                    break
                case 'h4':
                    node.tagName = 'acc-heading'
                    node.properties.level = 4
                    break
                case 'h5':
                    node.tagName = 'acc-heading'
                    node.properties.level = 5
                    break
                case 'h6':
                    node.tagName = 'acc-heading'
                    node.properties.level = 6
                    break
            }

            // code block replacement

            if(node.tagName==='pre'&&node.children[0].tagName==='code'&&node.children[0].properties?.className?.[0]!=='language-math'){
                node.tagName='code-blocks'
                node.properties.language=node.children[0].properties?.className?.[0]?.slice(9) || ''
                // node.properties.code=encodePPX(node.children[0].children[0].value)
            }
            if(node.tagName==='pre'&&node.children[0].tagName==='code'&&node.children[0].properties?.className?.[0]==='language-math'){
                node.tagName='pre'
                node.properties.className='language-math display-math'
                node.content=node.children[0].children[0].value
                // node.properties.code=encodePPX(node.children[0].children[0].value)
            }
        })
    }
}
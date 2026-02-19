import {
    hydrateCategoryNode,
    loadFullNavTree,
    loadRootConfig,
} from "@notebook-entry/accumbens.config.js"
import entryMap from "@notebook-entry/accumbens.entries.js"

let rootConfigPromise = null

const getRootConfig = async () => {
    if (!rootConfigPromise) {
        rootConfigPromise = loadRootConfig()
    }
    return rootConfigPromise
}

const withBreadcrumb = (target, breadcrumb) => {
    if (!target) return null
    return {
        ...target,
        breadcrumb,
    }
}

const loadCategory = async (category) => {
    if (!category) return category
    if (category.chunk) {
        return await hydrateCategoryNode(category)
    }
    return category
}

const getEntry = async (path) => {
    let flag_path_type = []
    let found = false
    const move = async (category, breadcrumb) => {
        if(found) return;
        const categoryLoaded = await loadCategory(category)

        breadcrumb.push({name: categoryLoaded.name, path: categoryLoaded.path})
        let certainPath;

        if(typeof categoryLoaded.path === 'string' && path.startsWith(categoryLoaded.path)){
            certainPath = categoryLoaded.path
            if(path == certainPath){
                flag_path_type.push('dir');
                found = withBreadcrumb(categoryLoaded, breadcrumb)
                return ;
            }
            if(path == certainPath+'/'){
                if(categoryLoaded.index){
                    flag_path_type.push('index');
                found = withBreadcrumb(categoryLoaded.entries.find(x=>x.unikey == categoryLoaded.index), breadcrumb)
                }else{
                    flag_path_type.push('dir');
                    found = withBreadcrumb(categoryLoaded, breadcrumb)
                }
                return ;

            }
            if(categoryLoaded.entries?.find(x=>certainPath+'/'+x.path == path)){
                found = withBreadcrumb(categoryLoaded.entries.find(x=>certainPath+'/'+x.path == path), breadcrumb)
                return ;
            }
        }
        if(!found && !categoryLoaded.leaf){
            for (const subcategory of (categoryLoaded.subcategories || [])) {
                await move(subcategory, [...breadcrumb])
                if (found) break
            }
            return;
        }
    }

    const infoRoot = await getRootConfig()

    if(infoRoot.entries?.find(x=>x.path == path)){
        found = withBreadcrumb(infoRoot.entries.find(x=>x.path == path), [])
    }else{
        for (const category of (infoRoot.subcategories || [])) {
            await move(category,[])
            if (found) break
        }
    }
    if(!found){
        return null;
    }
    found.entry = entryMap[found.unikey]
    found.is_dir = flag_path_type.includes('dir');
    found.is_index = flag_path_type.includes('index');
    return found;

}

const getNavInfo = async ({ full = false } = {}) => {
    if (full) {
        return await loadFullNavTree()
    }
    return await getRootConfig()
}


export {
    getEntry,
    getNavInfo
}
import infoRoot from "@notebook-entry/accumbens.config.json"
import entryMap from "@notebook-entry/accumbens.entries.js"

const getEntry = async (path) => {
    console.log(path);
    

    let flag_path_type = []
    let found = false
    const move = (category,breadcrumb)=>{
        if(found) return;
        // console.log(category,breadcrumb);
        
        breadcrumb.push({name:category.name,path:category.path})
        let certainPath;
        // console.log(category.path);
        
        if(certainPath = category.path.find(v=>path.startsWith(v))){
            if(path == certainPath){
                flag_path_type.push('dir');
                found = category;
                found.breadcrumb = breadcrumb
                return ;
            }
            if(path == certainPath+'/'){
                if(category.index){
                    flag_path_type.push('index');
                found = category.entries.find(x=>x.unikey == category.index);
                }else{
                    flag_path_type.push('dir');
                    found = category;
                }

                found.breadcrumb = breadcrumb
                return ;

            }
            if(category.entries.find(x=>certainPath+'/'+x.path == path)){
                found = category.entries.find(x=>certainPath+'/'+x.path == path)
                found.breadcrumb = breadcrumb
                return ;
            }
        }
        if(!found && !category.leaf){
            category.subcategories.forEach(v=>{move(v,[...breadcrumb])})
            return;
        }
    }

    if(infoRoot.entries?.find(x=>x.path == path)){
        found = entryMap[path]
    }else{
        infoRoot.subcategories.map(v=>move(v,[]))
    }
    if(!found){
        return null;
    }
    found.entry = entryMap[found.unikey]
    found.is_dir = flag_path_type.includes('dir');
    found.is_index = flag_path_type.includes('index');
    return found;

}


export {
    getEntry,
    infoRoot as navInfo
}

const MdFileMap = new Map<string, string>();
const AssetsFileMap = new Map<string, string>();

async function initMdFileMap(){
    const data:{[key:string]:string} = await fetch('/docs/md-integrity.json').then(v=>v.json());
    for (const o of Object.entries(data)) {
        MdFileMap.set(o[0],o[1]);
    }
}

async function initAssetsMap(){
    const data:{[key:string]:string} = await fetch('/docs/assets-integrity.json').then(v=>v.json());
    for (const o of Object.entries(data)) {
        AssetsFileMap.set(o[0],o[1]);
    }
}




export async function hashmapContaining (type: string, path: string) : Promise<string>{
    console.log(path);
    
    if(type === 'md'){
        if(MdFileMap.size === 0){
            await initMdFileMap();
        }
        return MdFileMap.get(path);
    }else{
        if(AssetsFileMap.size === 0){
            await initAssetsMap();
        }
        return AssetsFileMap.get(path);
    }
}
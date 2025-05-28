
//---------------------------------------------------------------
import path from "path"
import { fileURLToPath, pathToFileURL } from "url"
import fs from "fs"

const importRoot = "../noting/"

//---------------------------------------------------------------
// ;(async()=>{
const trimUrl = (url) => {
    return url.replace("file://","")
}

const NoteRoot_full = import.meta.resolve(importRoot)

// const betterJoin = (path0,path1,...paths)=>{
//     const pathx = pathToFileURL(path.join(fileURLToPath(path0)+'/',"../"+path1));
//     if(paths.length!=0){
//         const nextSlice = paths.shift()
//         return betterJoin(pathx,nextSlice,...paths)
//     }else{
//         return pathx;
//     }
// }
const PathToBrowserString=(u)=>u.replace(/\\/g,'/');
const toDefaultPath=(fileurl)=>{
    return PathToBrowserString(path.relative(fileURLToPath(NoteRoot_full),fileURLToPath(fileurl)))
}
const plx = import(new URL("./accumbens.config.js",NoteRoot_full))

const mdxMap = []

const existsData = JSON.parse(fs.readFileSync(toDefaultPath(new URL("./noting/.accumbens/accumbens.config.json",NoteRoot_full))))

const parsefy = async (importPath,catData) => {
    const robj = (await import (new URL("./accumbens.config.js",importPath))).default
    const childData = catData.find(v=>v.name === robj.name) || {subcategories:[]}
    // console.log(importPath,robj);
    
    let result = {}

    // Key : dir

    // Key : path & fullPath

    // result.path = []
    
    // if((!robj.path) || robj?.path?.default){// Use default path
    //     // console.log("Default int");
        
    //     const p = toDefaultPath(importPath)
    //     if(p.endsWith("/")){
    //         result.path.push(p.slice(0,-1))
    //     }else{
    //         result.path.push(p)
    //     }
    // }
    // if(typeof robj?.path === "string"){
    //     result.path.push(robj.path)
    // }
    // if(robj?.path?.aliases){
    //     result.path.push(...robj.path.aliases)
    // }

    // Key : show

    // result.show = robj.show==undefined?true:robj.show

    // Key : name
    // result.name = robj.name

    // Key : subcategories
    if(robj.subcategories){
        result.subcategories = await Promise.all( robj.subcategories.map(async(xdir)=>{
            return await parsefy(new URL(xdir+"/",importPath),childData.subcategories)
        }))
    }else{
        result.leaf = true
    }

    // Key : entries,index

    const entries = []

    const entryToData = async (entry) => {

        const filename = typeof entry == "string" ? entry : entry.file
        // console.log(entry,filename);
        
        // const content = await fs.promises.readFile(fileURLToPath(new URL(filename,importPath)),"utf-8")
        // const hash = await fileSHA(content)
        // const unikey = hash
        // mdxMap.push([unikey,toDefaultPath(new URL(filename,importPath).href)])


        // FOR Index Entry
        // If a 'index':'xxx.md' is specified, it will be used as the index entry, 
        //   and the rule below will be ignored
        // If the entry is 'index.md' or 'index.mdx', it will be used as the index entry
        
        // if(robj?.index && entry === robj.index){
        //     result.index = unikey
        // }
        // if(!(robj?.index) && ( entry === "index.md" || entry === "index.mdx")){
        //     result.index = unikey
        // }

        // Parse frontmatter

        const entryData = {};
        // const fm = matter(content).data
        // const count = wordcount(matter(content).content)
        // const fstat = fs.statSync(fileURLToPath(new URL(filename,importPath)))
        // fs

        // Specially handles path
        if(typeof entry?.path == "string"){
            entryData.path = entry.path
        }else{
            entryData.path =  toDefaultPath(new URL(filename,importPath).href).replace(/\.mdx?$/,"").split("/").pop()
        }
        let a
        if(a=childData.entries.find(v=>v.path === entryData.path)){
            fs.utimesSync(fileURLToPath(new URL(filename,importPath)),new Date(a.updatedAt),new Date(a.updatedAt))
        }
        
        // console.log(entryData);
        

        // return entryData
        

    }

    if(robj?.entries instanceof Array){
        result.entries = await Promise.all( robj.entries.map(async(xentry)=>{
            return await entryToData(xentry)
        }))
    }
    if(robj?.entries === "auto"){
        const entriesFiles = await fs.promises.readdir(fileURLToPath(importPath))
        result.entries = await Promise.all( entriesFiles.filter(v=>{
            return v.endsWith(".md") || v.endsWith(".mdx")
        }).map(async(xentry)=>{
            return await entryToData(xentry)
        }))
    }

    return result

}

const config = await parsefy(new URL("./accumbens.config.js",NoteRoot_full),[existsData])

// ---------------------------------------------------------------



// const mdxMapPathFile = 
// `// THIS FILE IS GENERATED AUTOMATICALLY
// export default {
// ${
// mdxMap.map((v)=>{
//     return `    "${v[0]}" : import("../${v[1]}"),`
// }).join("\n")
// }
// // }`
// const mdxMapPathFile = 
// `// THIS FILE IS GENERATED AUTOMATICALLY
// export default {
// ${
// mdxMap.map((v)=>{
//     return `   get "${v[0]}"(){return  (()=>import("../${v[1]}"))()},`
// }).join("\n")
// }
// }`



// fs.writeFileSync(fileURLToPath(new URL("./.accumbens/accumbens.config.json",NoteRoot_full)),JSON.stringify(config,null,4))
// fs.writeFileSync(fileURLToPath(new URL("./.accumbens/accumbens.entries.js",NoteRoot_full)),mdxMapPathFile)

// })();import crypto from "crypto"

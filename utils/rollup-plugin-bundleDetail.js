
export default function encryptPlugin(rules = []) {
  
  return {
    name: 'bundle-detail',
    
     async generateBundle(
      outputOptions,
      outputBundle,
    ){
        console.log(outputOptions,outputBundle)
    }
  };
}  
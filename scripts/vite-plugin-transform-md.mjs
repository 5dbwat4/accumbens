export default function MdTransform(){
    const vmid = "@accumbens-md"
    return {
        name: 'my-plugin',
        resolveId(id) {
            console.log(id);
            
          if (id.startsWith(vmid)) {
            return vmid
          }
        },
        load(id) {
            console.log(id);
            
          if (id.startsWith(vmid)) {
            return `export const msg = "from virtual module"`
          }
        }
      }
}
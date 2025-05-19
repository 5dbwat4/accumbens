import { hashmapContaining } from "@/utils/network/hashmap";
import { getNavConfig } from "../markdown/nav_config";
import { getFileFromHash } from "./getFileFromHash";

async function navContaining(path: string): Promise<string> {
  const nav = await getNavConfig();
  const pathArray = path.split("/");
  function walker(nav: any, index: number): string {
    for (const item of nav) {
      if (
        item.key === pathArray[index] ||
        item?.aliases?.includes(pathArray[index])
      ) {
        if (item.leaf && index + 1 === pathArray.length) {
          return item.nav.find((v) => v.key == "index")?.hash || "";
        }
        if (item.leaf) {
          const constructedPath = pathArray.slice(index + 1).join("/");
          return item.nav.find((v) => v.key == constructedPath)?.hash || "";
        }
        if (!item.leaf && index + 1 === pathArray.length) {
          return item.index_file || "";
        }

        return walker(item.sub, index + 1);
      }
    }
  }
  return walker(nav, 0);
}

export async function getMdFile(path: string): Promise<{
  content: string;
  [key: string]: any;
}> {
  if (path.startsWith("/")) {
    path = path.slice(1);
  }

  console.log(await hashmapContaining("md", path));
  

  const hash: string =
    (await navContaining(path)) || (await hashmapContaining("md", path)) || "";

    if (hash) {
      return getFileFromHash(hash).then((v) => v.json());
    } else {
      return {
        content: "",
      };
    }
}

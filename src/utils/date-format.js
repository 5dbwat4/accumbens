import {format} from "date-fns"

const date_format=(date)=>{
    return format(date,"MMM do, y, H:KK")
}

export{date_format}
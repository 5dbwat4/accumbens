import { formatDistanceToNow } from 'date-fns';

export function toDisplayedFilesize (size: number){
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    while (size >= 1024) {
        size /= 1024;
        i++;
    }
    return size.toFixed(2) + ' ' + units[i];
}


export function timeAgo(time :number){
    return formatDistanceToNow(time, { addSuffix: true });
}
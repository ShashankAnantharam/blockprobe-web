import { isNullOrUndefined } from "util";

let months = ['Jan','Feb','March','April','May','June','July','Aug','Sep','Oct','Nov','Dec'];

export const getShortenedListOfBlockprobes = (blockprobes) => {
    let allBlockprobes = [], currentBlockprobePage = [];
    let count=0;
    if(blockprobes!=null){
        Object.keys(blockprobes).map((key, index) => {
            if(count && count%100==0){
                let page = {
                    blockprobe: currentBlockprobePage
                };
                allBlockprobes.push(page);
                currentBlockprobePage = [];
            }
            let blockprobe = blockprobes[key];
            if(blockprobe!=null){  
                Object.keys(blockprobe).map((bpKey) => {
                    if(blockprobe[bpKey]==undefined){
                        delete blockprobe[bpKey];
                    }
                });
                currentBlockprobePage.push(blockprobe);
                count++;
            }
        } 
        );
    }
    if(currentBlockprobePage.length > 0){
        let page = {
            blockprobe: currentBlockprobePage
        };
        allBlockprobes.push(page);
        currentBlockprobePage = [];
    }    
    return allBlockprobes;
}

export const getShortenedListOfBlockTree = (blockTree) => {
        let bTree = blockTree;
        let count=0;
        let allBlocks = [], currBlockPage = [];
        if(bTree!=null){
            Object.keys(bTree).map((key, index) => {
                if(count && count%100 == 0){
                    let page = {
                        blocks: currBlockPage
                    };
                    allBlocks.push(page);
                    currBlockPage = [];
                }
                let block = bTree[key];
                if(block!=null){
                    if(block.previousKey)
                        block['parent']=block.previousKey;
                    if(!block.children)
                        block['children']=[];    
                    if(block.actionType){  
                        Object.keys(block).map((bKey) => {
                            if(block[bKey]==undefined){
                                delete block[bKey];
                            }
                        });   
                        currBlockPage.push(block);
                        count++;
                    }
                }
            } 
            );
        }
        if(currBlockPage.length > 0){
            let page = {
                blocks: currBlockPage
            };
            allBlocks.push(page);
            currBlockPage = [];
        }

        
        return allBlocks;
        
}

export const getShortenedListOfImages = (imageMapping) => {
    
    //Add images
    let imageMap = imageMapping;
    let countI=0;
    let allImages = [], currImagePage = [];
    if(imageMap!=null){
        Object.keys(imageMap).map((key, index) => {
            if(countI && countI%200==0){
                let page = {
                    images: currImagePage
                };
                allImages.push(page);
                currImagePage = [];
            }
            var image = {
                url: imageMap[key],
                entity: key
            };
            if(image!=null){   
                Object.keys(image).map((imKey) => {
                    if(image[imKey]==undefined){
                        delete image[imKey];
                    }
                });                
                currImagePage.push(image);
                countI++;
            }
        } 
        );
    }
    if(currImagePage.length > 0){
        let page = {
            images: currImagePage
        };
        allImages.push(page);
        currImagePage = [];
    }
    return allImages;
}

export const getShortenedListOfPosts = (posts) => {    
    let count=0;
    let allPosts = [], currPostPage = [];
    if(posts!=null){
        for(let i=0; i<posts.length; i++){
                if(count && count%100 == 0){
                    let page = {
                        posts: currPostPage
                    };
                    allPosts.push(page);
                    currPostPage = [];
                }
                let post = posts[i];
                if(!isNullOrUndefined(post)){
                    currPostPage.push(post);
                    count++;        
                }
            }
    } 
    
    if(currPostPage.length > 0){
        let page = {
            posts: currPostPage
        };
        allPosts.push(page);
        currPostPage = [];
    }
       
    return allPosts;    
}

export const getTextListForBulk = (text) => {
    let textList = [];
    let  curr = '';
    for(let i=0;!isNullOrUndefined(text) && i<text.length; i++){
        curr += text[i];
        if(i && i%10000 == 0){
            textList.push(curr);
            curr  = '';
        }
    }
    if(curr.length>0)
        textList.push(curr);
        
    return textList;
}

export const  extractBlockIndex = (block)=>{
    if(isNullOrUndefined(block))
        return null;    
    
    let title = block.title;
    if(isNullOrUndefined(title))
        return null;

    let a =  title.trim(), aIndex = 0;
    let isAExist = false;
    if(a.length>0 && a.charAt(0)==='#'){
        var num = '';
        for(var i=1; i<a.length; i++){
            
            if((!isNaN(parseInt(a.charAt(i), 10))) || a[i]==='.'){
                num += a.charAt(i);
            }
            else{
                if(num.length > 0){
                    aIndex = parseFloat(num);
                    isAExist = true;
                }
            }
        }
        if(num.length > 0){
            aIndex = parseFloat(num);
            isAExist = true;
        }    
    }
    if(isAExist)
        return aIndex;
    return null;
}

export const validateNumber = (text) => {
    for(let i=0; text && i<text.length; i++){
        let lastChar = text[i];
        if(!((lastChar>='1' && lastChar<='9') || lastChar=='0'))
            return false;
    }
    return true;
}

export const appendCharToString = (str, char, totalLength) => {
    let newStr = '';
    let len = Math.max(0,totalLength - str.length);
    for(let i=0; i<len; i++){
        newStr += String(char);
    }
    newStr += str;
    return newStr;
}

export const getDateTimeString = (timelineBlock) => {
    var ans = "";
    if(timelineBlock.blockDate!=null){      
        if(!isNullOrUndefined(timelineBlock.blockDate.month))  
            ans = ans + months[timelineBlock.blockDate.month] + " ";
        if(!isNullOrUndefined(timelineBlock.blockDate.date))
            ans = ans + timelineBlock.blockDate.date + ", ";
        ans = ans + appendCharToString(String(timelineBlock.blockDate.year),'0',4) + "  ";

        if(timelineBlock.blockTime!=null){
            var temp = "";
            if(timelineBlock.blockTime.hours < 10){
                temp = "0"; 
            }
            temp = temp + timelineBlock.blockTime.hours;
            ans = ans + temp + ":";

            temp = "";
            if(timelineBlock.blockTime.minutes < 10){
                temp = "0"; 
            }
            temp = temp + timelineBlock.blockTime.minutes;
            ans = ans + temp;
        }
    }
    return ans;    
}

export const sortBlocksCommon = (a, b, a_ts = 0, b_ts = 0)=>{
    a = a.trim();        
    b = b.trim();

    var aIndex = 0, bIndex = 0, isAExist = false, isBExist = false;
    if(a.length>0 && a.charAt(0)==='#'){
        var num = '';
        for(var i=1; i<a.length; i++){
            
            if((!isNaN(parseInt(a.charAt(i), 10))) || a[i]==='.'){
                num += a.charAt(i);
            }
            else{
                if(num.length > 0){
                    aIndex = parseFloat(num);
                    isAExist = true;
                }
            }
        }
        if(num.length > 0){
            aIndex = parseFloat(num);
            isAExist = true;
        }    
    }

    if(b.length>0 && b.charAt(0)==='#'){
        var num = '';
        for(var i=1; i<b.length; i++){
            
            if((!isNaN(parseInt(b.charAt(i), 10))) || b[i]==='.'){
                num += b.charAt(i);
            }
            else{
                if(num.length > 0){
                    bIndex = parseFloat(num);
                    isBExist = true;
                }
            }
        }    
        if(num.length > 0){
            bIndex = parseFloat(num);
            isBExist = true;
        }
    
    }

    // A comes after b
    if(!isAExist && isBExist)
        return 1;

    // A comes before b
    if(isAExist && !isBExist)
        return -1;

    // A comes before b
    if(isAExist && isBExist){
        if(aIndex > bIndex)
            return 1;
        return -1;
    }

    if(a_ts > b_ts)
        return 1;
    else if(b_ts > a_ts)
        return -1;

    if(a > b)
        return 1;

    return -1;
}

export const sortTimeline =(timelineList)=>{
    timelineList.sort(function(b,a){
    if(a.blockDate.year!==b.blockDate.year)
        return a.blockDate.year - b.blockDate.year; 
        
    if(a.blockDate.month == null)
        return 1;
    else if(b.blockDate.month == null)
        return -1;

    if(a.blockDate.month!==b.blockDate.month)
        return a.blockDate.month - b.blockDate.month;        

    if(a.blockDate.date == null)
        return 1;
    else if(b.blockDate.date == null)
        return -1;

    if(a.blockDate.date!==b.blockDate.date)
        return a.blockDate.date - b.blockDate.date;

     if(b.blockTime == null &&  a.blockTime!=null){
         return 1;
         //a is greater than or equal to if b has no time
     }
     else if(a.blockTime == null &&  b.blockTime!=null){
        return -1;
        //a is greater than or equal to if b has no time
    }
     
     if(a.blockTime!=null && b.blockTime!=null){
         if(a.blockTime.hours!==b.blockTime.hours){
             return a.blockTime.hours - b.blockTime.hours;
         }
         if(a.blockTime.minutes!==b.blockTime.minutes){
            return a.blockTime.minutes - b.blockTime.minutes;
        }
     }

     //a is not null and b is not null OR both are fully equal
     return sortBlocksCommon(a.title,b.title,a.timestamp,b.timestamp);
    });

    timelineList.reverse();
}

export const filterText = (text) => {
    let ans = '';
    for(let i=0; !isNullOrUndefined(text) && i<text.length; i++){
        if((text[i]>='1' && text[i]<='9') || (text[i]>='a' && text[i]<='z')
            || (text[i]>='A' && text[i]<='Z') || (text[i]=='0') || 
            (text[i]=='.') || (text[i]=='?') || (text[i]==',') || (text[i]=='"') || (text[i]=='\'')
            || (text[i]==' ') || (text[i]=='/'))
            {
                ans += text[i];
            }
        else{
            ans += ' ';
        }
    }
    ans += '\n\n';
    return ans;
}
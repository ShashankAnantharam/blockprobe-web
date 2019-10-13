


export const getShortenedListOfBlockTree = (blockTree) => {
        let bTree = blockTree;
        let count=0;
        let allBlocks = [], currBlockPage = [];
        if(bTree!=null){
            Object.keys(bTree).map((key, index) => {
                if(count==100){
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
            if(countI==100){
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


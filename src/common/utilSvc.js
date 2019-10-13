

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


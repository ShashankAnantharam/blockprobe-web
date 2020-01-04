import { isNullOrUndefined } from "util";
import * as firebase from 'firebase';
import * as Utils from './utilSvc';

export const writePostListToDb =(postList, userId, successFn, errorFn)=>{
    let allPosts = Utils.getShortenedListOfPosts(postList);
    if(allPosts){

        firebase.firestore().collection("publicWall").doc(userId).
        collection("userPosts").get().then((snapshot) => {
                
            snapshot.forEach((doc) => {
                firebase.firestore().collection("publicWall").doc(userId).
                collection("userPosts").doc(doc.id).delete();
            });
                
            for(var i=0; i<allPosts.length; i++){
                firebase.firestore().collection("publicWall").doc(userId).
                    collection("userPosts").doc(String(i)).set(allPosts[i]);        
            }
            if(successFn)
                successFn();
        },
        (error) => {
            if(errorFn)
                errorFn();
        });
    }
}

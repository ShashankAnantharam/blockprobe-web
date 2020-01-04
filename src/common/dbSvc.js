import { isNullOrUndefined } from "util";
import * as firebase from 'firebase';
import * as Utils from './utilSvc';

export const writePostListToDb =(postList, userId, successFn, errorFn)=>{
    let allPosts = Utils.getShortenedListOfPosts(postList);
    if(allPosts &&  allPosts.length>0){

        firebase.firestore().collection("publicWall").doc(userId).
        collection("userPosts").get().then((snapshot) => {
                
            snapshot.forEach((doc) => {
                var ref = firebase.firestore().collection("publicWall").doc(userId).
                collection("userPosts").doc(doc.id).delete();
            });
                
            for(var i=0; i<allPosts.length; i++){
                firebase.firestore().collection("publicWall").doc(userId).
                    collection("userPosts").doc(String(i)).set(allPosts[i]);        
            }
            
            successFn();
        },
        (error) => {
            errorFn();
        });
    }
}

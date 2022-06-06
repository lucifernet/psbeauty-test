import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, getIdToken } from "firebase/auth";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { print } from 'graphql';
import gql from 'graphql-tag';
import axios from 'axios';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzu4iFHYHhXrXByuCU25u7kpgW6b49WEA",
    authDomain: "inspiring-grove-348006.firebaseapp.com",
    projectId: "inspiring-grove-348006",
    storageBucket: "inspiring-grove-348006.appspot.com",
    messagingSenderId: "776282504981",
    appId: "1:776282504981:web:b845a75ff414fcfbbef31c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// This browser doesn't support the API's required to use the Firebase SDK.
// const messaging = getMessaging(app);
//const endpoint = "https://cloud-run-api-psbeauty-deuedjpwuq-de.a.run.app/api/graphql/";
const endpoint = "http://localhost:8080/api/graphql/";
const email = "el.lai@cloudlytics.me"
const password = "12341234"

// test('createUserWithEmailAndPassword', async () => {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     expect(userCredential).not.toBeUndefined();

//     const idToken = await userCredential.user.getIdToken(true);
//     console.log(`idToken : ${idToken}`);
//     // Get device token for firebase cloud messaging.
//     //const client_device_token = getToken(messaging);
//     const client_device_token = "firebase_client_device_token";
//     expect(client_device_token).not.toBeUndefined();

//     // Add user to psbeauty database
//     const ADD_USER = gql`
//     mutation addUser($phone: String, $clientToken: [String], $name: String!) {
//         addUser (input: {                
//             phone: $phone
//             clientToken: $clientToken
//             name: $name
//         }) {
//             id
//         }
//     }`

//     const result = await axios.post(endpoint, {
//         query: print(ADD_USER),
//         variables: {
//             phone: "0909090909",
//             name: "Wang",
//             clientToken: [client_device_token],
//         },
//     }, {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${idToken}`
//         }
//     })
//     console.log(result.data);
//     expect(result.data.data.addUser.id).not.toBeUndefined();
// });

test('signIn', async () => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await getIdToken(userCred.user, false);
    console.log(`idToken: ${idToken}`);

    //exchange custom token for authorized as member/clinic owner/admin
    const CUSTOM_TOKEN = gql`    
    query {
        customToken {
            customToken uid
        }
    }
    `
    const result = await axios.post(endpoint, {
        query: print(CUSTOM_TOKEN),        
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    })
    console.log(result.data);
    expect(result.data.data.customToken.customToken).not.toBeUndefined();
});
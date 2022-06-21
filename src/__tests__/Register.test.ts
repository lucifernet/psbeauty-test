import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, getIdToken, UserCredential } from "firebase/auth";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { getStorage, ref, uploadBytes, uploadString } from "firebase/storage";
import { print } from 'graphql';
import gql from 'graphql-tag';
import axios from 'axios';
import * as fs from "fs";

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
const endpoint = "https://cloud-run-api-psbeauty-deuedjpwuq-de.a.run.app/api/graphql/";
// const endpoint = "http://localhost:8080/api/graphql/";
const email = "el.lai@cloudlytics.me"
const password = "12341234"

test('createUserWithEmailAndPassword', async () => {
    // 設定過程不得超過一分鐘
    jest.setTimeout(60000);

    // 先檢查 email 是否已經註冊
    const EMAIL_EXISTS = gql`
    query emailExists($email: String){
        emailExists(email:  $email) {
            exists
        }
    }`;
    const existResult = await axios.post(endpoint, {
        query: print(EMAIL_EXISTS),
        variables: {
            email: email
        },
    });
    expect(existResult.data.data.emailExists.exists).toBeFalsy();

    let userCredential: UserCredential;
    try {
        // 嘗試註冊
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (signUpError: any) {
        expect(signUpError).toBeUndefined();
        return;
    }
    // 使用者憑證必須有
    expect(userCredential).not.toBeUndefined();

    const idToken = await userCredential.user.getIdToken(true);
    console.log(`idToken : ${idToken}`);
    // 取得 firebase cloud messaging 所需之裝置識別碼，但此程式無法在 nodejs 中執行，
    // 必須在瀏覽器中方能取得。
    // const client_device_token = getToken(messaging);
    const client_device_token = "firebase_client_device_token";
    expect(client_device_token).not.toBeUndefined();

    // Add user to psbeauty database
    const ADD_USER = gql`
    mutation addUser($phone: String, $clientToken: [String], $name: String!) {
        addUser (input: {                
            phone: $phone
            clientToken: $clientToken
            name: $name
        }) {
            id
        }
    }`

    const result = await axios.post(endpoint, {
        query: print(ADD_USER),
        variables: {
            phone: "0909090909",
            name: "El Lai",
            clientToken: [client_device_token],
        },
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    })
    // console.log(result.data);
    expect(result.data.data.addUser.id).not.toBeUndefined();
});

test('signInWithEmailAndPassword', async () => {
    jest.setTimeout(60000);

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

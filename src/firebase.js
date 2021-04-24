import firebase from "firebase";

const firebaseConfig = firebase.initializeApp({
  apiKey: "AIzaSyAXsgG2RYUlIEild0WTlgxlZAwE_lbGQMA",
  authDomain: "whatsapp-clone-ed522.firebaseapp.com",
  projectId: "whatsapp-clone-ed522",
  storageBucket: "whatsapp-clone-ed522.appspot.com",
  messagingSenderId: "508362684102",
  appId: "1:508362684102:web:96f60874b21c579e4289c7",
});

const db = firebaseConfig.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const provider = new firebase.auth.GoogleAuthProvider(); //for google auth
export { db, auth, storage, provider };

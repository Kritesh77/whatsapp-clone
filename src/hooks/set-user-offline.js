import { db } from "../firebase";
export default function getUser(uid) {
  const docId = db
    .collection("users")
    .doc(uid)
    .update({
      isOnline: false,
    })
    .then(console.log("user setOFFLINE"));
}

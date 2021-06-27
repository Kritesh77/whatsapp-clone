import { db } from "../firebase";
export default async function getUser(email) {
  const docId = await db
    .collection("users")
    .where("email", "==", email.toLowerCase())
    .get();
  return docId.docs[0];
}

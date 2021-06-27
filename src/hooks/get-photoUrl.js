import { db } from "../firebase";
export default async function getPhotoUrl(email) {
  const photo = await db
    .collection("users")
    .where("email", "==", email)
    .get()
    .catch((err) => {
      console.error("PHOTO URL ERROR", err);
    });
  return photo.docs[0].data().photoURL;
}

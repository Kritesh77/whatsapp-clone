import { db } from "../firebase";
export default async function usernameExists(email) {
  const checkUser = await db
    .collection("users")
    .where("email", "==", email)
    .get();
  console.log(checkUser.docs.length);
  return checkUser.docs.length;
}

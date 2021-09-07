import { useState, useEffect } from "react";
import { db } from "../firebase";

export default function UserDetails(email) {
  const [username, setUsername] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    var details;
    if (email.length) {
      details = db
        .collection("users")
        .where("email", "==", email)
        .get()
        .then((snap) => {
          var x = snap.docs[0].data();
          console.log("getUserDetails ", x, snap);
          setDocId(snap.docs[0].id);
          setIsOnline(x.isOnline);
          setUsername(x.username);
          setPhotoUrl(x.photoURL);
          const date = new Date(x.lastSeen?.toDate());
          const dateToday = new Date().getDate();
          if (date.getDate() === dateToday) {
            setLastSeen("today");
          } else {
            setLastSeen(
              (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) +
                ":" +
                date.getMinutes() +
                (date.getHours() > 12 ? "PM" : "AM")
            );
          }
        })
        .then(() => setLoading(false));
    }

    // return () => details();
  }, [email]);
  return { isOnline, lastSeen, photoUrl, username, loading, docId };
}

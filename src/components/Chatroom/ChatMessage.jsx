import { Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    margin: 4,
  },
}));
export default function Message({
  message,
  timestamp,
  userMessage,
  user,
  photoUrl,
}) {
  const classes = useStyles();
  const date = new Date(timestamp?.toDate());
  var finalTime =
    (date.getHours() % 12 || 12) +
    ":" +
    date.getMinutes() +
    " " +
    (date.getHours() >= 12 ? "PM" : "AM");
  var currentTime = new Date().getMinutes();
  console.log(photoUrl);
  return (
    <>
      <div
        className={`${
          userMessage && "flex-row-reverse"
        } my-4 flex text-gray-700`}
      >
        <Avatar
          src={userMessage ? user.photoURL : photoUrl}
          className={classes.small}
        ></Avatar>

        <div
          className={`${
            userMessage && " rounded-br-none chat-blue text-right"
          } ${
            !userMessage && "rounded-tl-none chat-gray text-left"
          } text-sm chatbox_message_container rounded-xl self-center`}
        >
          <p className="break-all ">{message}</p>
        </div>
        <p className="text-xs self-center px-4">{finalTime}</p>
      </div>
    </>
  );
}

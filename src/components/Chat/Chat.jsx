import { useEffect, useRef, useState } from 'react'
import '../Chat/Chat.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase/firebase.js'
import { useChatStore } from '../../UserStore/chatStore.js';
import { useUserStore } from '../../UserStore/userStore.js';
import upload from '../../Firebase/upload.js';
import { format } from 'timeago.js';

const Chat = () => {

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [image, setImage] = useState({ file: null, url: '', });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    }

  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setEmojiOpen(false);
  }

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImage({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {

    if (text === "") return;

    let imageUrl = null;

    try {

      if (image.file) {
        imageUrl = await upload(image.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imageUrl && { image: imageUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapShot = await getDoc(userChatsRef);

        if (userChatsSnapShot.exists()) {

          const userChatsData = userChatsSnapShot.data();

          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

    } catch (error) {
      console.log(error);
    } finally {
      setImage({ file: null, url: '', });
    }
    setText('');
  };

  return (
    <>
      <div className='chat'>
        <div className="top">
          <div className="user">
            <img src={user?.avatar || "./avatar.png"} alt="" />
            <div className="texts">
              <span>{user?.username}</span>
              <p>Lorem ipsum dolor sit amet consectetur?</p>
            </div>
          </div>
          <div className="icons">
            <img src="./phone.png" alt="" />
            <img src="./video.png" alt="" />
            <img src="./info.png" alt="" />
          </div>
        </div>

        <div className="center">
          {chat?.messages?.map((message) => {
            return (<>
              <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createAt}>
                <div className="texts">
                  {message.image && <img src={message.image} alt="" />}
                  <p>{message.text}</p>
                  <span>{format(message.createdAt.toDate())}</span>
                </div>
              </div>
            </>);
          })}
          {image.url && (<><div className="message own">
            <div className="texts">
              <img src={image.url} alt="" />
            </div>
          </div></>)}
          <div ref={endRef}></div>
        </div>

        <div className="bottom">
          <div className="icons">
            <label htmlFor="file">
              <img src="./img.png" alt="" />
            </label>
            <input type="file" id='file' style={{ display: 'none' }} onChange={handleImage} />
            <img src="./camera.png" alt="" />
            <img src="./mic.png" alt="" />
          </div>
          <input type="text"
            placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? 'You were blocked by user!!!' : 'Type it here...'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <div className="emoji">
            <img src="./emoji.png" alt="" onClick={() => setEmojiOpen(!emojiOpen)} />
            <div className="picker">
              <EmojiPicker open={emojiOpen} onEmojiClick={handleEmoji} />
            </div>
          </div>
          <button className='send-button'
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >Send</button>
        </div>
      </div>
    </>
  );
};

export default Chat;

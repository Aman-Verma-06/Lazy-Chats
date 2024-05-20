import { useEffect, useState } from 'react'
import '../ChatList/ChatList.css'
import AddUser from './AddUser/AddUser';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../Firebase/firebase.js';
import { useUserStore } from '../../../UserStore/userStore.js';
import { useChatStore } from '../../../UserStore/chatStore.js';

const ChatList = () => {

  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState('');

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data().chats;

      const promises = items.map(async (item) => {

        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data();

        return { ...item, user };

      });

      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));

    });

    return () => {
      unSub();
    }
  }, [currentUser.id]);

  const handleSelect = async (chat) => {

    const userChats = chats.map((item) => {
      const { user, ...res } = item;
      return res;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {

      await updateDoc(userChatsRef, {
        chats: userChats,
      });

      changeChat(chat.chatId, chat.user);

    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) => c.user.username.toLowerCase().includes(input.toLowerCase()));

  return (
    <>
      <div className='chatList'>
        <div className="search">
          <div className="searchBar">
            <img src="./search.png" alt="" />
            <input type="text" placeholder='Search here...' onChange={(e) => setInput(e.target.value)} value={input} />
          </div>
          <img src={addMode ? "./minus.png" : "./plus.png"} alt="" className='add-icon' onClick={() => setAddMode(!addMode)} />
        </div>
        {
          filteredChats.map((chats) => {
            return (<>
              <div className="item"
                key={chats.chatId}
                onClick={() => handleSelect(chats)}
                style={{ backgroundColor: chats?.isSeen ? "transparent" : "green" }}
              >
                <img src={chats.user.blocked.includes(currentUser.id) ? "./avatar.png" : chats.user.avatar || "./avatar.png"} alt="" />
                <div className="text-container">
                  <span>{chats.user.blocked.includes(currentUser.id) ? "User" : chats.user.username}</span>
                  <p>{chats.lastMessage}</p>
                </div>
              </div>
            </>)
          })
        }

        {addMode && <AddUser />}

      </div>
    </>
  );
};

export default ChatList;

import List from './components/List/List.jsx'
import Chat from './components/Chat/Chat.jsx'
import Details from './components/Details/Details.jsx'
import Login from './components/Login/Login.jsx';
import Notification from './components/Notification/Notification.jsx';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './Firebase/firebase.js';
import { useUserStore } from './UserStore/userStore.js';
import { DNA } from 'react-loader-spinner';
import { useChatStore } from './UserStore/chatStore.js';

const App = () => {

  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    })

    return () => {
      unSub();
    }
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading"><DNA
    visible={true}
    height="500"
    width="500"
    ariaLabel="dna-loading"
    wrapperStyle={{}}
    wrapperClass="dna-wrapper"
  /></div>

  return (
    <div className='container'>
      {
        currentUser ? (<>
          <List />
          {chatId && <Chat />}
          {chatId && <Details />}
        </>) : (<Login />)
      }
      <Notification />
    </div>
  )
}

export default App

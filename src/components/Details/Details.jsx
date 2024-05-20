import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../Firebase/firebase'
import { useChatStore } from '../../UserStore/chatStore.js'
import { useUserStore } from '../../UserStore/userStore.js'
import '../Details/Details.css'

const Details = () => {

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlocked, resetChat } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {

      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });

      changeBlocked();

    } catch (error) {
      console.log(error);
    }

  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  }

  return (
    <>
      <div className='detail'>
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <h2>{user?.username}</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        </div>
        <div className="info">
          <div className="option">
            <div className="title">
              <span>Chat Settings</span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Privacy & help</span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Shared photos</span>
              <img src="./arrowDown.png" alt="" />
            </div>
            <div className="photos">
              {/* <div className="photo-item">
                <div className="photo-detail">
                  <img src="./avatar.png" alt="" />
                  <span>photo_2024_2.png</span>
                </div>
                <img src="./dowmload.png" alt="" className='icon' />
              </div>
              <div className="photo-item">
                <div className="photo-detail">
                  <img src="./avatar.png" alt="" />
                  <span>photo_2024_2.png</span>
                </div>
                <img src="./dowmload.png" alt="" className='icon' />
              </div>
              <div className="photo-item">
                <div className="photo-detail">
                  <img src="./avatar.png" alt="" />
                  <span>photo_2024_2.png</span>
                </div>
                <img src="./dowmload.png" alt="" className='icon' />
              </div>
              <div className="photo-item">
                <div className="photo-detail">
                  <img src="./avatar.png" alt="" />
                  <span>photo_2024_2.png</span>
                </div>
                <img src="./dowmload.png" alt="" className='icon' />
              </div> */}
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Shared Files</span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          <button onClick={handleBlock}>{
            isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User Blocked!" : "Block User..!"
          }</button>
          <button className='logout' onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </>
  )
}

export default Details;

import '../UserInfo/UserInfo.css'
import { useUserStore } from '../../../UserStore/userStore.js';

const UserInfo = () => {

  const { currentUser } = useUserStore();

  return (
    <>
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || "./avatar1.jpg"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
    </>
  )
}

export default UserInfo

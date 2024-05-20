import { useState } from 'react'
import '../Login/Login.css'
import { Bounce, toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../Firebase/firebase.js'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import upload from '../../Firebase/upload.js';

const Login = () => {

    const [avatar, setAvatar] = useState({ file: null, url: "", });

    const [loading, setLoading] = useState(false);

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleLogin = async (e) => {

        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }

        toast.error("invalid credentials", {
            position: "top-center",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    };

    const handleRegister = async (e) => {

        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);

        const { username, email, password } = Object.fromEntries(formData);

        //VALIDATE INPUTS
        if (!username || !email || !password) {
            return toast.warn("Please enter inputs");
        }
        if (!avatar.file) {
            return toast.warn("Please upload an avatar!")
        }

        //VALIDATE UNIQUE USERNAME
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapShot = await getDocs(q);
        if (!querySnapShot.empty) {
            return toast.warn("Select another username");
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            toast.success(`Account Created Successfully✌️, You can Login now😄`, {
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className='login'>
                <div className="item">
                    <h2 style={{ marginBottom: '-20px' }}>Welcome Back, Folks<span style={{ fontSize: '80px', marginLeft: '-12px' }}>&#128587;</span></h2>
                    <form onSubmit={handleLogin}>
                        <input type="text" placeholder='Email' name='email' />
                        <input type="password" placeholder='Password' name='password' />
                        <button disabled={loading}>{loading ? "Loading" : "Sign-In"}</button>
                    </form>
                </div>
                <div className="separator"></div>
                <div className="item">
                    <h2>Create an Account<span style={{ fontSize: '40px' }}>✏️</span></h2>
                    <form onSubmit={handleRegister}>
                        <label htmlFor="file">
                            <img src={avatar.url || "./uploadImage.jpg"} alt="" />
                            <span>Upload Image</span>
                        </label>
                        <input type="file" id="file" style={{ display: 'none' }} onChange={handleAvatar} />
                        <input type="text" placeholder='Username' name='username' />
                        <input type="email" placeholder='Email' name='email' />
                        <input type="password" placeholder='Password' name='password' />
                        <button disabled={loading}>{loading ? "Loading" : "Sign-Up"}</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;

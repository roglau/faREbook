import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CgMenuGridO } from 'react-icons/cg';
import { BsBookFill, BsMessenger } from 'react-icons/bs';
import { IoIosLogOut, IoIosNotifications } from 'react-icons/io';
import { getNotif, getUser } from '../provider/UserProvider';
import { PiVideoFill } from 'react-icons/pi';
import Theme from './ThemeChanger';
import { encryptStorage } from '../pages/auth/login';
import LoadingIndicator from './LoadingIndicator';
import { changeTheme } from '../theme/ThemeProvider';
import '../index.css'
import { MdGroups } from 'react-icons/md';


const NavbarNoBg = () => {
  const [showMenuCard, setShowMenuCard] = useState(false);
  const location = useLocation();
  const data = getUser();
  const notifs = getNotif(data)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

  const[showProfileCard, setShowProfileCard] = useState(false)

  const { isDarkMode, toggleTheme } = changeTheme();

  const reset = (except:any) => {
    if(except === showProfileCard){
      setShowMenuCard(false)

    }else if(except === showMenuCard){
      setShowProfileCard(false)
    }else{
      setShowMenuCard(false)
      setShowProfileCard(false)
    }

  }

  const toggleProfileCard = () => {
    if(!showProfileCard)
      reset(showProfileCard);
    
    setShowProfileCard(!showProfileCard);
  };

  const profileContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(event.target as Node)
      ) {
        reset(null);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        profileContainerRef.current &&
        !profileContainerRef.current.contains(event.target as Node)
      ) {
        reset(null);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleLogout = () => {
    setShowProfileCard(false);
    if(isDarkMode){
      toggleTheme()
    }
    encryptStorage.clear();
    navigate('/login')
  }

  useEffect(() => {
    if(!data){
      setLoading(true)
    }
    if(data){
      setLoading(false)      
      
    }
  }, [data])

  return (
    <div className='story-nav'>
      <div className='link'>
        <Link to='/'>
          <img src='https://res.cloudinary.com/diuzx0kak/image/upload/v1691913849/svvpxopkyao4u2dsyx3u.webp' alt='' className='fblogo-link' />
        </Link>
      </div>

      <div className='link'>
        <div onClick={() => { 
          if (!showMenuCard) {
            reset(showMenuCard); 
          }
          setShowMenuCard(!showMenuCard);
        }}>
          <CgMenuGridO className="nav-icon" />
        </div>

        <Link to='/chat'>
          <BsMessenger className={location.pathname === '/chat' ? 'nav-icon active-icon' : 'nav-icon'} />
        </Link>
        <Link to='/notification'>
              <div style={{position:"relative"}}>
                {notifs?.notReadCount > 0 && <p style={{position:"absolute", top:"-0.5em", right:"-0.3em", backgroundColor:"red", borderRadius:"10px", padding:"0.1em",minWidth:"18px", height:"18px" ,color:"white", textAlign:"center"}}>{notifs?.notReadCount}</p>}
                <IoIosNotifications
                  className={location.pathname === '/notification' ? 'nav-icon active-icon' : 'nav-icon'}
                />
              </div>
        </Link>
        <div
          className='profile-container'
          onClick={toggleProfileCard}
        >
          <img
            src={data?.getUserWToken?.profile}
            alt='Profile'
            className='profile-image'
          />
        </div>
      </div>
      {showMenuCard && (
        <div className='profile-card' ref={profileContainerRef}>
          <div className='profile-card-item' onClick={ () => {navigate('/createstory')}}>
              <BsBookFill style={{fontSize:"28px"}}/>
              <p>Create Story</p>
          </div>

          <div className='profile-card-item' onClick={ () => {navigate('/createreel')}}>
              <PiVideoFill style={{fontSize:"28px"}}/>
              <p>Create Reel</p>
          </div>

          <div className='profile-card-item' onClick={ () => {navigate('/creategroup')}}>
              <MdGroups style={{fontSize:"28px"}}/>
              <p>Create Group</p>
          </div>
          
        </div>
      )}

      {showProfileCard && (
        <div className='profile-card' ref={profileContainerRef}>
          <div className='profile-card-item' onClick={ () => {navigate('/profile')}}>
            <img
                  src={data.getUserWToken.profile}
                  alt='Profile'
                  className='profile-icon'
                />
             {data && (<p>{data.getUserWToken.firstname + " " + data.getUserWToken.surname}</p>)}
          </div>
          <div className='profile-card-item'>
            <Theme/>
          </div>
          
          <hr style={{margin:"1em 0"}}/>

          

          <div className='profile-card-item' onClick={handleLogout}>
                <IoIosLogOut
                  className='nav-icon'
                />
              <p>Log out</p>
          </div>

          
        </div>
      )}
      <LoadingIndicator loading={loading} />
    </div>
  )
}

export default NavbarNoBg
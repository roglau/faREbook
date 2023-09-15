import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './Searchbar';
import { AiOutlineHome, AiFillHome } from 'react-icons/ai';
import { FaUserFriends } from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';
import { BsBookFill, BsMessenger } from 'react-icons/bs';
import { IoIosLogOut, IoIosNotifications } from 'react-icons/io';
import '../index.css';
import { encryptStorage } from '../pages/auth/login';
import { gql, useMutation } from '@apollo/client';
import { GET_USER_W_TOKEN } from '../query/query';
import { getInvite, getNotif, getUser } from '../provider/UserProvider';
import {CgMenuGridO} from 'react-icons/cg'
import Theme from './ThemeChanger';
import { changeTheme } from '../theme/ThemeProvider';
import LoadingIndicator from './LoadingIndicator';
import { PiVideoFill } from 'react-icons/pi';

const Header: React.FC = () => {
  const location = useLocation();
  const [searched, setSearched] = useState('');
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showMenuCard, setShowMenuCard] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = changeTheme();
  const[loading, setLoading] = useState(false);

  const data = getUser();
  const notifs = getNotif(data)
  const invites = getInvite(data)


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearched(e.target.value);
  };

  const cancelSearch = () => {
    setSearched('');
  };

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

  const onEnterPress = (e : any) => {
    if(e.target.value.length > 0)
      navigate(`/search/${e.target.value}`);
  }

  return (
     data && (<div>
      {location.pathname === '/story'|| location.pathname.startsWith("/reset") ||location.pathname === '/createstory'|| location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/story') || location.pathname === '/createreel' || location.pathname === '/reel' || location.pathname === '/creategroup' || location.pathname.startsWith('/activate/') ? null : (
        <nav>
          <div className='link'>
            <Link to='/'>
              <img src='https://res.cloudinary.com/diuzx0kak/image/upload/v1691913849/svvpxopkyao4u2dsyx3u.webp' alt='' className='fblogo-link' />
            </Link>
            <SearchBar
              value={searched}
              onChange={handleSearch}
              onCancelSearch={cancelSearch}
              placeholder='Search'
              onEnterPress={(e : any) => onEnterPress(e)}
            />
          </div>
          <div className='link-mid'>
            <Link to='/' >
              <AiFillHome className={location.pathname === '/' ? 'nav-icon active-icon' : 'nav-icon'}/>
            </Link>
            <Link to='/friend' >
              <FaUserFriends className={location.pathname === '/friend' ? 'nav-icon active-icon' : 'nav-icon'}/>
            </Link>
            <Link to='/group' >
              <MdGroups className={location.pathname === '/group' ? 'nav-icon active-icon' : 'nav-icon'}/>
            </Link>
            <Link to='/reel' >
              <PiVideoFill className={location.pathname === '/reel' ? 'nav-icon active-icon' : 'nav-icon'}/>
            </Link>
          </div>
          <div className='link'>
            <div onClick={() => { 
              if(!showMenuCard)
                reset(showMenuCard); 
              setShowMenuCard(!showMenuCard)}}>
              <CgMenuGridO className="nav-icon"/>
            </div>

            <Link to='/chat'>
              <BsMessenger className={location.pathname === '/chat' ? 'nav-icon active-icon' : 'nav-icon'} />
            </Link>
            <Link to='/notification'>
              <div style={{position:"relative"}}>
                {(notifs?.notifs?.notReadCount > 0 || invites?.invites?.getAllInvite?.length > 0) && <p style={{position:"absolute", top:"-0.5em", right:"-0.3em", backgroundColor:"red", borderRadius:"10px", padding:"0.1em",minWidth:"18px", height:"18px" ,color:"white", textAlign:"center"}}>{notifs?.notifs?.notReadCount + invites?.invites?.getAllInvite?.length}</p>}
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
        </nav>
      )}

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
          <div className='profile-card-item' onClick={ () => { navigate('/profile', { state: { userId: data?.getUserWToken?.id } })}}>
            <img
                  src={data?.getUserWToken?.profile}
                  alt='Profile'
                  className='profile-icon'
                />
             {data && (<p>{data?.getUserWToken?.firstname + " " + data?.getUserWToken?.surname}</p>)}
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

          
          <LoadingIndicator loading={loading} />
        </div>
      )}
    </div>)
  );
};

export default Header;

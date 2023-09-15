import React, {useState, useRef, useEffect} from 'react'
import '../index.css'
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import { IoIosLogOut, IoIosNotifications } from 'react-icons/io';
import Theme from '../components/ThemeChanger';
import { BsBookFill, BsMessenger } from 'react-icons/bs';
import {  PiVideoFill } from 'react-icons/pi';
import {  AiFillLike, AiFillPauseCircle, AiFillPlayCircle } from 'react-icons/ai';
import { CgMenuGridO } from 'react-icons/cg';
import { encryptStorage } from './auth/login';
import { getUser } from '../provider/UserProvider';
import { changeTheme } from '../theme/ThemeProvider';
import { CREATE_LIKE, CREATE_NOTIF, GET_ALL_REELS } from '../query/query';
import { useMutation, useQuery } from '@apollo/client';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BiSolidComment } from 'react-icons/bi';
import ReelsCommentDialog from '../components/ReelsCommentDialog';
import NavbarNoBg from '../components/NavbarNoBg';

const Reel = () => {
  const data = getUser()
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showMenuCard, setShowMenuCard] = useState(false);
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

  const profileContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: reels, refetch:refetchReels } = useQuery(GET_ALL_REELS);

  useEffect(() => {
    if(data && reels){
        setLoading(false)
    }else{
        setLoading(true)
    }
  },[data, reels])

  const[currSlide, setCurrSlide] = useState<any>(0)

  useEffect(() => {
    if(!data){
      setLoading(true)
    }
    if(data){
      setLoading(false)    
    }
  }, [data])

  const handlePrevSlide = () => {
    if (currSlide > 0) {
      setCurrSlide(currSlide - 1);
    }
  };

  const handleNextSlide = () => {
    setVideoPlaying(true)
    if (currSlide < reels?.getAllReels?.length - 1) {
      setCurrSlide(currSlide + 1);
    }else{
      setCurrSlide(0)
    }
  };

  const [videoPlaying, setVideoPlaying] = useState(true); // Initialize to true if you want the video to start playing

  const handleVideoClick = () => {
    setVideoPlaying(prevState => !prevState);
  };


  const [createPostLike] = useMutation(CREATE_LIKE)
  const [createNotif] = useMutation(CREATE_NOTIF)

  const handleLikeReels = async(reels : any, likes: any) => {
    const l = await likes.some((user : any) => user.id === data.getUserWToken.id)
    console.log(reels, likes)
    const inputLike ={
      postID: reels.id,
      userID: data?.getUserWToken?.id,
      liked: l
    }

    // console.log(inputLike)

    createPostLike({
      variables : {
        inputLike : inputLike,
      }
    }).then(async (response) => {
      await refetchReels()
    })

    if(reels.userID !== data.getUserWToken.id && !l){
      await createNotif({
        variables : {
          inputNotif : {
            userID: reels.userID,
            notif: "Someone has liked on your reel",
            user2ID: data.getUserWToken.id,
          }
        }
      })
    }
  }
  
  const [selectedReels, setSelectedReels] = useState<any>()
  const [openComment, setOpenComment] = useState(false);

  const handleComments = async (reels:any) => {
    console.log(reels)
    await setSelectedReels(reels)

    setOpenComment(true)
  }

  const handleCloseComment = async() => {
    await refetchReels()
    setSelectedReels(undefined)
    setOpenComment(false) 
    
  }


  return (
    data && (
    <>
        <NavbarNoBg/>

        <div className='reel-container'>
          <div className='reel-preview'>
            
            <div className='reels-content'>
              
            {currSlide > 0 ? (
              <div onClick={handlePrevSlide} style={{ margin: '1em' }}>
                <FiChevronLeft style={{ width: '24px', height: '24px' }} />
              </div>
            ) : (
              <div style={{ margin: '1em', width: '24px', height: '24px' }}></div>
            )}

              <div
                style={{
                  width: '100%',
                  height: '92.5%',
                  backgroundPosition: 'center',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position:"relative"
                }}
              >
                {/* <div  style={{ width: "95%", height:"0.2em", background:"white", opacity:"20%", margin:"0.5em",position:"absolute", top:"0", left:"0" }}> */}
                  {/* <div  style={{ width: `${loadingProgress}%`, height:"0.2em", background:"blue"}}/> */}
                {/* </div> */}
                <video
                  autoPlay
                  onEnded={(event) => {
                    const video = event.currentTarget;
                    video.currentTime = 0;
                    video.play();
                  }}
                  onClick={(event : any) => {
                    const video = event.currentTarget;
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                    handleVideoClick()
                  }}
                  key={reels?.getAllReels[currSlide]?.reels.video}
                  className='reels-video'
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                >
                  <source src={reels?.getAllReels[currSlide]?.reels.video} type="video/mp4" />
                </video>

                {reels?.getAllReels[currSlide]?.reels.video && (
                  <div style={{position:"absolute", top:"0.5em", left:"1em", display:"flex", alignItems:"center", gap:"1em"}}>
                    <img src={reels?.getAllReels[currSlide]?.user.profile} alt="" style={{width:"30px", height:"30px", borderRadius:"50%"}} />
                    <p>{reels?.getAllReels[currSlide]?.user.firstname + " " + reels?.getAllReels[currSlide]?.user.surname}</p>
                  </div>
                )}

                {reels?.getAllReels[currSlide]?.reels.text && (
                  <div
                  style={{
                    position: "absolute",
                    bottom: "1em",
                    left: "1em",
                    display: "flex",
                    alignItems: "flex-end", // Align text to the bottom
                    gap: "1em",
                    maxWidth: "90%",
                    overflowX: "hidden",
                    overflowY: "auto",
                    maxHeight: "3em", // Set a maximum height to trigger scrolling
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      whiteSpace: "nowrap", // Prevent text from wrapping
                      overflow: "hidden", // Hide overflowing text
                      textOverflow: "ellipsis", // Display an ellipsis (...) for overflow
                    }}
                  >
                    {reels?.getAllReels[currSlide]?.reels?.text}
                  </h3>
                </div>
                
                )}

                {reels?.getAllReels[currSlide]?.reels.video && (
                  <div style={{position:"absolute", top:"0.5em", right:"1em"}}>
                    {videoPlaying ? (
                      <AiFillPauseCircle style={{fontSize:"28px"}} />
                    ) : (
                      <AiFillPlayCircle style={{fontSize:"28px"}} />
                    )}
                  </div>
                )}

              </div>
              {currSlide < reels?.getAllReels?.length - 1 ? (
                <div onClick={handleNextSlide} style={{ margin: '1em' }}>
                <FiChevronRight style={{ width: '24px', height: '24px' }} />
              </div>
              ) : (
                <div style={{ margin: '1em', width: '24px', height: '24px' }}></div>
              )}

              <div style={{position:"absolute", bottom:"2em", right:"1em", display:"flex", flexDirection:"column", gap:"1em"}}>
                  <div style={{display:"flex", flexDirection:"column", gap:"0.5em", cursor:"pointer"}} onClick={() => {handleLikeReels(reels?.getAllReels[currSlide]?.reels, reels?.getAllReels[currSlide]?.likes)}}>
                    <AiFillLike className={`forum-action ${reels?.getAllReels[currSlide]?.likes.some((user : any) => user.id === data.getUserWToken.id) ? 'liked' : ''}`} style={{fontSize:"28px"}} />
                    <p style={{width:"100%", textAlign:"center"}}>{reels?.getAllReels[currSlide]?.likes?.length}</p>
                  </div>
                  <div style={{display:"flex", flexDirection:"column", gap:"0.5em", cursor:"pointer"}} onClick={() => {handleComments(reels?.getAllReels[currSlide]?.reels)}}>
                    <BiSolidComment style={{fontSize:"28px"}}/>
                    <p style={{width:"100%", textAlign:"center"}}>{reels?.getAllReels[currSlide]?.comments?.length}</p>              
                  </div>
              </div>
            </div>
          </div>
        </div>
      <LoadingIndicator loading={loading} />
      <ReelsCommentDialog onClose={handleCloseComment} open={openComment} disableBackdropClick={false} reel={selectedReels} userId={data.getUserWToken.id}/>
    </>)
  )
}
export default Reel
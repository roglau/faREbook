import React, { useEffect, useState } from 'react';
import { encryptStorage } from './auth/login';
import { gql, useMutation, useQuery } from '@apollo/client';
import { CREATE_LIKE, CREATE_NOTIF, DELETE_POST, GET_ALL_POST, GET_ALL_STORY, GET_USER_W_TOKEN } from '../query/query';
import Theme from '../components/ThemeChanger';
import PostDialog from '../components/PostDialog';
import { getUser } from '../provider/UserProvider';
import { formatDistanceToNow } from 'date-fns';
import { AiFillLike, AiFillPlusCircle } from 'react-icons/ai';
import {BiSolidComment, BiSolidShare} from 'react-icons/bi'
import MediaCarousel from '../components/Carousel';
import CommentDialog from '../components/CommentDialog';
import LoadingIndicator from '../components/LoadingIndicator';
import {AiFillFileImage, AiOutlineDelete} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const data = getUser();

  const[offset, setOffset] = useState(0)
  const[limit, setLimit] = useState(5)

  const { data: forums, loading: loadingPost, refetch } = useQuery(GET_ALL_POST, {
    variables: {
      offset: offset,
      limit: limit,
    },
  });

  const { data: stories, refetch:refetchStories } = useQuery(GET_ALL_STORY, {
    variables : {
      userID: data?.getUserWToken?.id
    }
  });
  // console.log(stories)
  const [userStory, setUserStory] = useState<any>() 
  const [othersStory, setOthersStory] = useState<any>()

  useEffect(() => {
    // Trigger the refetch of both queries when the component is mounted (page loaded)
    refetch();
    refetchStories();
  }, []);

  

  useEffect(() => {
    if(data && stories && forums){
        setLoading(false)
    }else{
        setLoading(true)
    }
  },[data, stories, forums])

  useEffect(() => {
    console.log(userStory, othersStory)
  },[userStory, othersStory])

  useEffect(() => {
    const fetchStories = async () => {
      await setUserStory(stories.getAllStory.filter((storyList: any) => {
        return storyList.user.id === data.getUserWToken.id;
     }))

     await setOthersStory(stories.getAllStory.filter((storyList: any) => {
      return storyList.user.id !== data.getUserWToken.id;
    }))

    }
    if(stories && stories.getAllStory && data.getUserWToken){
      fetchStories()
    }
  },[stories, data])

  const navigate = useNavigate()

  

  const[loading, setLoading] = useState(false)

  const [createPostLike] = useMutation(CREATE_LIKE)
  const [createNotif] = useMutation(CREATE_NOTIF)

  const [selectedForum, setSelectedForum] = useState<any>()


  const [openDet, setOpenDet] = useState(false);
  const handleCloseDet = () => {
    setOpenDet(false);
  };

  const [openComment, setOpenComment] = useState(false);

  const handleComment = async (forum : any) => {
      await setSelectedForum(forum)

      setOpenComment(true)
  }

  const [currForums, setCurrForums] = useState<any>([]);
  const [deleteForum, setDeleteForum] = useState<any>();

  useEffect(() => {
    if(forums != undefined && forums.getAllPost){
      setCurrForums(forums.getAllPost) 
    }
    // console.log(forums)
  },[forums])

  useEffect(() => {
    // console.log(currForums)
    // console.log(selectedForum)
  },[currForums, selectedForum])

  const handleCloseComment = async() => {
    await refetch()
    setSelectedForum(undefined)
    setOpenComment(false) 
    
  }

  const handleLike = async(post : any, likes :any) => {
    const l = await likes.some((user : any) => user.id === data.getUserWToken.id)
    const inputLike ={
      postID: post.id,
      userID: data.getUserWToken.id,
      liked: l
    }

    // console.log(inputLike)

    await createPostLike({
      variables : {
        inputLike : inputLike,
      }
    }).then(async (response) => {
      console.log(response)
      await refetch()
      // setLoading(false)
    })

    if(post.userID !== data.getUserWToken.id && !l ){
      await createNotif({
        variables : {
          inputNotif : {
            userID: post.userID,
            notif: "Someone has liked your post",
            user2ID: data.getUserWToken.id,
          }
        }
      })
    }
  }

  var placeholder = 'What\s on your mind? ';
  
  if(data)
  placeholder += data.getUserWToken.firstname;

  const refetchForum = async (forumID : any) => {
    await refetch()
  }

  const [hasMoreData, setHasMoreData] = useState(true)

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollHeight - (scrollTop + clientHeight) < 130 && !loading && hasMoreData) {
      setLoading(true)

      // let newOffset = 0
      // if(forums){
      //   newOffset = offset + limit
      // }

      // setOffset(newOffset);
      setLimit(limit + 5)

      // Refetch data with the updated offset
      refetch({
        limit: limit,
      }).then((response) => {
        console.log(response)
        if (response.data.getAllPost.length >= limit) {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        } 
        else {
          // No new items fetched, stop infinite scrolling
          setHasMoreData(false);
          setLoading(false);
        }
      })

    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);

  // console.log(forums)

  const [deletePost] = useMutation(DELETE_POST)

  const handleDeletePost = async(forum : any) => {
    deletePost({
      variables : {
        postID : forum.posts.id
      }
    }).then(async (response) => {
      console.log(response)
      await setCurrForums((prevCurrForums : any) => prevCurrForums.filter((post : any) => post.posts.id !== forum.posts.id));
      await refetch()
    })
  }
  
  return (
    data && (<div className='homecontent-container'>
      <div className='homecontent-side'>
        {/* {data.getUserWToken.firstname} */}
      </div>

      <div className='homecontent-mid'>
        <div className='mid-story'>
          <div style={{width:"8em", height:"100%", borderRadius:"10px", backgroundImage:`url(${data.getUserWToken.profile})`, backgroundColor:"var(--nav-color)"  , backgroundPosition: 'center', display:"flex", alignItems:"flex-end", justifyContent:"center", cursor:"pointer"}} onClick={() => navigate('/createstory')}>
              <div style={{height:"2.5em", width:"100%", backgroundColor:"var(--nav-color)", display:"flex", alignItems:"flex-end", gap:"1em", padding:"0.3em", borderBottomLeftRadius:"10px", borderBottomRightRadius:"10px", position:"relative"}}>
                <AiFillPlusCircle style={{color:"rgb(7, 123, 205)", fontSize:"28px", position:"absolute", top:"-0.4em", left:"38%" , border:"3px solid var(--nav-color)", borderRadius:"50%", backgroundColor:"var(--nav-color)"}}/>
                <h4>Make Your Story</h4>
              </div>
          </div>
          {userStory?.length > 0 && (
            <div
              style={{
                width: "8em",
                height: "100%",
                borderRadius: "10px",
                backgroundColor: userStory[0]?.stories[0].image
                  ? ""
                  : userStory[0]?.stories[0].bgColor,
                backgroundImage: userStory[0]?.stories[0].image
                  ? `url(${userStory[0]?.stories[0].image})`
                  : "",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative" // Add this to the parent div
              }}
              onClick={() => {navigate('/story', { state: { userId: userStory[0].user.id } })}}
            >
              <img
                src={data.getUserWToken.profile}
                alt=""
                style={{
                  borderRadius:"50%",
                  border:"4px var(--nav-color) solid",
                  width: "36px",
                  height: "36px",
                  position: "absolute", // Position the image absolutely within the parent div
                  top: "10%", // Align the image to the top
                  left: "10%" // Align the image to the left
                }}
              />
              <div
                style={{
                  height: "4em",
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: "1em",
                  padding: "0.3em",
                  borderRadius: "10px"
                }}
              >
                <h4>Your Story</h4>
              </div>
            </div>
          )}

          {othersStory && othersStory?.map((story: any, index :number) => (
            <div
              style={{
                width: "8em",
                height: "100%",
                borderRadius: "10px",
                backgroundColor: story.stories[0].image ? "" : story.stories[0].bgColor,
                backgroundImage: story.stories[0].image ? `url(${story.stories[0].image})` : "",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative"
              }}
              onClick={() => navigate('/story', { state: { userId: story.user.id } })}
            >
              <img
                src={story.user.profile} // Use the user's profile image
                alt=""
                style={{
                  borderRadius: "50%",
                  border: "4px var(--nav-color) solid",
                  width: "36px",
                  height: "36px",
                  position: "absolute",
                  top: "10%",
                  left: "10%",
                }}
              />
              <div
                style={{
                  height: "4em",
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: "1em",
                  padding: "0.3em",
                  borderRadius: "10px"
                }}
              >
                <h4>{story.user.firstname + " " +story.user.surname}</h4>
              </div>
            </div>
          ))}      


        </div>
        <div className='mid-content'>
          <img
            src='defaultprofile.png'
            alt='Profile'
            className='profile-image'
          />
          <input type="text" className='homecontent-mid-text' onClick={() => setOpenDet(true)} placeholder={placeholder} />
        </div>
        
        {currForums && currForums.map((forum : any, index : number) => (
        <div className='mid-forum'>
          <div style={{width:"100%", display: "flex", alignItems:"center"}}>
            <div className='forum-profile-con'>
              <img src={forum.posts.user.profile} alt="" className='profile-icon' />
              <div>
                <p>{forum.posts.userName}</p>
                <h5>{formatDistanceToNow(new Date(forum.posts.createdAt))} ago</h5>
              </div>

            </div>
            {forum.posts.userID === data.getUserWToken.id && (<div onClick={() => handleDeletePost(forum)}>
                < AiOutlineDelete className='forum-icons'/>
              </div>)}
          </div>

            <div className='forum-content-con'>
              <div style={{fontSize:"20px"}} dangerouslySetInnerHTML = {{ __html: forum.posts.content}}/>
            </div>

            {forum.medias && forum.medias.length > 0 && (
              <div className='forum-media-con'>
                <MediaCarousel media={forum.medias} />
              </div>
            )}

            <div className='forum-count-con'> 
              <div style={{display:"flex",gap:"0.3em", alignItems:"center"}}>
                <AiFillLike className='count-icons' />
                <p>{forum.likes.length}</p>
              </div>
              <div style={{display:"flex",gap:"0.3em", alignItems:"center"}}>
                <BiSolidComment className='count-icons'/>
                <p>{forum.comments.length}</p>
                <BiSolidShare className='count-icons' />
              </div>
            </div>

            <hr />

            <div className='forum-actions-con'>
              <div className={`forum-action ${forum.likes.some((user : any) => user.id === data.getUserWToken.id) ? 'liked' : ''}`} onClick={() => handleLike(forum.posts, forum.likes)}>
                <AiFillLike className='forum-icons' />
                <p className='icon-name'>Like</p>
              </div>
              <div className='forum-action' onClick={() => handleComment(forum)}>
                <BiSolidComment className='forum-icons'/>
                <p className='icon-name'>Comment</p>
              </div>
              <div className='forum-action'>
                <BiSolidShare className='forum-icons' />
                <p className='icon-name'>Share</p>
              </div>
            </div>
        </div>
        ))}
      </div>

      <div className='homecontent-side'>
      </div>

      <PostDialog onClose={handleCloseDet} open={openDet} disableBackdropClick={false} profile={data.getUserWToken.profile} name={data.getUserWToken.firstname + " " + data.getUserWToken.surname} userId={data.getUserWToken.id} refetch={refetch} />
      <CommentDialog onClose={handleCloseComment} open={openComment} disableBackdropClick={false} forum={selectedForum} userId={data.getUserWToken.id} refetchForum={refetchForum}/>

      <LoadingIndicator loading={loading} />
    </div>)
  );
};

export default Home;

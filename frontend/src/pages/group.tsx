import React, {useState, useRef, useEffect} from 'react'
import '../index.css'
import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '../provider/UserProvider';
import LoadingIndicator from '../components/LoadingIndicator';
import { AiFillFileImage, AiFillLike, AiFillPlusCircle, AiFillSetting } from 'react-icons/ai';
import {PiTextAaBold} from 'react-icons/pi'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_GROUP, CREATE_LIKE, CREATE_STORY, GET_ALL_FRIEND, GET_ALL_GROUP_USER } from '../query/query';
import Axios from 'axios';
import NavbarNoBg from '../components/NavbarNoBg';
import { Option } from '../components/ChatDialog';
import CustomSelect from '../components/CustomSelect';
import CustomSnackbar from '../components/CustomSnackbar';
import SearchBar from '../components/Searchbar';
import { MdFeed, MdGroups } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import MediaCarousel from '../components/Carousel';
import { BiSolidComment, BiSolidShare } from 'react-icons/bi';
import GroupCommentDialog from '../components/GroupCommentDialog';

const Group = () => {
    const data = getUser()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const {data : userGroups, refetch:refetchUsersGroup} = useQuery(GET_ALL_GROUP_USER, {
      variables : {
        userID : data?.getUserWToken?.id
      }
    })

    console.log(userGroups?.getAllGroupUser)

    const handleErrorClose = () => {
        setErrorOpen(false);
    };
  
    useEffect(() => {
      if(!data){
        setLoading(true)
      }
      if(data){
        setLoading(false)
      }
    }, [data])

  const [posts, setPosts] = useState<any[]>([]);
  const [limit, setLimit] = useState(5)
  const [hasMoreData, setHasMoreData] = useState(true)

  useEffect(() => {
    if (userGroups) {
      const allPosts: any[] = [];
      for (const group of userGroups?.getAllGroupUser) {
        for(const post of group.posts){
          const modifiedPost = {
            ...post,
            group: {
              ...group,
              posts: undefined // Exclude group.posts from the nested group object
            }
          }
          console.log(modifiedPost)
          allPosts.push(modifiedPost);
        }
      }
      const limitedPosts = allPosts.slice(0, limit - 1);
      console.log(limitedPosts)
      setPosts(limitedPosts);

      if (limit > allPosts.length) {
        setHasMoreData(false);
      } 
    }
  }, [userGroups, limit]);

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollHeight - (scrollTop + clientHeight) < 130 && !loading && hasMoreData) {
      setLoading(true)

      setLimit(limit + 5)      

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading]);

    useEffect(() => {
      console.log(posts)
    },[posts])

    const [openComment, setOpenComment] = useState(false);
    const [selectedForum, setSelectedForum] = useState<any>();

    const [openDet, setOpenDet] = useState(false);
    const handleCloseDet = () => {
        setOpenDet(false);
    };

    const handleComment = async (forum : any) => {
      await setSelectedForum(forum)

      setOpenComment(true)
    }


    const handleCloseComment = async() => {
        // await refetch()
        // setSelectedForum(undefined)
        setOpenComment(false) 
        
      }

    const [createPostLike] = useMutation(CREATE_LIKE)
    
    const handleLike = async(post : any, likes :any) => {
      const l = await likes.some((user : any) => user.id === data.getUserWToken.id)
      const inputLike ={
        postID: post.id,
        userID: data.getUserWToken.id,
        liked: l
      }
  
      // console.log(inputLike)
  
      createPostLike({
        variables : {
          inputLike : inputLike,
        }
      }).then(async (response) => {
        // console.log(response)
        await refetchUsersGroup()
      }).catch(() => {
        // setErrorMessage(error.message)
        // setErrorOpen(true)
      })
      // console.log(post)
    }
    
  
    return (
      data && (
      <div> 
        <div className='sidebar'>
          <div className='sidebar-content' style={{position:"relative"}}>
              <div style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"1.5em"}}>
                  <h1>Group</h1>
                  <AiFillSetting className="nav-icon"/>
              </div>
              
            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"0.75em"}}>
            <MdFeed className={location.pathname === '/friend' ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>Your Feed</h3>
            </div>
            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"0.75em"}}>
            <MdGroups className={location.pathname === '/friend' ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>Your Groups</h3>
            </div>
            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"0.75em", cursor:"pointer"}} onClick={() => {
              navigate('/creategroup')
            }}>
            <AiFillPlusCircle className={location.pathname === '/friend' ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>Create Group</h3>
            </div>
            <div className='separate-line'/>
            <h2>Groups you have joined</h2>
            {userGroups?.getAllGroupUser?.map((group: any) => (
              <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"0.75em", cursor:"pointer"}} onClick={ () => { navigate('/groupprofile', { state: { groupID: group.group.id } })}}>
                  <img src={group.group.profile} style={{width:"28px", height:"28px", borderRadius:"50%"}} />
                  <h3>{group.group.name}</h3>
                  {group.isAdmin && (
                    <span>Admin</span>
                  )}
                  {group.isMember && !group.isAdmin && (
                    <span>Member</span>
                  )}
              </div>
            ))}
          </div>
  
        </div>
        <div className='story-container'>
          <div className="group-content">
          {posts.map((forum: any) => (
          <div className='mid-forum'>
            <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
              <div className='forum-profile-con'>
                <img src={forum.group.group.profile} alt="" className='profile-icon' />
                <div>
                  <p>{forum.group.group.name}</p>
                  <h5>{forum.posts.user.firstname + " " + forum.posts.user.surname + " - "}{formatDistanceToNow(new Date(forum.posts.createdAt))} ago</h5>
                </div>
              </div>
            </div>

            <div className='forum-content-con'>
              <div style={{ fontSize: "20px" }} dangerouslySetInnerHTML={{ __html: forum.posts.content }} />
            </div>

            {forum.medias && forum.medias.length > 0 && (
              <div className='forum-media-con'>
                <MediaCarousel media={forum.medias} />
              </div>
            )}

            <div className='forum-count-con'>
              <div style={{ display: "flex", gap: "0.3em", alignItems: "center" }}>
                <AiFillLike className='count-icons' />
                <p>{forum.likes.length}</p>
              </div>
              <div style={{ display: "flex", gap: "0.3em", alignItems: "center" }}>
                <BiSolidComment className='count-icons' />
                <p>{forum.comments.length}</p>
                <BiSolidShare className='count-icons' />
              </div>
            </div>

            <hr />

            <div className='forum-actions-con'>
              <div className={`forum-action ${forum.likes.some((user: any) => user.id === data.getUserWToken.id) ? 'liked' : ''}`} onClick={() => handleLike(forum.posts, forum.likes)}>
                <AiFillLike className='forum-icons' />
                <p className='icon-name'>Like</p>
              </div>
              <div className='forum-action' onClick={() => handleComment(forum)}>
                <BiSolidComment className='forum-icons' />
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

        </div>
        <GroupCommentDialog onClose={handleCloseComment} open={openComment} disableBackdropClick={false} forum={selectedForum} userId={data.getUserWToken.id} refetchForum={refetchUsersGroup}/>
        <LoadingIndicator loading={loading} />
        <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      </div>)
    )
}

export default Group
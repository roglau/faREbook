import React, {useEffect, useState} from 'react'
import '../../index.css'
import { getUser } from '../../provider/UserProvider';
import {AiFillCheckCircle, AiFillCloseCircle, AiFillEdit, AiFillLike, AiFillMessage, AiFillPlusCircle, AiOutlineDelete} from 'react-icons/ai';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_FRIEND, CREATE_LIKE, CREATE_REQUESTS, DELETE_POST, DELETE_REQUEST, DELETE_REQUEST_REQUESTER, DELETE_REQUEST_TARGET, GET_ALL_POST_USER, GET_ALL_REELS, GET_ALL_REELS_USER, GET_FRIEND_W_MUTUALS, GET_SUGGESTED_FRIENDS, GET_USER_ID, GET_USER_W_REQUEST, UPDATE_PROFILE } from '../../query/query';
import { formatDistanceToNow } from 'date-fns';
import MediaCarousel from '../../components/Carousel';
import { BiSolidComment, BiSolidShare } from 'react-icons/bi';
import CommentDialog from '../../components/CommentDialog';
import PostDialog from '../../components/PostDialog';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useLocation, useNavigate } from 'react-router-dom';
import EditProfileDialog from '../../components/EditProfileDialog';
import Axios from 'axios'

const Profile = () => {
    
    const location = useLocation();
    const sensitiveUserId = location.state?.userId;
    const data = getUser()
    const navigate = useNavigate()
    
    const { data: user, refetch: refetchUser } = useQuery(
      data?.getUserWToken?.id === sensitiveUserId ? GET_USER_ID : GET_USER_W_REQUEST,
      {
        variables: {
          id: sensitiveUserId,
          userID: data?.getUserWToken?.id,
          otherID: sensitiveUserId,
        },
      }
    );

    const [createPostLike] = useMutation(CREATE_LIKE)
    const [deletePost] = useMutation(DELETE_POST)

    var placeholder = 'What\s on your mind? ';

    const { data: reels, refetch:refetchReels } = useQuery(GET_ALL_REELS_USER, {
      variables: {
        userID : sensitiveUserId
      },
    });

    const { data: forums, refetch } = useQuery(GET_ALL_POST_USER, {
        variables: {
          id : sensitiveUserId
        },
      });

    const {data: suggestions, refetch:refetchSuggestions} = useQuery(GET_SUGGESTED_FRIENDS,{
      variables : {
        userID : data?.getUserWToken?.id
      }
    })

    const {data: friends, refetch: refetchFriends} = useQuery(GET_FRIEND_W_MUTUALS,{
      variables :{
        userID : sensitiveUserId
      }
    })

    // console.log(friends?.getAllFriendWMutuals)
    
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        if(data && user && forums && suggestions){
            setLoading(false)
        }else{
            setLoading(true)
        }
    },[data, user, forums, suggestions])

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
          await refetch()
          // setLoading(false)
        }).catch((error) => {
          // setErrorMessage(error.message)
          // setErrorOpen(true)
        })
        console.log(post)
      }

      const [openComment, setOpenComment] = useState(false);

      const [openDet, setOpenDet] = useState(false);
        const handleCloseDet = () => {
            setOpenDet(false);
        };

      const handleComment = async (forum : any) => {
        await setSelectedForum(forum)
  
        setOpenComment(true)
    }

    const handleCloseComment = async() => {
        await refetch()
        setSelectedForum(undefined)
        setOpenComment(false) 
        
      }

    const refetchForum = async (forumID : any) => {
        await refetch()
    }

    const [selectedForum, setSelectedForum] = useState<any>()
    const [selectedNav, setSelectedNav] = useState<any>("Post")

    const handleDeletePost = async(forum : any) => {
        deletePost({
          variables : {
            postID : forum.posts.id
          }
        }).then(async (response) => {
          console.log(response)
        //   await setCurrForums((prevCurrForums : any) => prevCurrForums.filter((post : any) => post.posts.id !== forum.posts.id));
          await refetch()
        })
      }

    const [createFriend] = useMutation(CREATE_FRIEND)
    const [deleteRequest] = useMutation(DELETE_REQUEST)
    const [updateProfile] = useMutation(UPDATE_PROFILE)

    const handleConfirmReq = async (targetId : any) => {
      const inputFriend = {
        userID : data.getUserWToken.id,
        friendID : targetId
      }

      await createFriend({
        variables :{
          inputFriend : inputFriend,
        }
      }).then(async (response)=>{
          console.log(response)
          await refetchSuggestions()
      })
    }

    const handleDeleteReq = async (requestId : any) => {
      await deleteRequest({
        variables : {
          reqID : requestId 
        }
      }).then(async (response) => {
        console.log(response)
        await refetchSuggestions()
      })
    }

    const [openEditDialog, setOpenEditDialog] = useState(false);

    const handleOpenEditDialog = () => {
      setOpenEditDialog(true);
    };
    
    const handleCloseEditDialog = () => {
      setOpenEditDialog(false);
    };

    const handleUpdateProfile = async (file: any) => {
      setLoading(true)

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ete7d3zg');
    
      let apiUrl = 'https://api.cloudinary.com/v1_1/diuzx0kak/image/upload'
      let mediaUrl
    
      try {
        const response = await Axios.post(apiUrl, formData);
        const secureUrl = response.data.secure_url;
        mediaUrl = secureUrl
      } catch (error) {
        console.error('Error uploading file:', error);
      }

      updateProfile({
        variables : {
          id : data?.getUserWToken?.id,
          profile : mediaUrl
        }
      }).then(async () => {
        await refetchUser()
        await handleCloseEditDialog()
        setLoading(false)
      })

    };

    const [createRequest] = useMutation(CREATE_REQUESTS)
    const [deleteRequestTarget] = useMutation(DELETE_REQUEST_TARGET)
    const [deleteRequestRequester] = useMutation(DELETE_REQUEST_REQUESTER)

    const handleAddFriend = async(target : any) => {
      const inputRequest = {
          requesterID : data.getUserWToken.id,
          targetID : target
      }
      
      await createRequest({
          variables : {
              inputRequest : inputRequest
          }
      }).then(async (response) => {
          await refetchUser()
      }).catch((error) => {
          console.log(error)
      })
    }

    const handleDeleteReqTarget = async (id : any) => {
      console.log(id)
      await deleteRequestTarget({
        variables : {
          reqID : id 
        }
      }).then(async (response) => {
        console.log(response)
        await refetchUser()
      })
    }

    const handleDeleteRequester = async (id : any) => {
      console.log(id)
      await deleteRequestRequester({
        variables : {
          reqID : id 
        }
      }).then(async (response) => {
        console.log(response)
        await refetchUser()
      })
    }
    

  return (
    data && user &&  (
    <div className='profilecontent-container'>
        <div style={{width : "100%", height:"10em" , backgroundColor:"rgba(106, 54, 160, 0.5)"}}/>

        <div style={{width:"100%", display: "flex", maxHeight:"30vh" , justifyContent:"space-between"}}>
            {user?.getUser && (<div style={{display:"flex", gap:"1em", width:"50%"}}>
                <img src={user?.getUser?.profile} style={{float:"left", position:"relative", top:"-3em", border: "3px var(--nav-color) solid", borderRadius:"50%", objectFit:"cover", width:"15em", height:"15em", backgroundColor:"var(--nav-color)"}} alt="" />
                
                <div>
                <h1>{user?.getUser?.firstname + " " + user?.getUser?.surname}</h1>
                <h3>{user?.getUser?.gender.charAt(0).toUpperCase() + user?.getUser?.gender.slice(1)}</h3>
                <h3>{new Date(user?.getUser?.dob).toLocaleDateString("en-US",  { day: "2-digit", month: "long", year: "numeric" })}</h3>
                <h3>{user?.getUser?.email}</h3>
                <h3>{friends?.getAllFriendWMutuals?.length + " Friends"}</h3>
                </div>
            </div>)}

            {user?.getUserWRequest && (<div style={{display:"flex", gap:"1em", width:"50%"}}>
                <img src={user?.getUserWRequest?.user?.profile} style={{float:"left", position:"relative", top:"-3em", border: "3px var(--nav-color) solid", borderRadius:"50%", objectFit:"cover", width:"15em", height:"15em",backgroundColor:"var(--nav-color)"}} alt="" />
                
                <div>
                <h1>{user?.getUserWRequest?.user?.firstname + " " + user?.getUserWRequest?.user?.surname}</h1>
                <h3>{user?.getUserWRequest?.user?.gender.charAt(0).toUpperCase() + user?.getUserWRequest?.user?.gender.slice(1)}</h3>
                <h3>{new Date(user?.getUserWRequest?.user?.dob).toLocaleDateString("en-US",  { day: "2-digit", month: "long", year: "numeric" })}</h3>
                <h3>{user?.getUserWRequest?.user?.email}</h3>
                <h3>{friends?.getAllFriendWMutuals?.length + " Friends"}</h3>
                </div>
            </div>)}

            <div style={{display:"flex", gap:"1em", marginTop:"2em"}}>
                {data?.getUserWToken?.id === sensitiveUserId ? ( <><div className='pcontent-action' onClick={() => {navigate('/createstory')}}>
                    <AiFillPlusCircle />
                    <p>Add Story</p>
                </div>

                <div className='pcontent-action' onClick={handleOpenEditDialog}>
                    <AiFillEdit />
                    <p>Edit Profile</p>
                </div>
                </>) : (
                      <>
                      {!user?.getUserWRequest?.hasFriendRequest && !user?.getUserWRequest?.hasSentRequest && !user?.getUserWRequest?.isFriend && (
                        <div className='pcontent-action' onClick={() => handleAddFriend(sensitiveUserId)}>
                          <AiFillPlusCircle />
                        <p>Add Friend</p>
                        </div>
                      )}

                  {user?.getUserWRequest?.hasFriendRequest && (
                    <div className='pcontent-action' onClick={() => handleDeleteReqTarget(sensitiveUserId)}>
                    <AiFillCloseCircle />
                      <p>Cancel Request</p>
                    </div>
                  )}
                  {user?.getUserWRequest?.hasSentRequest && (
                    <>
                    <div className='pcontent-action' onClick={() => {handleConfirmReq(sensitiveUserId)}}>
                    <AiFillCheckCircle />
                      <p>Accept Request</p>
                  </div>
                    <div className='pcontent-action' onClick={() => {handleDeleteRequester(sensitiveUserId)}}>
                        <AiOutlineDelete />
                        <p>Delete Request</p>
                    </div>
                    </>
                  )}
                    <div className='pcontent-action' onClick={() => {navigate('/chat')}}>
                        <AiFillMessage />
                        <p>Send Message</p>
                    </div>
                    </>
                )}
            </div>

        </div>


        <div className='people-may-know'>
            <h3>
                People You May Know
            </h3>
            <div className='pmk-con'>
              {suggestions?.getFriendSuggestions?.length < 1 && (
              <h3>No Suggestions</h3>
              )}
              {suggestions?.getFriendSuggestions?.map((people : any, index:number) => (
                index < 5 && (<>
                  <div className='pmk-item'>
                      <img src={people.user.profile} style={{maxWidth:"20vw",minHeight:"35vh" ,maxHeight:"35vh", borderRadius:"50%", objectFit:"cover"}} alt="" />
                      <div className='pmk-details'>
                        <p style={{paddingTop:"0.3em"}}>{people.user.firstname + " " + people.user.surname}</p>
                        <p style={{paddingTop:"0.3em"}}>{people.mutuals.length + " Mutuals"}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1em", padding:"0.3em" }}>
                        <div className='confirm-button' onClick={() => {handleConfirmReq(people.user.id)}}>
                          {people.hasFriendRequest && (
                            <p>Accept Request</p>
                          )}
                          {people.hasSentRequest && (
                            <p>Cancel Request</p>
                          )}
                          {!people.hasFriendRequest && !people.hasSentRequest && (<p>Add Friend</p>)}
                        </div>
                        <div className='delete-button' onClick={() => {handleDeleteReq(people.user.id)}}>
                          <p>Delete</p>
                        </div>
                      </div>
                  </div>
                  </>
                )
              ))}
            </div>
        </div>

        <div className='profile-nav'>
          <div
            onClick={() => {
              setSelectedNav("Post");
            }}
            className={selectedNav === "Post" ? "selected" : ""}
            style={{fontSize:"16px", padding:"1em" , borderRadius:"10px", cursor:"pointer"}}
          >
            Post
          </div>
          <div
            onClick={() => {
              setSelectedNav("Friend");
            }}
            className={selectedNav === "Friend" ? "selected" : ""}
            style={{fontSize:"16px", padding:"1em" , borderRadius:"10px", cursor:"pointer"}}
          >
            Friend
          </div>
          <div
            onClick={() => {
              setSelectedNav("Reels");
            }}
            className={selectedNav === "Reels" ? "selected" : ""}
            style={{fontSize:"16px", padding:"1em" , borderRadius:"10px", cursor:"pointer"}}
          >
            Reels
          </div>
        </div>

        <div className='profilecontent-content'>
            <div className='pcontent-right'>
                {selectedNav === 'Reels' && (<>
                  {reels?.getAllReelsUser?.length < 1 ? (
                    <div className='friend-con'>
                      <h3>No Reels</h3>

                    </div>
                  ) : (
                    <div className='preel-container'>
                    {reels?.getAllReelsUser?.map((reel : any) => (
                        <video className='profile-reel' src={reel.reels.video} onClick={() => {navigate('/reel')}}></video>
                    ))}
                  </div>
                  )}

                  </>
                )}
                {selectedNav === 'Friend' && (
                  <div className='friend-con'>
                  {friends?.getAllFriendWMutuals?.length < 1 && (
                  <h3>No Friends</h3>
                  )}
                  {friends?.getAllFriendWMutuals?.map((people : any, index:number) => (
                    <>
                      <div className='friend-item'>
                          <img src={people.friend.profile} style={{maxWidth:"20vw",minHeight:"35vh" ,maxHeight:"35vh", borderRadius:"50%", objectFit:"cover"}} alt="" />
                          <div className='friend-details'>
                            <p style={{paddingTop:"0.3em"}}>{people.friend.firstname + " " + people.friend.surname}</p>
                            <p style={{paddingTop:"0.3em"}}>{people.mutuals.length + " Mutuals"}</p>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1em", padding:"0.3em" }}>
                            <div className='confirm-button' onClick={() => {}}>
                              <p>Send Message</p>
                            </div>
                          </div>
                      </div>
                      </>
                    
                  ))}
                </div>
                )}
                { selectedNav === 'Post' && (
                <>
                <div className='mid-content'>
                <img
                    src='defaultprofile.png'
                    alt='Profile'
                    className='profile-image'
                />
                <input type="text" className='homecontent-mid-text'placeholder={placeholder} onClick={() => setOpenDet(true)}/>
                </div>

                {forums && forums.getAllPostUser.map((forum : any, index : number) => (
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
                        < AiOutlineDelete style={{fontSize:"20px"}}/>
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
                </>)}
            </div>
        </div>
        <PostDialog onClose={handleCloseDet} open={openDet} disableBackdropClick={false} profile={data.getUserWToken.profile} name={data.getUserWToken.firstname + " " + data.getUserWToken.surname} userId={data.getUserWToken.id} refetch={refetch} />
        <CommentDialog onClose={handleCloseComment} open={openComment} disableBackdropClick={false} forum={selectedForum} userId={data.getUserWToken.id} refetchForum={refetchForum}/>
        {openEditDialog && (
          <EditProfileDialog onClose={handleCloseEditDialog} onUpdateProfile={handleUpdateProfile} picture={user?.getUser?.profile}/>
        )}
        <LoadingIndicator loading={loading} />
    </div>
    )
  )
}

export default Profile
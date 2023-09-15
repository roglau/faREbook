import React, {useEffect, useState} from 'react'
import '../index.css'
import { AiFillLike, AiFillSetting, AiOutlineDelete } from 'react-icons/ai'
import { getUser } from '../provider/UserProvider'
import LoadingIndicator from '../components/LoadingIndicator'
import { FaCommentDots, FaUserFriends } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { ACCEPT_INVITE, CREATE_FRIEND, CREATE_JOIN, CREATE_LIKE, CREATE_NOTIF, CREATE_REQUESTS, DELETE_INVITE, DELETE_JOIN, DELETE_POST, DELETE_REQUEST, DELETE_REQUEST_REQUESTER, DELETE_REQUEST_TARGET, GET_ALL_GROUP, GET_ALL_POST_CONTENT, GET_ALL_USERNAME } from '../query/query'
import { formatDistanceToNow } from 'date-fns'
import MediaCarousel from '../components/Carousel'
import { BiSolidComment, BiSolidShare } from 'react-icons/bi'
import CommentDialog from '../components/CommentDialog'

const Search = () => {
    const data = getUser()
    const {search} = useParams();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const [createPostLike] = useMutation(CREATE_LIKE)
    const [deletePost] = useMutation(DELETE_POST)

    const[selectedNav, setSelectedNav] = useState<any>("people")

    const {data: users, refetch:refetchUsers} = useQuery(GET_ALL_USERNAME,{
        variables : {
            name : search,
            userID : data?.getUserWToken?.id
        }
    })
    
    const {data: posts, refetch:refetchPosts} = useQuery(GET_ALL_POST_CONTENT,{
        variables : {
            content : search
        }
    })

    const {data : groups, refetch:refetchGroups} = useQuery(GET_ALL_GROUP, {
      variables : {
        userID : data?.getUserWToken?.id
      }
    })

    console.log(groups)

    const [createRequest] = useMutation(CREATE_REQUESTS)
    const [deleteRequestTarget] = useMutation(DELETE_REQUEST_TARGET)
    const [deleteRequestRequester] = useMutation(DELETE_REQUEST_REQUESTER)
    const [createNotif] = useMutation(CREATE_NOTIF)

    const [openComment, setOpenComment] = useState(false);
    const [selectedForum, setSelectedForum] = useState<any>()

    useEffect(() => {
        // console.log(users, posts)
    }, [users, posts])

    const [filteredGroups, setFilteredGroups] = useState<any>()
    console.log(filteredGroups)

    useEffect(() => {
      if(groups && search){
        const filteredGroups = groups?.getAllGroup.filter((group : any) =>
          group.group.name.toLowerCase().includes(search?.toLowerCase())
        );
        setFilteredGroups(filteredGroups)
      }
    }, [groups, search])

    useEffect(() => {
        const refetch= async() => {
            setLoading(true)
            await refetchPosts().then(async (response) => {
                // console.log(response)
                await refetchUsers().then((r) => {
                    // console.log(r)
                }).then(async(res) => {
                  // console.log(res)
                  await refetchGroups().then(async (r) => {
                    // console.log(r)
                    setLoading(false)
                  })
                })
            })
        }

        if(search && data){
            refetch()
            
        }
    },[search, data])



    const handleDeletePost = async(forum : any) => {
        deletePost({
          variables : {
            postID : forum.posts.id
          }
        }).then(async (response) => {
          console.log(response)
        //   await setCurrForums((prevCurrForums : any) => prevCurrForums.filter((post : any) => post.posts.id !== forum.posts.id));
          await refetchPosts()
        })
      }

      const handleComment = async (forum : any) => {
        await setSelectedForum(forum)
  
        setOpenComment(true)
    }

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
          await refetchPosts()
          // setLoading(false)
        }).catch((error) => {
          // setErrorMessage(error.message)
          // setErrorOpen(true)
        })
        console.log(post)
      }

      const handleCloseComment = async() => {
        await refetchPosts()
        setSelectedForum(undefined)
        setOpenComment(false) 
      }

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
            await refetchUsers()
        }).catch((error) => {
            console.log(error)
        })

        await createNotif({
          variables : {
            inputNotif : {
              userID: target,
              notif: data.getUserWToken.firstname+ " " +data.getUserWToken.surname +" has sent you a friend request",
              user2ID: data.getUserWToken.id,
            }
          }
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
          await refetchUsers()
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
          await refetchUsers()
        })
      }

      const [createFriend] = useMutation(CREATE_FRIEND)

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
            await refetchUsers()
        })

        await createNotif({
          variables : {
            inputNotif : {
              userID: targetId,
              notif: "Your friend request has been accepted",
              user2ID: data.getUserWToken.id,
            }
          }
        })
      }

    const [acceptInvite] = useMutation(ACCEPT_INVITE)
    const [deleteInvite] = useMutation(DELETE_INVITE)
    const [deleteJoin] = useMutation(DELETE_JOIN)
    const [createJoin] = useMutation(CREATE_JOIN)

    const handleAccept = async(groupID: any) => {
        await acceptInvite({
            variables:{
                groupID : groupID,
                invited: data?.getUserWToken?.id
            }
        }).then(async () => {
            await refetchGroups()
        })
    }

    const handleDecline = async (groupID: any) => {
        console.log(groupID)
        await deleteInvite({
            variables:{
                groupID : groupID,
                invited: data?.getUserWToken?.id
            }
        }).then(async (r) => {
            console.log(r)
            await refetchGroups()
        })
    }

    const handleJoin = async (groupID: any) => {
      await createJoin({
        variables : {
          groupID : groupID,
          userID: data?.getUserWToken?.id
        }
      }).then(async () => {
        await refetchGroups()
      })
    }

    const handleCancelJoin = async (groupID: any) => {
        await deleteJoin({
          variables : {
            groupID : groupID,
            userID : data?.getUserWToken?.id
          }
        }).then(async () => {
          await refetchGroups()
        })
    }
  return (
    <div className='searchcontent-container'>
        <div className='sidebar'>
        <div className='friendsidebar-content'>
            <div style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"1.5em"}}>
                <h1>Search Results</h1>
                <AiFillSetting className="nav-icon"/>
            </div>
            
            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em", cursor:"pointer"}} onClick={() => setSelectedNav("people")}>
            <FaUserFriends className={selectedNav === "people" ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>People</h3>
            </div>

            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em", cursor:"pointer"}} onClick={() => setSelectedNav("post")}>
            <FaCommentDots className={selectedNav === 'post' ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>Post</h3>
            </div>

            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em", cursor:"pointer"}} onClick={() => setSelectedNav("group")}>
            <FaUserFriends className={selectedNav === 'group' ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>Group</h3>
            </div>
            
        </div>
      </div>
      <div className='search-container'>
      {selectedNav === "people" && users?.getAllUserName?.map((user: any) => (
        user?.user?.id !== data?.getUserWToken?.id && (
            <div className='searchres-container' onClick={ () => { navigate('/profile', { state: { userId: user.user.id } })}}>
                <div style={{width:"100%", display:"flex",justifyContent:"space-around"}}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1em", float: "left", width: "100%" }}>
                        <img src={user.user.profile === './defaultprofile.png' ? "../defaultprofile.png" : user.user.profile} alt="" style={{ width: "40px", height: "40px" }} />
                        <div>
                            <p>{user?.user?.firstname + " " + user?.user?.surname}</p>
                            <p>{user?.user?.gender.charAt(0).toUpperCase() + user?.user?.gender.slice(1)}</p>
                        </div>
                    </div>
                    {!user.hasFriendRequest && !user.hasSentRequest && !user.isFriend && (<div style={{width:"20%", display:"flex", justifyContent:"center", alignItems:"center", backgroundColor:"var(--text-bg-color)",cursor:"pointer", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                      e.stopPropagation();
                      handleAddFriend(user.user.id)}}>
                        Add Friend
                    </div>)}
                    {user.isFriend && (<div style={{width:"20%", display:"flex", justifyContent:"center", alignItems:"center", backgroundColor:"var(--text-bg-color)",cursor:"pointer", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                      e.stopPropagation();
                      navigate('/chat')}}>
                        Send Message
                    </div>)}
                    {user.hasFriendRequest && (<div style={{width:"20%", display:"flex", justifyContent:"center", alignItems:"center", backgroundColor:"var(--text-bg-color)",cursor:"pointer", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReqTarget(user.user.id)}}>
                        Cancel Request
                    </div>)}
                    {user.hasSentRequest && (<div style={{width:"40%", display:"flex", justifyContent:"center", gap:"1em", alignItems:"center"}}>
                        <p style={{backgroundColor:"var(--text-bg-color)", padding:"0.7em", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmReq(user.user.id)}}>Accept Request</p>
                        <p style={{backgroundColor:"var(--text-bg-color)", padding:"0.7em", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequester(user.user.id)}}>Delete Request</p>
                    </div>)}
                </div>
            </div>
            )
        ))}

        {selectedNav === "people" && users?.getAllUserName?.length < 1 && (
            <div style={{height:"100%", display:"flex", alignItems:"center"}}>
                Not Found
            </div>
        )}

      {selectedNav === "group" && filteredGroups?.map((group: any) => (
            <div className='searchres-container' onClick={ () => { navigate('/groupprofile', { state: { groupID: group.group.id } })}}>
                <div style={{width:"100%", display:"flex",justifyContent:"space-around"}}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1em", float: "left", width: "100%" }}>
                        <img src={group.group.profile} alt="" style={{ width: "40px", height: "40px" }} />
                        <p>{group?.group?.name}</p>
                    </div>
                    {group.hasInvited && (
                      <div style={{width:"40%", display:"flex", justifyContent:"center", gap:"1em", alignItems:"center"}}>
                      <p style={{backgroundColor:"var(--text-bg-color)", padding:"0.7em", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(group.group.id)}}>Accept Invite</p>
                      <p style={{backgroundColor:"var(--text-bg-color)", padding:"0.7em", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                        e.stopPropagation();
                        handleDecline(group.group.id)}}>Decline Invite</p>
                  </div>
                    )}
                    {group.hasJoinRequest && (
                      <div style={{width:"40%", display:"flex", justifyContent:"center", gap:"1em", alignItems:"center"}}>
                      <p style={{backgroundColor:"var(--text-bg-color)", padding:"0.7em", borderRadius:"10px", textAlign:"center"}} onClick={(e) => {
                        e.stopPropagation();
                        handleCancelJoin(group.group.id)}}>Cancel Join</p>
                      </div>
                    )}
                    {!group.hasJoinRequest && !group.hasInvited && !group.isMember && !group.isAdmin && (
                      <div style={{width:"40%", display:"flex", justifyContent:"center", gap:"1em", alignItems:"center"}}>
                      <p style={{backgroundColor:"var(--text-bg-color)", padding:"0.7em", borderRadius:"10px", textAlign:"center"}} onClick={(e) =>{
                        e.stopPropagation();
                        handleJoin(group.group.id)}}>Join Group</p>
                      </div>
                    )}
                </div>
            </div>
        ))}

        {selectedNav === "group" && groups?.getAllGroup?.length < 1 && (
            <div style={{height:"100%", display:"flex", alignItems:"center"}}>
                Not Found
            </div>
        )}

        {selectedNav === "post" && posts?.getAllPostContent?.map((forum: any) => (
            <div className='searchres-container'>
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

        {selectedNav === "post" && posts?.getAllPostContent?.length < 1 && (
            <div style={{height:"100%", display:"flex", alignItems:"center"}}>
                Not Found
            </div>
        )}

      </div>
      <CommentDialog onClose={handleCloseComment} open={openComment} disableBackdropClick={false} forum={selectedForum} userId={data?.getUserWToken?.id} refetchForum={refetchPosts}/>
      <LoadingIndicator loading={loading} />
    </div>
  )
}

export default Search
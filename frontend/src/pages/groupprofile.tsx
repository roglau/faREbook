import React, {useState, useEffect} from 'react'
import '../index.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { getUser } from '../provider/UserProvider';
import LoadingIndicator from '../components/LoadingIndicator';
import { AiFillCheckCircle, AiFillDelete, AiFillLike, AiFillPlusCircle, AiFillSetting, AiOutlineDelete } from 'react-icons/ai';
import 'react-quill/dist/quill.snow.css';
import { useMutation, useQuery } from '@apollo/client';
import { ACCEPT_INVITE, ACCEPT_JOIN, CREATE_JOIN, CREATE_LIKE, CREATE_NOTIF, DELETE_FILE, DELETE_GROUP_POST, DELETE_INVITE, DELETE_JOIN, DELETE_MEMBER, DELETE_MEMBER_N_GROUP, GET_GROUP, PROMOTE_MEMBER, UPDATE_GROUP_PROFILE } from '../query/query';
import Axios from 'axios';
import ChatDialog from '../components/ChatDialog';
import CustomSnackbar from '../components/CustomSnackbar';
import SearchBar from '../components/Searchbar';
import { MdDownloadForOffline, MdFeed, MdGroups } from 'react-icons/md';
import { BiSolidComment, BiSolidShare, BiSortDown } from 'react-icons/bi';
import MediaCarousel from '../components/Carousel';
import { formatDistanceToNow } from 'date-fns';
import GroupPostDialog from '../components/GroupPostDialog';
import GroupCommentDialog from '../components/GroupCommentDialog';
import SingleFileDialog from '../components/SingleFileDialog';
import { BsSortUp } from 'react-icons/bs';
import {IoPush} from 'react-icons/io5';
import EditProfileDialog from '../components/EditProfileDialog';

const GroupProfile = () => {
    const location = useLocation();
    const groupID = location.state?.groupID;
    const data = getUser()
    // console.log(groupID, data?.getUserWToken?.id);
    const navigate = useNavigate()
    
    const [loading, setLoading] = useState(false)
    const [sortByDateAsc, setSortByDateAsc] = useState(true);

    useEffect(() => {
        if(data ){
            setLoading(false)
        }else{
            setLoading(true)
        }
    },[data])

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const {data : group, refetch:refetchGroup} = useQuery(GET_GROUP, {
      variables : {
        groupID : groupID,
        userID: data?.getUserWToken?.id
      }
    })

    console.log(group?.getGroup)

    const [selectedForum, setSelectedForum] = useState<any>()
    const [selectedNav, setSelectedNav] = useState<any>("Post")

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
        // await refetch()
        // setSelectedForum(undefined)
        setOpenComment(false) 
        
      }
      const [createPostLike] = useMutation(CREATE_LIKE)
      const [deletePost] = useMutation(DELETE_GROUP_POST)
      const [deleteFile] = useMutation(DELETE_FILE)
      const [acceptJoin] = useMutation(ACCEPT_JOIN)
      const [promoteMember] = useMutation(PROMOTE_MEMBER)
      const [deleteMember] = useMutation(DELETE_MEMBER)
      const [createNotif] = useMutation(CREATE_NOTIF)
      const [deleteMemberNGroup] = useMutation(DELETE_MEMBER_N_GROUP)
      const [updateGroupProfile] = useMutation(UPDATE_GROUP_PROFILE)
    
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
          await refetchGroup()
        }).catch(() => {
          // setErrorMessage(error.message)
          // setErrorOpen(true)
        })
        console.log(post)
      }
      
      const handleDeletePost = async(forum : any) => {
        console.log(forum)
        deletePost({
          variables : {
            groupID : forum.posts.id
          }
        }).then(async (response) => {
          console.log(response)
          await refetchGroup()
        })
      }

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false); // State to manage the dialog's open/close status

    // Function to open the invite dialog
    const openInviteDialog = () => {
        setInviteDialogOpen(true);
    };

    // Function to close the invite dialog
    const closeInviteDialog = () => {
        setInviteDialogOpen(false);
    };

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
            await refetchGroup()
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
            await refetchGroup()
        })
    }

    const handleJoin = async (groupID: any) => {
      await createJoin({
        variables : {
          groupID : groupID,
          userID: data?.getUserWToken?.id
        }
      }).then(async () => {
        await refetchGroup()
      })
    }

    const handleCancelJoin = async (groupID: any) => {
        await deleteJoin({
          variables : {
            groupID : groupID,
            userID : data?.getUserWToken?.id
          }
        }).then(async () => {
          await refetchGroup()
        })
    }

    const [searched, setSearched] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearched(e.target.value);
    };
  
    const cancelSearch = async () => {
      setSearched('');
      setSearching(false)
      setSortedFiles(files)
      setResolvedFileNames(names)
      await refetchGroup()
    };
    const [files, setFiles] = useState<any>()
    const [names, setNames] = useState<any>()
    const [searching, setSearching] = useState<any>(false)

    const onEnterPress = async (e : any) => {
      if(!searching){
        await setFiles(sortedFiles)
        await setNames(resolvedFileNames)
      }
      setSearching(true)
      
      if(e.target.value.length > 0){
        const searchValue = e.target.value.toLowerCase();
        

        if (searchValue.length > 0) {
          const filteredFiles = files.filter((file: any) =>
            file.files.name.toLowerCase().includes(searchValue)
          );

          // Set the filtered files to a state variable or use it as needed
          setSortedFiles(filteredFiles);
        }
      }else{
        setSearching(false)
        setSortedFiles(files)
        setResolvedFileNames(names)
      }
        
    }

    const [openCreateConv,setOpenCreateConv] = useState(false)
    const handleCloseCreateConv = () => {
      setOpenCreateConv(false);
  };

  const[sortedFiles, setSortedFiles] = useState<any>()

  function resolveDuplicateNames(fileNames : any) {
    const resolvedNames : any = [];
  
    fileNames.forEach((fileName: any) => {
      let displayName = fileName;
      let counter = 1;
  
      while (resolvedNames.includes(displayName)) {
        displayName = `${fileName.replace(/\.[^/.]+$/, '')} (${counter})${fileName.match(/\.[^/.]+$/)}`;
        counter++;
      }
  
      resolvedNames.push(displayName);
    });
  
    return resolvedNames;
  }

  

  useEffect(() => {
    if(group){
      const sortedFiles = [...(group?.getGroup?.files || [])].sort((a: any, b: any) => {
        const dateA = new Date(a.files.createdAt).getTime();
        const dateB = new Date(b.files.createdAt).getTime();
      
        if (sortByDateAsc) {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
  
      setSortedFiles(sortedFiles)
    }
  },[sortByDateAsc, group])

  const[resolvedFileNames, setResolvedFileNames] = useState<any>()
  useEffect(() => {
    if(sortedFiles){
      const originalFileNames = sortedFiles.map((file : any) => file.files.name);

      const resolvedFileNames = resolveDuplicateNames(originalFileNames);
      setResolvedFileNames(resolvedFileNames)
    }
  }, [sortedFiles])


  const handleDownload = async (fileUrl: any, fileName: any) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileName; 
      anchor.style.display = 'none';

      document.body.appendChild(anchor);
      anchor.click();

      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };


  const handleDeleteFile = async(fileID: any) => {
    await deleteFile({
      variables : {
        fileID: fileID
      }
    }).then(async (r) => {
      console.log(r)
      await refetchGroup()
    })
  }

  const handlePromote = async (groupID: any, userID: any) => {
    await promoteMember({
      variables : {
        groupID: groupID,
        userID: userID
      }
    }).then(async () => {
      await refetchGroup()
    })
  }

  const handleDeleteJoin = async (groupName : any, groupID: any, userID: any) => {
    await deleteJoin({
      variables : {
        groupID : groupID,
        userID : userID
      }
    }).then(async () => {
      await refetchGroup()
    })

    await createNotif({
      variables : {
        inputNotif : {
          userID: userID,
          notif: "Your join request to " + groupName + " has been rejected",
          user2ID: data.getUserWToken.id,
        }
      }
    })
  }

  const handleDeleteMember = async (groupID: any, userID: any) => {
    await deleteMember({
      variables : {
        groupID : groupID,
        userID: userID
      }
    }).then(async () => {
      await refetchGroup()
    })
  }
  const handleDeleteGroupNMember = async (groupID: any, userID: any) => {
    await deleteMemberNGroup({
      variables : {
        groupID : groupID,
        userID: userID
      }
    }).then(async () => {
      await refetchGroup()
      navigate('/group')
    })
  }

  const handleAcceptJoin = async (groupName : any, groupID: any, userID: any) => {
    await acceptJoin({
      variables : {
        groupID : groupID,
        userID : userID
      }
    }).then(async () => {
      await refetchGroup()
    })

    await createNotif({
      variables : {
        inputNotif : {
          userID: userID,
          notif: "Your join request to " + groupName + " has been accepted",
          user2ID: data.getUserWToken.id,
        }
      }
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
      console.log(file)
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

      await updateGroupProfile({
        variables : {
          groupID: group?.getGroup?.group?.id,
          profile : mediaUrl
        }
      }).then(async () => {
        await refetchGroup()
        await handleCloseEditDialog()
        setLoading(false)
      })

    };


    return (
      data && (
      <div> 
        <div className='sidebar'>
          <div className='sidebar-content' style={{position:"relative"}}>
              <div style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"1.5em"}}>
                  <h1>Group</h1>
                  <AiFillSetting className="nav-icon"/>
              </div>
          </div>
  
        </div>
        <div className='group-container'>
        
        <div className='group-con'>
                <img src={group?.getGroup?.group?.profile} className='profileimg' alt="" />
                <div style={{width:'100%',display:"flex", justifyContent:"space-between"}}>
                    <h3 className='group-name'>{group?.getGroup?.group?.name}</h3>
                    {group?.getGroup?.isAdmin || group?.getGroup?.isMember ? (
                      <div style={{display:"flex", gap:"0.5em"}}>
                        {group?.getGroup?.isAdmin  && (<div className='confirm-button' style={{ width: "auto" }} onClick={handleOpenEditDialog}>
                          Edit Banner
                        </div>)}
                        <div className='confirm-button' style={{ width: "auto" }} onClick={openInviteDialog}>
                          Invite
                        </div>
                        {(group?.getGroup?.isMember || (group?.getGroup?.isAdmin && group?.getGroup?.admin.length > 1 && group?.getGroup?.members.length > 1) || ((group?.getGroup?.isAdmin && group?.getGroup?.admin.length > 1 && group?.getGroup?.members.length < 1)) ) && (
                        <div className='delete-button' style={{ width: "auto" }} onClick={() => {handleDeleteMember(group?.getGroup?.group?.id, data?.getUserWToken?.id)}}>
                          Leave Group
                        </div>)}

                        {(group?.getGroup?.isAdmin && group?.getGroup?.admin.length == 1 && group?.getGroup?.members.length < 1) && (
                        <div className='delete-button' style={{ width: "auto" }} onClick={() => {handleDeleteGroupNMember(group?.getGroup?.group?.id, data?.getUserWToken?.id)}}>
                          Leave Group
                        </div>)}
                        </div>
                      ) : (
                        <>
                          {group?.getGroup?.hasJoinRequest && (
                            <div className='confirm-button' style={{ width: "auto" }} onClick={() => {handleCancelJoin(group?.getGroup?.group?.id)}}>
                              Cancel Join
                            </div>
                          )}
                          {group?.getGroup?.hasInvited && (
                            <div style={{display:"flex", gap:"1em"}}>
                            <div className='confirm-button' style={{ width: "auto" }} onClick={() => {handleAccept(group?.getGroup?.group?.id)}}>
                              Accept Invite
                            </div>
                            <div className='confirm-button' style={{ width: "auto" }} onClick={() => {handleDecline(group?.getGroup?.group?.id)}}>
                            Decline Invite
                            </div>
                            </div>
                          )}
                          {!group?.getGroup?.hasJoinRequest && !group?.getGroup?.hasInvited && !group?.getGroup?.isMember && !group?.getGroup?.isAdmin && (
                            <div className='confirm-button' style={{ width: "auto" }} onClick={() => {handleJoin(group?.getGroup?.group?.id)}}>
                              Join Group
                            </div>
                          )}
                        </>
                      )
                    }

                    
                </div>
                <div className='separate-line'></div>
                <div className='group-preview-nav'>
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
                        setSelectedNav("Member");
                      }}
                      className={selectedNav === "Member" ? "selected" : ""}
                      style={{fontSize:"16px", padding:"1em" , borderRadius:"10px", cursor:"pointer"}}
                    >
                      Member
                    </div>
                    <div
                      onClick={() => {
                        setSelectedNav("Join Request");
                      }}
                      className={selectedNav === "Join Request" ? "selected" : ""}
                      style={{fontSize:"16px", padding:"1em" , borderRadius:"10px", cursor:"pointer"}}
                    >
                      Join Request
                    </div>
                    <div
                      onClick={() => {
                        setSelectedNav("Files");
                      }}
                      className={selectedNav === "Files" ? "selected" : ""}
                      style={{fontSize:"16px", padding:"1em" , borderRadius:"10px", cursor:"pointer"}}
                    >
                      Files
                    </div>
                </div>
                
          </div>
          <div className='group-content'>
              {selectedNav === "Post" && (
              <>
              <div className='mid-content'>
                <img
                    src='defaultprofile.png'
                    alt='Profile'
                    className='profile-image'
                />
                <input type="text" className='homecontent-mid-text'placeholder={"What's on your mind?"} onClick={() => setOpenDet(true)}/>
              </div>
              {group?.getGroup?.posts?.map((forum : any, index : number) => (
                <div className='mid-forum'>
                <div style={{width:"100%", display: "flex", alignItems:"center"}}>
                    <div className='forum-profile-con'>
                    <img src={forum.posts.user.profile} alt="" className='profile-icon' />
                    <div>
                        <p>{forum.posts.user.firstname + " "+ forum.posts.user.surname}</p>
                        <h5>{formatDistanceToNow(new Date(forum.posts.createdAt))} ago</h5>
                    </div>

                    </div>
                    {(forum.posts.userID === data.getUserWToken.id || group.getGroup.isAdmin) && (<div onClick={() => handleDeletePost(forum)}>
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
                </>
              )}

              {selectedNav === "Files" && (
              <>
              <div className='group-mid-content'>
                <div className='group-file-container'>
                  <h2>Files</h2>
                  <div style={{display:"flex", gap:"1em", width:"50%"}}>
                    <div style={{width:"65%"}}>
                      <SearchBar
                        value={searched}
                        onChange={handleSearch}
                        onCancelSearch={cancelSearch}
                        placeholder='Search'
                        onEnterPress={(e : any) => onEnterPress(e)}
                      />

                    </div>
                    <div style={{width:"30%"}} className='confirm-button' onClick={() => {setOpenCreateConv(true)}}>
                      Upload File
                    </div>
                  </div>
                </div>
                <div className='separate-line'></div>
                {sortedFiles?.length < 1 ? (
                  <div className="file-title-con">
                      No Files
                  </div>
                ) : (
                  <div className='file-title-con'>
                  <h3 className='file-title' style={{width:"50%"}}>File Name</h3>
                  <h3 className='file-title' style={{width:"10%"}}>Type</h3>
                  <h3 className='file-title' style={{width:"20%", display:"flex", gap:"1em", alignItems:"center", justifyContent:"center", cursor:"pointer"}} onClick={() => setSortByDateAsc(!sortByDateAsc)}>Uploaded Date 
                  {sortByDateAsc ? <BsSortUp /> : <BiSortDown />}
                  </h3>
                  <h3 className='file-title' style={{width:"10%"}}>Action</h3>
                </div>
                )}
                {resolvedFileNames && sortedFiles?.map((file : any, index:number) => (
                <div className='file-title-con'>
                  <p className='file-content' style={{width:"50%"}}>{resolvedFileNames[index]}</p>
                  <p className='file-content' style={{width:"10%"}}>{file.files.type}</p>
                  <p className='file-content' style={{width:"20%"}}>{new Date(file.files.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }) + " by "+ file.uploader.firstname + " " + file.uploader.surname}</p>
                  <p className='file-content' style={{width:"10%",display:"flex", gap:"1em", alignItems:"center", justifyContent:"center"}}><MdDownloadForOffline style={{width:"28px", height:"28px", cursor:"pointer"}} onClick={() => {handleDownload(file.files.url, file.files.name)}}/>
                    {(file.files.userID === data.getUserWToken.id || group.getGroup.isAdmin) && (<AiFillDelete style={{width:"28px", height:"28px", cursor:"pointer"}} onClick={() => {handleDeleteFile(file.files.id)}} />)}
                  </p>
                </div>
                ))}
              </div>
                </>
              )}

              {selectedNav === "Member" && (
              <>
              <div className='group-mid-content'>
                <div className='group-file-container'>
                  <h2>Members | {group?.getGroup?.admin?.length + group?.getGroup?.members?.length}</h2>
                </div>
                <div className='separate-line'></div>
                <div className='file-title-con'>
                  <h3 className='file-title' style={{width:"50%"}}>Member Name</h3>
                  <h3 className='file-title' style={{width:"15%"}}>Member Role</h3>
                  <h3 className='file-title' style={{width:"25%"}}>Action</h3>
                </div>

                {group?.getGroup?.admin.map((member : any) => (
                <div className='file-title-con'>
                  <p className='file-content' style={{width:"50%"}}>{member.firstname + " " + member.surname}</p>
                  <p className='file-content' style={{width:"15%"}}>Admin</p>
                  <p className='file-content' style={{width:"25%"}}></p>
                </div>
                ))}

                {group?.getGroup?.members.map((member : any) => (
                <div className='file-title-con'>
                  <p className='file-content' style={{width:"50%"}}>{member.firstname + " " + member.surname}</p>
                  <p className='file-content' style={{width:"15%"}}>Member</p>
                  <p className='file-content' style={{width:"25%", display:"flex", gap:"1em", alignItems:"center", justifyContent:"center"}}> 
                  {group.getGroup.isAdmin && (<AiFillDelete style={{width:"28px", height:"28px", cursor:"pointer"}} onClick = {() => handleDeleteMember(group?.getGroup?.group?.id, member.id)}/>)}
                  {group.getGroup.isAdmin && (<IoPush style={{width:"28px", height:"28px", cursor:"pointer"}} onClick = {() => {
                    handlePromote(group?.getGroup?.group?.id, member.id)
                  }}/>)}
                  </p>
                </div>
                ))}
              </div>
                </>
              )}

              {selectedNav === "Join Request" && (
              <>
              <div className='group-mid-content'>
                <div className='group-file-container'>
                  <h2>Join Requests</h2>
                </div>
                <div className='separate-line'></div>
                <div className='file-title-con'>
                  <h3 className='file-title' style={{width:"20%"}}>Profile</h3>
                  <h3 className='file-title' style={{width:"50%"}}>Name</h3>
                  <h3 className='file-title' style={{width:"20%"}}>Action</h3>
                </div>

                {group?.getGroup?.joinRequest.map((member : any) => (
                <div className='file-title-con'>
                  <p className='file-content' style={{width:"20%"}}> <img src={member.profile} className='image' alt="" /> </p>
                  <p className='file-content' style={{width:"50%"}}>{member.firstname + " " + member.surname}</p>
                  <p className='file-content' style={{width:"20%", display:"flex", gap:"1em", alignItems:"center", justifyContent:"center"}}> 
                  {group.getGroup.isAdmin && (<AiFillDelete style={{width:"28px", height:"28px", cursor:"pointer"}} onClick = {() => handleDeleteJoin(group?.getGroup?.group?.name ,group?.getGroup?.group?.id, member.id)}/>)}
                  {group.getGroup.isAdmin && (<AiFillCheckCircle style={{width:"28px", height:"28px", cursor:"pointer"}} onClick = {() => {
                    handleAcceptJoin(group?.getGroup?.group?.name, group?.getGroup?.group?.id, member.id)
                  }}/>)}
                  </p>
                </div>
                ))}
              </div>
                </>
              )}
          </div>

        </div>
        <SingleFileDialog
          open={openCreateConv}
          onClose={handleCloseCreateConv}
          disableBackdropClick={false}
          userID={data?.getUserWToken?.id}
          groupID={groupID}
          refetch={refetchGroup}
        />
        <GroupPostDialog onClose={handleCloseDet} open={openDet} disableBackdropClick={false} profile={data.getUserWToken.profile} name={data.getUserWToken.firstname + " " + data.getUserWToken.surname} groupId={groupID} userId={data.getUserWToken.id} refetch={refetchGroup} />
        <GroupCommentDialog onClose={handleCloseComment} open={openComment} disableBackdropClick={false} forum={selectedForum} userId={data.getUserWToken.id} refetchForum={refetchGroup}/>
        <ChatDialog
                onClose={closeInviteDialog}
                open={inviteDialogOpen}
                disableBackdropClick={false}
                userId={data.getUserWToken.id}
                refetch={refetchGroup}
                title="Invite Users"
                members={group?.getGroup?.members}
                admin = {group?.getGroup?.admin}
                groupID = {group?.getGroup?.group?.id}
            />
        {openEditDialog && (
          <EditProfileDialog onClose={handleCloseEditDialog} onUpdateProfile={handleUpdateProfile} picture={group?.getGroup?.group?.profile}/>
        )}
        <LoadingIndicator loading={loading} />
        <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      </div>)
    )
}

export default GroupProfile
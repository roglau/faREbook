import React, {useState, useEffect} from 'react'
import '../index.css'
import { AiFillHome, AiFillSetting } from 'react-icons/ai'
import { getUser } from '../provider/UserProvider'
import LoadingIndicator from '../components/LoadingIndicator'
import { FaUserFriends } from 'react-icons/fa'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_FRIEND, CREATE_NOTIF, CREATE_REQUESTS, DELETE_REQUEST, DELETE_REQUEST_REQUESTER, DELETE_REQUEST_TARGET, GET_ALL_REQUESTS, GET_SUGGESTED_FRIENDS } from '../query/query'
import { useNavigate } from 'react-router-dom'

const Friend = () => {

    const data = getUser()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);

    const {data: requests, refetch:refetchRequests} = useQuery(GET_ALL_REQUESTS,{
      variables : {
        targetID : data?.getUserWToken?.id
      }
    })

    const {data: fsuggestions, refetch:refetchSuggestions} = useQuery(GET_SUGGESTED_FRIENDS,{
      variables : {
        userID : data?.getUserWToken?.id
      }
    })

    const[suggestions, setSuggestions] = useState<any>()

    // console.log(requests)
    console.log(fsuggestions)
    useEffect(() => {
      if(fsuggestions){
        setSuggestions(fsuggestions);
      }
    },[fsuggestions])

    const [createFriend] = useMutation(CREATE_FRIEND)
    const [deleteRequest] = useMutation(DELETE_REQUEST)
    const [createRequest] = useMutation(CREATE_REQUESTS)
    const [deleteRequestTarget] = useMutation(DELETE_REQUEST_TARGET)
    const [deleteRequestRequester] = useMutation(DELETE_REQUEST_REQUESTER)
    const [createNotif] = useMutation(CREATE_NOTIF)

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
          await refetchRequests()
          await refetchSuggestions()
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
        await refetchRequests()
        await refetchSuggestions()
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
        await refetchRequests()
        await refetchSuggestions()
      })
    }

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
          await refetchRequests()
          await refetchSuggestions()
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

    const handleDeleteSuggestion = async (index: number) => {
      const updatedSuggestions = [...suggestions.getFriendSuggestions];

      // Remove the item at the specified index
      updatedSuggestions.splice(index, 1);
    
      // Update the state with the modified suggestions array
      setSuggestions({
        ...suggestions,
        getFriendSuggestions: updatedSuggestions,
      });
    };


  return (
    <div className='searchcontent-container'>
      <div className='sidebar'>
        <div className='friendsidebar-content'>
            <div style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"1.5em"}}>
                <h1>Friend</h1>
                <AiFillSetting className="nav-icon"/>
            </div>
            
            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em"}}>
            <AiFillHome className={location.pathname === '/friend' ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>Home</h3>
            </div>

            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em"}}>
            <FaUserFriends className={location.pathname === '/friend' ? 'nav-icon active-icon' : 'nav-icon'}/>
                <h3>All Friends</h3>
            </div>
        </div>
      </div>
      <div className='search-container'>
        <div style={{width:"90%", marginLeft:"3%", display:"flex", flexDirection:"column", gap:"1em"}}>
          <h2>Friend Request</h2>
          <div className='friendreq-container'>
          {requests?.getAllRequest?.length < 1 && (
            <h3>No Request</h3>
          )}
          {requests?.getAllRequest?.map((request : any) => (
            <div className='friendreq-item' style={{ backgroundImage: `url(${request.requester.user.profile})` }} onClick={() => {
              navigate('/profile', { state: { userId: request.requester.user.id } })
            }}>
              <div className='friendreq-content'>
                <p style={{paddingTop:"0.3em"}}>{request.requester.user.firstname + " " + request.requester.user.surname}</p>
                <p style={{paddingTop:"0.3em"}}>{request.requester.mutuals.length + " Mutuals"}</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1em" , padding:"0.3em"}}>
                  <div className='confirm-button' onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmReq(request.requester.user.id)}}>
                    <p>Accept Request</p>
                  </div>
                  <div className='delete-button' onClick={(e) => {e.stopPropagation();handleDeleteRequester(request.requester.user.id)}}>
                    <p>Decline Request</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          <div style={{width:"97.5%", height:"0.1em", backgroundColor:"var(--shadow-color)", marginTop:"2.5em"}} />
        </div>


        <div style={{width:"90%", marginLeft:"3%", display:"flex", flexDirection:"column", gap:"1em"}}>
          <h2>People You Might Know</h2>
          <div className='friendreq-container'>
          {suggestions?.getFriendSuggestions?.length < 1 && (
            <h3>No Suggestions</h3>
          )}
          {suggestions?.getFriendSuggestions?.map((people : any, index:number) => (
            index < 5 && (<div className='friendreq-item' style={{ backgroundImage: `url(${people.user.profile})` }} 
            onClick={() => {navigate('/profile', { state: { userId: people.user.id } })}}>
              <div className='friendreq-content'>
                <p style={{paddingTop:"0.3em"}}>{people.user.firstname + " " + people.user.surname}</p>
                <p style={{paddingTop:"0.3em"}}>{people.mutuals.length + " Mutuals"}</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1em", padding:"0.3em" }}>
                {!people.hasFriendRequest && !people.hasSentRequest && (
                <div style={{width:"100%", display:"flex",flexDirection:"column" , justifyContent:"center", gap:"1em", alignItems:"center"}}>
                    <div className='confirm-button' onClick={(e) => {
                      e.stopPropagation();
                      handleAddFriend(people.user.id)}}>
                        Add Friend
                    </div>
                    <div className='delete-button' 
                  onClick={(e) => { e.stopPropagation(); handleDeleteSuggestion(index)}}
                  >
                    Delete
                  </div>
                </div>)}
                    {people.hasSentRequest && (
                      <div style={{width:"100%", display:"flex",flexDirection:"column" , justifyContent:"center", gap:"1em", alignItems:"center"}}>
                    <div className='confirm-button' onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReqTarget(people.user.id)}}>
                        Cancel Request
                    </div>
                    <div className='delete-button' 
                  onClick={(e) => { e.stopPropagation(); handleDeleteSuggestion(index)}}
                  >
                    Delete
                  </div>
                    </div>)}
                    {people.hasFriendRequest && (<div style={{width:"100%", display:"flex",flexDirection:"column" , justifyContent:"center", gap:"1em", alignItems:"center"}}>
                        <div className='confirm-button' onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmReq(people.user.id)}}>Accept Request</div>
                        <div className='delete-button' onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequester(people.user.id)}}>Decline Request</div>
                    </div>)}
                  

                </div>
              </div>
            </div>)
          ))}
          </div>
        </div>
      </div>
      
      
      <LoadingIndicator loading={loading} />
    </div>
  )
}

export default Friend
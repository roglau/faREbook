import React, {useEffect} from 'react'
import { getNotif, getUser } from '../provider/UserProvider'
import { useMutation, useQuery } from '@apollo/client'
import { ACCEPT_INVITE, DELETE_INVITE, GET_ALL_INVITE } from '../query/query'

const Notification = () => {
    const data = getUser()
    const notifs = getNotif(data);
    const {data : invites, refetch: refetchInv}  = useQuery(GET_ALL_INVITE, {
        variables : {
            userID: data?.getUserWToken?.id
        }
    })

    const [acceptInvite] = useMutation(ACCEPT_INVITE)
    const [deleteInvite] = useMutation(DELETE_INVITE)

    const handleAccept = async(groupID: any) => {
        await acceptInvite({
            variables:{
                groupID : groupID,
                invited: data?.getUserWToken?.id
            }
        }).then(async () => {
            await refetchInv()
        })
    }

    const handleDecline = async (groupID: any) => {
        await deleteInvite({
            variables:{
                groupID : groupID,
                invited: data?.getUserWToken?.id
            }
        }).then(async () => {
            await refetchInv()
        })
    }

    useEffect(() => {
        // console.log(notifs)
    },[notifs, data])
  return (
    <div className='notifcontent-container'>
        <div className='notif-container'>
            <h2>Notifications</h2>
            <div style={{display:"flex", gap:"1em"}}>
                <p>All</p>
                <p>Unread</p>
            </div>
            {invites?.getAllInvite?.map((notif : any) => (
                <div className='notif-item'>
                    <div style={{display:"flex", alignItems:"center", gap:"0.5em"}}>
                        <img src={notif.admin.profile} style={{width:"40px", height:"40px", objectFit:"cover"}} alt="" />
                        <div>
                            <p>{"You're invited by " + notif.admin.firstname + " " +notif.admin.surname  +" to " + notif.group.name + " Group"}</p>
                            <div style={{display:"flex", gap:"1em", width:"80%"}}>
                                <p className='confirm-button' onClick={() => {handleAccept(notif.group.id)}}>Accept Invite</p>
                                <p className='delete-button' onClick={() => {handleDecline(notif.group.id)}}>Decline Invite</p>
                            </div>
                        </div>

                    </div>
                    {(!true) ? (
                        <></>
                    ): (
                        <div style={{borderRadius:"50%", backgroundColor:"blue", minWidth:"10px", height:"10px"}}/>
                    )}
                    
                </div>
            ))}
            {notifs?.notifs?.notifLists?.map((notif : any) => (
                <div className='notif-item'>
                    <div style={{display:"flex", alignItems:"center", gap:"0.5em"}}>
                        <img src={notif.user2.profile} style={{width:"40px", height:"40px", objectFit:"cover"}} alt="" />
                        <p>{notif.notif.notif}</p>
                    </div>
                    {(notif.notif.hasRead) ? (
                        <></>
                    ): (
                        <div style={{borderRadius:"50%", backgroundColor:"blue", minWidth:"10px", height:"10px"}}/>
                    )}
                </div>
            ))}


        </div>
        
    </div>
  )
}

export default Notification
import React, { useEffect, useState } from 'react';
import './ChatDialog.css'; // Import your CSS file for styling
import {AiFillFileImage, AiOutlineDelete} from 'react-icons/ai';
import {BsPersonFillAdd} from 'react-icons/bs';
import CustomSnackbar from './CustomSnackbar';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_CONVERSATION, CREATE_GROUP_INVITED, GET_ALL_FRIEND, GET_ALL_INVITES, GET_ALL_USER, INSERT_POST } from '../query/query';
import Axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingIndicator from './LoadingIndicator';
import CustomSelect from './CustomSelect';

interface ChatDialogProps {
  onClose: () => void;
  open: boolean;
  disableBackdropClick: boolean;
  userId : string;
  refetch: any;
  title: string;
  members:any;
  admin:any;
  groupID:any;
}

export interface Option {
    value: string;
    label: string;
  }
  


const ChatDialog: React.FC<ChatDialogProps> = ({ onClose, title, open, disableBackdropClick, groupID, userId, refetch, members, admin}) => {

  const {data : friends, refetch:refetchFriends} = useQuery(GET_ALL_USER)
  const { data: invites, refetch: refetchInvites } = groupID !== null
  ? useQuery(GET_ALL_INVITES, {
      variables: {
        groupID: groupID,
      },
    })
  : { data: null, refetch: () => {} }; 

  // console.log(invites)

  useEffect(() => {
    refetchFriends()
  },[])

  const[options, setOptions] = useState<any>()

  useEffect(() => {
    if (friends) {
      if(members && admin && invites){
        const filteredOptions = friends?.getAllUser?.filter((friend: any) => {
          return !members.some((member: any) => member.id === friend.id) && friend.id !== admin.id && friend.id !== userId && !invites.getAllInvites.some((member: any) => member.userID === friend.id);
        }).map((friend: any) => ({
          value: friend.id,
          label: `${friend.firstname} ${friend.surname}`,
        }));
        setOptions(filteredOptions || []);
      }else{
        const filteredOptions = friends?.getAllUser?.filter((friend: any) => friend.id !== userId)
          .map((friend: any) => ({
            value: friend.id,
            label: `${friend.firstname} ${friend.surname}`,
          }));
        setOptions(filteredOptions || []);
      }
    }
  }, [friends, invites]);
  

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableBackdropClick && event.target === event.currentTarget) {
        setSelectedOptions([])
      onClose();
    }
  };

  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]); 
  const handleSelectedOptionsChange = (newSelectedOptions: Option[]) => {
    setSelectedOptions(newSelectedOptions);
  };

  const [loading, setLoading] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  const [createConversation] = useMutation(CREATE_CONVERSATION)
  const [createGroupInvited] = useMutation(CREATE_GROUP_INVITED)

  const handlePost = async () => {
    if(title === 'Create Chat'){
      const values = selectedOptions?.map(obj => obj.value);
    // console.log(values)
      if(selectedOptions.length > 1){
          const inputConversation = {
              user1ID: userId,
              user2ID: "",
              users: values,
              group : true
          }

          await createConversation({
              variables : {
                  inputConversation : inputConversation
              }
          }).then(async (response) => {
              console.log(response)
              await refetch().then(async () => {
                  setSelectedOptions([])
                  await onClose()
              })
          })
      }else if(selectedOptions.length == 1){
          const inputConversation = {
              user1ID: userId,
              user2ID: values[0],
              users: "",
              group : false
          }

          await createConversation({
              variables : {
                  inputConversation : inputConversation
              }
          }).then(async (response) => {
              console.log(response)
              await refetch().then(async () => {
                  setSelectedOptions([])
                  await onClose()
              })
          })
        }
    }else{
      const invitedUsers = selectedOptions?.map(obj => obj.value);
      let count = 0
      for (const invitedUser of invitedUsers) {
        console.log(invitedUser, groupID)
        await createGroupInvited({
          variables: {
            groupID: groupID,
            invited: invitedUser
          }
        }).then((response) => {
          console.log(response)
          count++
        })
      }

      if(count === invitedUsers.length){
        await refetchInvites()
        await refetch()
        await onClose()
      }
    }

    
  }

  if (!open) return null;

  return (
    <div className="chat-dialog-overlay" onClick={handleClickOutside}>
      <div className="chat-dialog-content">
        <button className='close-button' onClick={() => {setSelectedOptions([]); onClose()}}>X</button>
        
        <h3>{title}</h3>
       
        <hr />
        <div style={{display:"flex" , alignItems:"center", height:"50%", width:"100%", paddingBottom:"10%"}}>
        <CustomSelect placeholder={"Select User"} options={options} selectedOptions={selectedOptions} onChange={handleSelectedOptionsChange} />

        </div>
        

        <button className='create-btn' onClick={handlePost}>{title}</button>
      </div>
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      <LoadingIndicator loading={loading} />
    </div>

  );
};

export default ChatDialog;

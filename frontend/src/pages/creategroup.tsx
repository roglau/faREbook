import React, {useState, useRef, useEffect} from 'react'
import '../index.css'
import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '../provider/UserProvider';
import LoadingIndicator from '../components/LoadingIndicator';
import { AiFillFileImage, AiFillSetting } from 'react-icons/ai';
import {PiTextAaBold} from 'react-icons/pi'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_GROUP, CREATE_STORY, GET_ALL_FRIEND } from '../query/query';
import Axios from 'axios';
import NavbarNoBg from '../components/NavbarNoBg';
import { Option } from '../components/ChatDialog';
import CustomSelect from '../components/CustomSelect';
import CustomSnackbar from '../components/CustomSnackbar';

const CreateGroup = () => {
    const data = getUser()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
  
    const [privacy, setPrivacy] = useState<string>('public');
    const[groupName, setGroupName] = useState("");

  
    const {data : friends, refetch:refetchFriends} = useQuery(GET_ALL_FRIEND,{
        variables : {
            userID : data?.getUserWToken?.id
        }
    })

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleErrorClose = () => {
        setErrorOpen(false);
    };

    const[options, setOptions] = useState<any>()
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]); 
    const handleSelectedOptionsChange = (newSelectedOptions: Option[]) => {
      setSelectedOptions(newSelectedOptions);
    };

    useEffect(() => {
        if (friends) {
        const filteredOptions = friends?.getAllFriend?.map((friend: any) => ({
            value: friend.id,
            label: `${friend.firstname} ${friend.surname}`,
            }));
        setOptions(filteredOptions || []);
        }
    }, [friends]);
  
    useEffect(() => {
      if(!data){
        setLoading(true)
      }
      if(data){
        setLoading(false)
      }
    }, [data])

  
    const [createGroup] = useMutation(CREATE_GROUP)
    const handlePostText = async() => {
        if(groupName.length < 1){
            setErrorMessage('Group name must be filled')
            setErrorOpen(true)
            return
        }
        setErrorOpen(false)
        const values = selectedOptions?.map(obj => obj.value);

        const inputGroup = {
            name: groupName,
            privacy: privacy
        }   

        await createGroup({
            variables:{
                inputGroup : inputGroup,
                userID: data?.getUserWToken?.id,
                invited: values
            }   
        }).then((response) => {
            console.log(response)
            setGroupName("")
            setPrivacy("public")
            setSelectedOptions([])
            navigate('/')
        })
  
    }

    
  
    return (
      data && (
      <div>
          <NavbarNoBg/>
          
  
        <div className='sidebar'>
          <div className='sidebar-content' style={{position:"relative"}}>
              <div className="sidebar-header">
                  <h1>Create Group</h1>
                  <AiFillSetting className="nav-icon"/>
              </div>
              
              <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", borderBottom:"1px var(--shadow-color) solid", paddingBottom:"1.5em"}}>
                    <img
                      src={data.getUserWToken.profile}
                      alt='Profile'
                      style={{width:"48px", height:"48px", borderRadius:"50%", objectFit:'cover'}}
                      />
                  {data && (
                    <div>
                        <p style={{fontSize:"20px"}}>{data.getUserWToken.firstname + " " + data.getUserWToken.surname}</p>
                        <p style={{fontSize:"20px"}}>Admin</p>
                    </div>

                  )}
              </div>

              <div style={{width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:"1em", paddingBottom:"1.5em"}}>
                  <input type="text" name="" className='group-text' id="" placeholder='Group Name' value={groupName} onChange={(e) => setGroupName(e.target.value)} />

                  <div style={{width:"100%"}}>
                        <select
                        style={{width:"100%", borderRadius:"10px", padding:"3%", backgroundColor:"var(--nav-color)", color:"var(--text-color)"}}
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        >
                        <option value='public'>Public</option>
                        <option value='friends'>Private</option>
                        </select>
                    </div>

                    <CustomSelect placeholder={"Invite Friends (Optional)"} options={options} selectedOptions={selectedOptions} onChange={handleSelectedOptionsChange} />
              </div>
  
              <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column", gap:"1.5em"}}>
                <div className='story-actions-container'>
                    <div style={{backgroundColor:"rgb(7, 123, 205)",width:"90%", display:"flex", justifyContent:"center", padding:"5%", borderRadius:"10px", position:"absolute", bottom:"7.5em", color:"white"}} onClick={handlePostText}>
                        <p>Create Group</p>
                    </div>
                </div>
              </div>
              
          </div>
  
        </div>
        <div className='story-container'>
        
        <div className='g-preview-con'>
            <h3>Preview</h3>
            <div className='preview-content'>
                <div className='group-preview'>
                    <img src="https://res.cloudinary.com/diuzx0kak/image/upload/v1692327787/Screenshot_2023-08-18_100121_xtihi9.png" alt="" />
                    <div>
                        <h3 className='group-name'>{groupName ? groupName : "Group Name"}</h3>
                        <h4 className='group-privacy'>{privacy ? privacy.charAt(0).toUpperCase() + privacy.slice(1) + " - "  + (selectedOptions.length + 1) + " Member" : "Group Privacy"}</h4>

                    </div>
                    <div className='group-preview-nav'>
                        <p>About</p>
                        <p>Posts</p>
                        <p>Members</p>
                        <p>Events</p>
                    </div>
                    <div className='separate-line'></div>
                    <div className='group-preview-content'>
                    <img
                        src='defaultprofile.png'
                        alt='Profile'
                        className='profile-image'
                    />
                    <input type="text" className='homecontent-mid-text' placeholder="What's on your mind"/>
                    </div>
                    
                </div>
            </div>
        </div>

        </div>
  
        <LoadingIndicator loading={loading} />
        <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      </div>)
    )
}

export default CreateGroup
import React, {useEffect, useState} from 'react'
import '../index.css'
import { AiFillCloseCircle, AiFillFileImage, AiFillPauseCircle, AiFillPlayCircle, AiOutlineSend } from 'react-icons/ai'
import { getUser } from '../provider/UserProvider'
import LoadingIndicator from '../components/LoadingIndicator'
import { useMutation, useQuery } from '@apollo/client'
import { CREATE_MESSAGE, GET_ALL_CONVERSATIONS } from '../query/query'
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { IoIosCreate } from 'react-icons/io'
import { MdKeyboardVoice } from 'react-icons/md'
import ChatDialog from '../components/ChatDialog'
import ChatFileDialog from '../components/ChatFileDialog'
import CustomSnackbar from '../components/CustomSnackbar'
import Axios from 'axios';
import RecordRTC from 'recordrtc';
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/Searchbar'

const Chat = () => {
    const data = getUser()
    const [loading, setLoading] = useState(false);

    const {data: conversations, refetch : refetchConversations} = useQuery(GET_ALL_CONVERSATIONS,{
        variables : {
            userID : data?.getUserWToken?.id
        }
    })
    
    const[createMessage] = useMutation(CREATE_MESSAGE)
    const [content, setContent] = useState("")
    const [openCreateConv,setOpenCreateConv] = useState(false)

    const [openDet, setOpenDet] = useState(false);
    const handleCloseDet = () => {
        setOpenDet(false);
    };
    const [selectedConversation, setSelectedConversation] = useState<any>()

    useEffect(() => {
        // Create and initialize the WebSocket connection
        const ws = new WebSocket('ws://localhost:7778/websocket');

        ws.onopen = () => {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            // Handle the received message
            console.log('Received message:', message);
            
            await setSelectedConversation((prevConversation : any) => {
                if (prevConversation.conversation.id === message.message.conversationID) {
                  return {
                    ...prevConversation,
                    messages: [...prevConversation.messages, message],
                  };
                }
                return prevConversation;
            });
            
            await refetchConversations();
            
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Cleanup WebSocket on component unmount
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    
    const [selectedFiles, setSelectedFiles] = useState<any>([]);

    useEffect(() => {
        console.log(selectedConversation)
    },[selectedConversation])

    const handleSend = async () => {
        if(content.length > 0 || selectedFiles.length > 0 || audioBlob){
            let mediaUrls: string[] = []
            let hasMedia = false
            if(selectedFiles.length > 0){
                setLoading(true)
                hasMedia = true
                for (const file of selectedFiles) {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('upload_preset', 'ete7d3zg');
                
                  let apiUrl = 'https://api.cloudinary.com/v1_1/diuzx0kak/';
                  if (file.type.includes('image')) {
                    apiUrl += 'image/upload';
                  } else if (file.type.includes('video')) {
                    apiUrl += 'video/upload';
                  } else {
                    console.log(`Unsupported file type: ${file.type}`);
                    continue;
                  }
                
                  try {
                    const response = await Axios.post(apiUrl, formData);
                    const secureUrl = response.data.secure_url;
                    mediaUrls.push(secureUrl);
                  } catch (error) {
                    console.error('Error uploading file:', error);
                  }
                }    
            }

            if(audioBlob){
                setLoading(true)
                hasMedia=true;
                const formData = new FormData();
                const audioFile = new File([audioBlob], 'audio.wav', { type: audioBlob.type });
                formData.append('file', audioFile);
                formData.append('upload_preset', 'ete7d3zg');
                let apiUrl = 'https://api.cloudinary.com/v1_1/diuzx0kak/upload';
                try {
                    const response = await Axios.post(apiUrl, formData);
                    const secureUrl = response.data.secure_url;
                    console.log(secureUrl)
    
                    const cloudinaryOptions = {
                        resource_type: 'audio',
                        video: false,
                      };
                
                      const transformedAudioUrl = await Axios.get(secureUrl, {
                        params: cloudinaryOptions,
                      }).then(response => response.request.responseURL);
                
                      console.log('Transformed audio URL:', transformedAudioUrl);
                      mediaUrls.push(transformedAudioUrl);
                  } catch (error) {
                    console.error('Error uploading file:', error);
                  }
            }

            const message = {
                content: content,
                senderID: data.getUserWToken.id,
                conversationID: selectedConversation?.conversation.id,
                hasMedia : hasMedia
            };
    
            await createMessage({
                variables :{
                    inputMessage: message,
                    medias : mediaUrls
                }
            }).then((response) =>{
                console.log(response);
                setSelectedFiles([])
                setContent("")
                setLoading(false)
                setAudioBlob("")
                setAudioURL("")
            })
        }
        
    }
    
    const handleCloseCreateConv = () => {
        setOpenCreateConv(false);
    };

    const [allConversations, setAllConversations] = useState<any> ()

    useEffect(() => {
        const getConv = async() => {
            await setAllConversations(conversations)
        }

        if(conversations){
            getConv()
        }
    },[conversations])

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleErrorClose = () => {
        setErrorOpen(false);
    };

    const handleFileInputChange = async(event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {      
          const newSelectedFiles = Array.from(event.target.files);
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp',
            'video/mp4',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-flv',
            'video/x-matroska',
            'video/webm',
          ];
    
          const validNewFiles = Array.from(newSelectedFiles).filter(
            (file: File) =>
              allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
          );
    
          if (validNewFiles.length + selectedFiles.length > 10) {
            setErrorMessage('You can only upload up to 10 files in total.');
            setErrorOpen(true);
            return;
          }
    
          for (const file of validNewFiles) {
            await setSelectedFiles((prevSelected: any) => [
              ...prevSelected,
              file,
            ]);
          }
        }
      };


      const [isRecording, setIsRecording] = useState(false);
      const [isPaused, setIsPaused] = useState(false);
      const [audioRecorder, setAudioRecorder] = useState<any>(null);
      const [audioBlob, setAudioBlob] = useState<any>(null);
      const [audioURL, setAudioURL] = useState<any>(null);
    
      const startRecording = async () => {
        if(!isRecording){
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioRecorder = new RecordRTC(stream, {
              type: 'audio',
              mimeType: 'audio/webm',
            });
        
            audioRecorder.startRecording();
            setAudioRecorder(audioRecorder);
            setIsRecording(true);
        }else{
            stopRecording()
        }
      };

      const pauseRecording = () => {
        setIsPaused(true);
        audioRecorder.pauseRecording();
        };

        const resumeRecording = () => {
            setIsPaused(false);
            audioRecorder.resumeRecording();
        };

      const stopRecording = async () => {
        if (audioRecorder) {
            audioRecorder.stopRecording(() => {
            const audioBlob = audioRecorder.getBlob();
            setAudioBlob(audioBlob)
            setAudioURL(URL.createObjectURL(audioBlob));
    
            setIsRecording(false);
            setAudioRecorder(null);
          });
        }
      };

      const [searched, setSearched] = useState('');
      const [conv, setConv] = useState<any>()

      const onEnterPress = (e : any) => {
        if (searched.trim() !== '') {
            setConv(conversations)
            const filteredConversations = conversations?.getAllConversation?.filter((conversation : any) => {
              const interlocutorName = conversation.interlocutor
                ? `${conversation.interlocutor.firstname} ${conversation.interlocutor.surname}`
                : conversation.interlocutors.map((interlocutor: any) => `${interlocutor.firstname} ${interlocutor.surname}`).join(', ');
        
              return interlocutorName.toLowerCase().includes(searched.toLowerCase());
            });

            // console.log(filteredConversations)

            const filteredConversationsMsg = conversations?.getAllConversation?.filter((conversation : any) => {
                const conversationContainsSearched = conversation?.messages?.some((message : any) =>
                  message?.message?.content?.toLowerCase().includes(searched.toLowerCase())
                );
                return conversationContainsSearched;
              });
              
            // console.log(filteredConversationsMsg)

            const combinedFilteredConversations = [...filteredConversations, ...filteredConversationsMsg];
            setAllConversations((prevConversations: any) => ({
                ...prevConversations,
                getAllConversation: combinedFilteredConversations,
              }));
          }else{
            setAllConversations(conv)
          }
      }

      const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearched(e.target.value);
      };
    
      const cancelSearch = () => {
        setSearched('');
      };

    //   console.log(conversations?.getAllConversation)

  return (
    <div className='chat-container' >
      <div className='chat-sidebar'>
            <div style={{width:"95%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5% 2.5%"}}>
                <h1>Chat</h1>
                <div style={{display:"flex",gap:"1em"}}>
                    <HiOutlineDotsHorizontal className="nav-icon"/>
                    <div onClick={() => setOpenDet(true)}>
                        <IoIosCreate className="nav-icon"/>
                    </div>
                </div>
            </div>
            <SearchBar
              value={searched}
              onChange={handleSearch}
              onCancelSearch={cancelSearch}
              placeholder='Search'
              onEnterPress={(e : any) => onEnterPress(e)}
            />
            
            {allConversations?.getAllConversation?.map((conversation: any) => (
                <>
                {conversation.interlocutor ? (
                <div style={{width:"95%", display:"flex", alignItems:"center", gap:"1em", padding:"5% 2.5%", cursor:"pointer"}} onClick={() => setSelectedConversation(conversation)}>
                    <img src={conversation.interlocutor.profile} className='image' alt="" />
                    <h3>{conversation.interlocutor.firstname + " " + conversation.interlocutor.surname}</h3>
                </div>) :
                (
                    <div style={{width:"95%", display:"flex", alignItems:"center", gap:"1.5em", padding:"5% 2.5%", cursor:"pointer"}} onClick={() => setSelectedConversation(conversation)}>
                    <div style={{position:"relative"}}>
                        <img src={conversation.interlocutors[0]?.profile} className='image' alt="" />
                        <img style={{position:"absolute", left:"1em"}} src={conversation.interlocutors[1]?.profile} className='image' alt="" />
                    </div>
                    <h3>{conversation.interlocutors[0]?.firstname + ", " + conversation.interlocutors[1]?.firstname}{conversation.interlocutors.length > 2 ? (", ...") : ("")}</h3>
                    </div>
                )}
            </>
            ))}
            
      </div>
      {!selectedConversation ? (<div className='chat-content' style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <h2>
            Select a chat or start new conversation  

        </h2>
        
      </div>):(
        
        <div className='chat-content'>
            {selectedConversation.interlocutor ? (
                <div className='chat-topprofile'>
                    <div>
                        <img src={selectedConversation.interlocutor.profile} className='image' alt="" />
                    </div>
                    <p>{selectedConversation.interlocutor.firstname + " " + selectedConversation.interlocutor.surname}</p>
                </div>) :
                (
                <div className='chat-topprofile'>
                    <div style={{position:"relative"}}>
                        <img src={selectedConversation.interlocutors[0].profile} className='image' alt="" />
                        <img style={{position:"absolute", left:"1em"}} src={selectedConversation.interlocutors[1].profile} className='image' alt="" />
                    </div>
                    <p>{selectedConversation.interlocutors[0]?.firstname + ", " + selectedConversation.interlocutors[1]?.firstname}{selectedConversation.interlocutors.length > 2 ? (", ...") : ("")}</p>
                </div>
            )}
            
            <div className='chatitems-container' style={{width:'74.5vw', height:'65vh',paddingBottom:'10px', backgroundColor:'var(--header_background)', border:'1px solid rgba(255, 255, 255, 0.084)', overflowY:'scroll'}}>
                    {selectedConversation.interlocutor ? (
                        <div className='chat-profile'>
                            <img src={selectedConversation.interlocutor.profile} className='image' alt="" />
                            <p>{selectedConversation.interlocutor.firstname + " " + selectedConversation.interlocutor.surname}</p>
                        </div>
                        ) :
                        (
                        <div className='chat-profile'>
                            <div style={{position:"relative"}}>
                                <img src={selectedConversation.interlocutors[0].profile} className='image' alt="" />
                                <img style={{position:"absolute", left:"1em"}} src={selectedConversation.interlocutors[1].profile} className='image' alt="" />
                            </div>
                            <p>{selectedConversation.interlocutors[0]?.firstname + ", " + selectedConversation.interlocutors[1]?.firstname}{selectedConversation.interlocutors.length > 2 ? (", ...") : ("")}</p>
                        </div>
                    )}
                    
                    
                    {selectedConversation?.messages?.map((message: any) => (
                    message?.message?.senderID === data.getUserWToken.id ? (
                        
                        <>
                        {message?.medias?.length > 0 && (
                            message.medias.map((media : any) => (
                                media.includes('image') ? (
                                    <div className='userchat-items'> 
                                        <img src={media} alt="" style={{width:"20vw", height:"20vh"}}/>
                                    </div> 
                                  ) : media.includes('audio') ? (
                                    <div className='userchat-items'>
                                        <audio controls>
                                            <source src={media} type="audio/mpeg" />
                                        </audio>
                                    </div>
                                  ) : (
                                    <div className='userchat-items'>
                                        <video controls style={{width:"20vw", height:"40vh", objectFit:"cover"}}>
                                            <source src={media}/>
                                        </video>
                                     </div>
                                  )
                                
                            ))  
                           
                        )}

                        {message.message.content && 
                        (
                            <div className='userchat-items'> 
                                <p className='userchat'>{message.message.content}</p>
                            </div> 
                        )}
                        </>
                    ) : (
                        selectedConversation.interlocutor ? (
                        <>
                            {message?.medias?.length > 0 && (
                                    message.medias.map((media : any) => (
                                        media.includes('image') ? (
                                            <div className='otherchat-items'> 
                                            <img src={selectedConversation.interlocutor.profile} className='image'  alt="" /> 
                                                <div>
                                                    <img src={media} alt="" style={{width:"20vw", height:"20vh"}}/>
                                                </div>
                                            </div> 
                                        ) : media.includes('audio') ?(
                                            <div className='otherchat-items'>
                                            <img src={selectedConversation.interlocutor.profile} className='image'  alt="" /> 
                                                <div>
                                                <audio controls>
                                                    <source src={media} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='otherchat-items'>
                                                 <img src={selectedConversation.interlocutor.profile} className='image'  alt="" /> 
                                                <video controls style={{width:"20vw", height:"50vh", objectFit:"cover"}}>
                                                    <source src={media}/>
                                                </video>
                                            </div>
                                        )
                                        
                                    ))  
                                
                                )}

                                {message.message.content && 
                                (
                                    <div className='otherchat-items'> 
                                        <img src={selectedConversation.interlocutor.profile} className='image'  alt="" /> 
                                        <div>
                                            <p className='otherchat'>{message.message.content}</p>
                                        </div>
                                    </div> 
                                )}
                        </>
                        ) : (
                            selectedConversation.interlocutors.map((interlocutor: any) => (
                               interlocutor.id == message.message.senderID && (
                               <>
                               {message.medias.length > 0 && (
                                    message.medias.map((media : any) => (
                                        media.includes('image') ? (
                                            <div className='otherchat-items'> 
                                            <img src={interlocutor.profile} className='image'  alt="" /> 
                                                <div>
                                                    <img src={media} alt="" style={{width:"20vw", height:"20vh"}}/>
                                                </div>
                                            </div> 
                                        ) : media.includes('audio') ?(
                                            <div className='otherchat-items'>
                                            <img src={interlocutor.profile}  className='image'  alt="" /> 
                                                <div>
                                                <audio controls>
                                                    <source src={media} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className='otherchat-items'>
                                                <img src={interlocutor.profile} className='image'  alt="" /> 
                                                <video controls style={{width:"20vw", height:"50vh", objectFit:"cover"}}>
                                                    <source src={media}/>
                                                </video>
                                            </div>
                                        )
                                        
                                    ))  
                                
                                )}

                                {message.message.content && 
                                (
                                    <div className='otherchat-items'> 
                                        <img src={interlocutor.profile}  alt="" /> 
                                                <div>
                                                    <p>{interlocutor.firstname + " " + interlocutor.surname}</p>
                                                    <p className='otherchat'>{message.message.content}</p>
                                                </div>
                                    </div>
                                )}
                               </>
                            )))
                        )
                    )
                    ))}

            </div>
            <div className='chat-bottominput'>
                {audioBlob && (<audio controls>
                    <source src={audioURL} type="audio/wav" />
                </audio>)}
                <div className='chat-actions'>
                    {audioBlob && <AiFillCloseCircle className='count-icons' onClick={() => {setAudioBlob(null)}}/>}
                    <MdKeyboardVoice className='count-icons' onClick={startRecording}/>
                    {isRecording &&(
                        <>
                        {isPaused ? (
                            <AiFillPauseCircle className='count-icons' onClick={resumeRecording} />
                        ) : (
                            <AiFillPlayCircle className='count-icons' onClick={pauseRecording} />
                        )}
                        </>
                    )}
                    <div onClick={() => {setOpenCreateConv(true)}}>
                        <AiFillFileImage className='count-icons'/>

                    </div>
                </div>
                <textarea className='chat-input' style={{height:'25px'}} value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                <div onClick={handleSend}>
                    <AiOutlineSend />

                </div>
            </div>
        </div>
      )}
      <ChatFileDialog
        open={openCreateConv}
        onClose={handleCloseCreateConv}
        disableBackdropClick={false}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        onChange={(e: any) => handleFileInputChange(e) }
      />
      <ChatDialog members={null} admin={null} groupID={null} title={"Create Chat"} onClose={handleCloseDet} open={openDet} disableBackdropClick={false} userId={data?.getUserWToken?.id} refetch={refetchConversations}/>
      <LoadingIndicator loading={loading} />
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
    </div>
  )
}

export default Chat
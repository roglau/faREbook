import React, {useState, useRef, useEffect} from 'react'
import '../index.css'
import { useNavigate } from 'react-router-dom';
import { getUser } from '../provider/UserProvider';
import LoadingIndicator from '../components/LoadingIndicator';
import { AiFillCloseCircle } from 'react-icons/ai';
import 'react-quill/dist/quill.snow.css';
import { useMutation } from '@apollo/client';
import { CREATE_REELS } from '../query/query';
import Axios from 'axios';
import { BiSolidVideoPlus } from 'react-icons/bi';
import NavbarNoBg from '../components/NavbarNoBg';

const CreateReel = () => {
    const data = getUser()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
  
    const[selectedFile, setSelectedFile] = useState<any>();
    const[reelsText, setReelsText] = useState("");

    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
    const[errMsg, setErrMsg] = useState("");
  
    const[progress, setProgress] = useState(1)
  
    const[createReel] = useMutation(CREATE_REELS)

    useEffect(() => {
      if(!data){
        setLoading(true)
      }
      if(data){
        setLoading(false)
      }
    }, [data])

    // useEffect(() => {
    //     console.log(selectedFile)
    // },[selectedFile])

    useEffect(() => {
        return () => {
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const f = event.target.files?.[0];
        if (f) {
            await setSelectedFile(f);
    
            // Create an object URL for the selected video and store it in the state
            const videoObjectURL = URL.createObjectURL(f);
            await setVideoPreviewUrl(videoObjectURL);
    
            // Load the video to get its duration
            const videoElement = document.createElement('video');
            videoElement.src = videoObjectURL;
            
            videoElement.onloadedmetadata = () => {
                if (videoElement.duration >= 1 && videoElement.duration <= 60) {
                    setErrMsg("")
                } else {
                    setErrMsg("Video duration must be 1 - 60 seconds")
                }
            };
        }
    };
    

    const handleNextProgress = async () => {
      if(progress === 1){
        if(!selectedFile){
          setErrMsg("Video must be chosen")
          return
        }
        const videoElement = document.createElement('video');
        videoElement.src = videoPreviewUrl;

        videoElement.onloadedmetadata = () => {
            const videoDuration = videoElement.duration;
            if (videoDuration < 1 || videoDuration > 60) {
              setErrMsg("Video duration must be 1 - 60 seconds")
            } else {
                setErrMsg("");
                setProgress(2);
            }
        };
      }else{
        if(reelsText.length < 1){
          setErrMsg("Reels caption must be filled")
          return
        }

        setErrMsg("")

        let mediaUrl
  
        setLoading(true)
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', 'ete7d3zg');
      
        let apiUrl = 'https://api.cloudinary.com/v1_1/diuzx0kak/video/upload';
      
        try {
          const response = await Axios.post(apiUrl, formData);
          const secureUrl = response.data.secure_url;
          mediaUrl = secureUrl
        } catch (error) {
          console.error('Error uploading file:', error);
        }

        const inputReels = {
          text : reelsText,
          userID : data.getUserWToken.id,
          video : mediaUrl
        }

        createReel({
          variables : {
            inputReels : inputReels
          }
        }).then((r) => {
          setLoading(false)
          console.log(r);
          navigate('/')
        })
      }
        
    }

    
  
    return (
      data && (
      <div>
          <NavbarNoBg/>
          
  
        <div className='sidebar'>
          <div className='reelsidebar-content'>
              {progress === 1 && (
              <>
              <div style={{width:"100%", display:"flex",flexDirection:"column",  paddingBottom:"1.5em"}}>
                  <p>Create reels</p>
                  <h1>Upload Video</h1>
              </div>

              <input
                type="file"
                style={{ display: "none" }}
                accept="video/*"
                id='imgInput'
                onChange={handleFileChange}
              />
         
  
            <label htmlFor="imgInput" style={{width:"100%", height:"20em" ,display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"0.5em", borderRadius:"10px", boxShadow:"0 0px 4px var(--shadow-color)"}}>
                <BiSolidVideoPlus className="nav-icon"/>
                <h4>Choose Video</h4>
            </label>
            </>
            )}

            {progress === 2 && (
              <>
              <div style={{width:"100%", display:"flex",flexDirection:"column",  paddingBottom:"1.5em"}}>
                  <p>Create reels</p>
                  <h1>Add Details</h1>
              </div>

              <textarea name="" id="" value={reelsText} cols={30} rows={10} style={{ resize: 'none', overflow: 'auto', padding:"0.5em", fontSize:"16px" }} placeholder='Add video caption' onChange={(e) => setReelsText(e.target.value)}/>
            </>
            )}
              
            <div style={{ position: "absolute", left: "0", bottom: "7em", width: "100%", height: "auto", padding:"1em 0", boxShadow: "0 0px 4px var(--shadow-color)", display: "flex", flexDirection:"column", alignItems: "center", justifyContent: "center", gap:"1em" }}>
                {errMsg && (
                    <p style={{fontSize:"20px", color:"red"}}>{errMsg}</p>
                )}
                <div style={{display:"flex",width:"95%", padding:"0.3em", justifyContent:"space-evenly"}}>
                {progress === 1 ? (
                <>
                    <div style={{ width: "45%", height: "0.3em", backgroundColor: "rgb(7, 123, 205)", borderRadius: "10px" }} />
                    <div style={{ width: "45%", height: "0.3em", backgroundColor: "var(--shadow-color)", borderRadius: "10px" }} />
                </>
                ) : (
                <>
                    <div style={{ width: "45%", height: "0.3em", backgroundColor: "rgb(7, 123, 205)", borderRadius: "10px" }} />
                    <div style={{ width: "45%", height: "0.3em", backgroundColor: "rgb(7, 123, 205)", borderRadius: "10px" }} />
                </>
                )}
                </div>
                <div style={{width:"90%", padding:"1em", textAlign:"center", cursor:"pointer"}} className='confirm-button' onClick={()=> handleNextProgress()}>
                    <h3 style={{color:"white"}}>Next</h3>
                </div>
            </div>

              
          </div>
  
        </div>
        <div className='story-container'>
        {!selectedFile ? (
            <div className='story-preview'>
                <h3>Preview</h3>
                <div className='preview-content'>
                    <div style={{width:"25em", height:"92.5%", borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center"}}>
                    <h4 style={{opacity:"50%"}}> Upload a Video</h4>
                       
                    </div>
                </div>
            </div>) : (
            <div className='story-preview'>
                <div style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <h3>Preview</h3>
                    <div onClick={() => {setSelectedFile(null); setProgress(1)}}>
                        <AiFillCloseCircle style={{fontSize:"28px"}}/>
                    </div>
                </div>
                <div className='preview-content'>
                    <div style={{width:"25em", height:"92.5%", backgroundSize: 'cover' , backgroundPosition: 'center', borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center"}}>
                     <video
                    key={selectedFile ? selectedFile.name : "no-video"}
                    autoPlay
                    onEnded={(event) => {
                        const video = event.currentTarget;
                        video.currentTime = 0;
                        video.play();
                    }}
                    style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover" }}
                >
                        <source src={videoPreviewUrl} type={selectedFile.type} />
                    </video>

                    </div>
                </div>
            </div>
        )}  
        </div>
        <LoadingIndicator loading={loading} />
      </div>)
    )
}

export default CreateReel
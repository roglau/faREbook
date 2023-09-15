import React, {useState, useRef, useEffect} from 'react'
import '../index.css'
import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '../provider/UserProvider';
import LoadingIndicator from '../components/LoadingIndicator';
import { AiFillFileImage, AiFillSetting } from 'react-icons/ai';
import {PiTextAaBold} from 'react-icons/pi'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMutation } from '@apollo/client';
import { CREATE_STORY } from '../query/query';
import Axios from 'axios';
import NavbarNoBg from '../components/NavbarNoBg';

const CreateStory = () => {

  const data = getUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

  const[creating, setCreating] = useState(false);
  const[imageStory, setImageStory] = useState(false);
  const[textStory, setTextStory] = useState(false);

  const[selectedFile, setSelectedFile] = useState<any>();
  const[storyText, setStoryText] = useState("");

  const [selectedColor, setSelectedColor] = useState('#00ffff'); // Default color

  const[createStory] = useMutation(CREATE_STORY)

  const colorOptions = [
    '#00ffff', '#00ff00', '#0000ff', '#ffff00', '#ff0000', '#ff00ff',
    '#800000', '#008000', '#000080', '#808000', '#008080', '#800080',
    '#ff8c00', '#00ff8c', '#8c00ff', '#ffc000', '#00ffc0', '#c000ff',
    '#ff6347', '#7fffd4', '#9370db', '#32cd32', '#d2691e', '#ba55d3'
  ];

  const handleColorChange = (color : any) => {
    setSelectedColor(color);
    // You can use this color to apply to your component's background or wherever needed
  };

  useEffect(() => {
    if(!data){
      setLoading(true)
    }
    if(data){
      setLoading(false)
    }
  }, [data])

  const handleImageStory = () => {
    setCreating(true)
    setImageStory(true)
  }

  const handleTextStory = () => {
    setCreating(true)
    setTextStory(true)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setSelectedFile(selectedFile)
      handleImageStory()
    }
  };

  const handleDiscard = () => {
    setCreating(false)
    setTextStory(false)
    setImageStory(false)
    setSelectedFile(undefined)
    setSelectedColor('#00ffff')
    setStoryText("")
  }

  const handlePostText = async() => {

    const inputStory = {
      userID : data.getUserWToken.id,
      image: "",
      text: storyText,
      bgColor: selectedColor
    }
    
    await createStory({
      variables : {
        inputStory: inputStory
      }
    }).then((response) => {
      console.log(response);
      navigate('/')
    })

  }

  const handlePostImage = async() => {

    let mediaUrl

    setLoading(true)
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', 'ete7d3zg');
  
    let apiUrl = 'https://api.cloudinary.com/v1_1/diuzx0kak/';
    if (selectedFile.type.includes('image')) {
      apiUrl += 'image/upload';
    }
  
    try {
      const response = await Axios.post(apiUrl, formData);
      const secureUrl = response.data.secure_url;
      mediaUrl = secureUrl
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    const inputStory = {
      userID : data.getUserWToken.id,
      image: mediaUrl,
      text: storyText,
      bgColor: ""
    }

    
    await createStory({
      variables : {
        inputStory: inputStory
      }
    }).then((response) => {
      setLoading(false)
      navigate('/')
    })
  }
  

  return (
    data && (
    <div>
        <NavbarNoBg/>
        

      <div className='sidebar'>
        <div className='sidebar-content'>
            <div style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px var(--shadow-color) solid", paddingBottom:"1.5em"}}>
                <h1>Your Story</h1>
                <AiFillSetting className="nav-icon"/>
            </div>
            
            <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", borderBottom:"1px var(--shadow-color) solid", paddingBottom:"1.5em"}}>
                <img
                    src={data.getUserWToken.profile}
                    alt='Profile'
                    style={{width:"3em"}}
                    />
                {data && (<p style={{fontSize:"20px"}}>{data.getUserWToken.firstname + " " + data.getUserWToken.surname}</p>)}
            </div>

            {textStory && (
            <div style={{width:"100%", height:"100%", display:"flex", flexDirection:"column", gap:"1.5em"}}>
            <ReactQuill className='postText' theme="snow" value={storyText} onChange={setStoryText} placeholder="Start Typing"/>

            <div className='story-bgpicker'>
                Background Color
                <div className='colors-container'>
                {colorOptions.map((color, index) => (
                <div
                    key={index}
                    className={`color-option ${selectedColor === color ? 'selected-color' : ''}`}
                    style={{ backgroundColor: color, width: "1.5em", height: "1.5em", borderRadius: "50%" }}
                    onClick={() => handleColorChange(color)}
                ></div>
                ))}

                </div> 
            </div>

            <div className='story-actions-container'>
                <div style={{backgroundColor:"var(--text-bg-color)",width:"30%", display:"flex", justifyContent:"center", padding:"0.5em", borderRadius:"10px"}} onClick={handleDiscard}>
                    <p>Discard</p>
                </div>
                <div style={{backgroundColor:"rgb(7, 123, 205)",width:"50%", display:"flex", justifyContent:"center", padding:"0.5em", borderRadius:"10px"}} onClick={handlePostText}>
                    <p>Post to Story</p>
                </div>
            </div>
            </div>
            )}

          {imageStory && (
            <div style={{width:"100%", display:"flex", flexDirection:"column", gap:"1.5em"}}>
            <ReactQuill className='postText' theme="snow" value={storyText} onChange={setStoryText} placeholder="Start Typing"/>


            <div className='story-actions-container'>
                <div style={{backgroundColor:"var(--text-bg-color)",width:"30%", display:"flex", justifyContent:"center", padding:"0.5em", borderRadius:"10px"}} onClick={handleDiscard}>
                    <p>Discard</p>
                </div>
                <div style={{backgroundColor:"rgb(7, 123, 205)",width:"50%", display:"flex", justifyContent:"center", padding:"0.5em", borderRadius:"10px"}} onClick={handlePostImage}>
                    <p>Post to Story</p>
                </div>
            </div>
            </div>
            )}
            
        </div>

      </div>
      {!creating ? (<div className='story-container'>
        <input
              type="file"
              style={{ display: "none" }}
              accept="image/*"
              id='imgInput'
              onChange={handleFileChange}
            />
       

        <label htmlFor="imgInput" style={{width:"15em", height:"25em", background:"linear-gradient(180deg, #654fe3, #7b87eb, #9bcbf6)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"0.5em", borderRadius:"10px"}}>
          <AiFillFileImage className="nav-icon"/>
          <h4>Image Story</h4>
        </label>

        <div style={{width:"15em", height:"25em", background:"linear-gradient(180deg, #a158d3, #bf64b6, #d46489)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"0.5em", borderRadius:"10px"}} onClick={handleTextStory}>
            <PiTextAaBold className="nav-icon"/>
            <h4>Text Story</h4>
        </div>
      </div>) : 
        (
            <div className='story-container'>
              {!selectedFile ? (
              <div className='story-preview'>
                <h3>Preview</h3>
                <div className='preview-content'>
                    <div style={{width:"25em", height:"92.5%", backgroundColor:selectedColor, borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center"}}>
                        {storyText.length > 0 ? (
                            <div>
                               <h4 dangerouslySetInnerHTML = {{ __html: storyText}}/>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{opacity:"50%"}}>Start Typing</h4>
                            </div>
                        )}
                    </div>
                </div>
              </div>) : (
              <div className='story-preview'>
                <h3>Preview</h3>
                <div className='preview-content'>
                    <div style={{width:"25em", height:"92.5%",backgroundImage: `url(${URL.createObjectURL(selectedFile)})`, backgroundSize: 'cover' , backgroundPosition: 'center', borderRadius:"10px", display:"flex", justifyContent:"center", alignItems:"center"}}>
                        {storyText.length > 0 ? (
                            <div>
                               <h4 dangerouslySetInnerHTML = {{ __html: storyText}}/>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{opacity:"50%"}}>Start Typing</h4>
                            </div>
                        )}
                    </div>
                </div>
              </div>
              )}  
            </div>
        )
      }

      <LoadingIndicator loading={loading} />
    </div>)
  )
}

export default CreateStory
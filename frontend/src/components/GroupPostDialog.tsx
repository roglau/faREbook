import React, { useEffect, useState } from 'react';
import './PostDialog.css'; // Import your CSS file for styling
import {AiFillFileImage, AiOutlineDelete} from 'react-icons/ai';
import {BsPersonFillAdd} from 'react-icons/bs';
import CustomSnackbar from './CustomSnackbar';
import { useMutation } from '@apollo/client';
import { CREATE_GROUP_POST, INSERT_POST } from '../query/query';
import Axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingIndicator from './LoadingIndicator';

interface GroupPostDialogProps {
  onClose: () => void;
  open: boolean;
  disableBackdropClick: boolean;
  profile :string;
  name : string;
  userId : string;
  groupId : string;
  refetch: any;
}

const GroupPostDialog: React.FC<GroupPostDialogProps> = ({ onClose, open, disableBackdropClick, profile, name, userId,groupId, refetch}) => {
  if (!open) return null;

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const [selectedFiles, setSelectedFiles] = useState<any>([]);

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    console.log(selectedFiles)
  },[selectedFiles])

  const [contentText, setContentText] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  const [createPost] = useMutation(CREATE_GROUP_POST)

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

  const placeholder = 'What\s on your mind? ' + name;

  const [showFileInput, setShowFileInput] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [privacy, setPrivacy] = useState<string>('public');

  const nextSlide = async () => {
    await setCurrentSlide((prevSlide) => (prevSlide + 1) % selectedFiles.length);
  };

  const prevSlide = async () => {
    await setCurrentSlide((prevSlide) => (prevSlide - 1 + selectedFiles.length) % selectedFiles.length);
  };

  useEffect(() => {
    console.log(currentSlide)
  },[currentSlide])

  const handleDeleteFile = async (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    if(index === 0){
      await setCurrentSlide(0)
    }else
      await setCurrentSlide((prevSlide) => (prevSlide - 1) % selectedFiles.length);
    console.log(updatedFiles)
    setSelectedFiles(updatedFiles);
  };

  const handlePost = async () => {

    if(contentText.length < 1){
      setErrorMessage("Content text must be filled");
      setErrorOpen(true)
      return
    }

    setErrorOpen(false)
    setLoading(true)

    const inputPost = {
      userID : userId,
      groupID: groupId,
      content : contentText,
    }

    console.log(inputPost)

    let mediaUrls: string[] = []

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

    console.log(mediaUrls)
    
    await createPost({
      variables : {
        inputPost : inputPost,
        medias : mediaUrls,
      }
    }).then((response) => {
      console.log(response)
      setSelectedFiles([])
      setContentText("")
      
      refetch().then(() => {
        setLoading(false)
        onClose()
      })
    }).catch((error) => {
      setErrorMessage(error.message)
      setErrorOpen(true)
    })

    
  }

  return (
    <div className="post-dialog-overlay" onClick={handleClickOutside}>
      <div className="post-dialog-content">
        <button className='close-button' onClick={onClose}>X</button>
        
        <h3>Create post</h3>
       
        <hr />
        <div className='groupD-profile-con'>
            <img src={profile} alt="" className='profile-icon' />
            <p>{name}</p>
            
        </div>

        <ReactQuill className='postText' theme="snow" value={contentText} onChange={setContentText} placeholder={placeholder}/>

        {showFileInput && ( // Show file input when showFileInput is true
          <div className="file-input-container">
          <input
            type="file"
            className="file-input"
            id="fileInput"
            accept=".jpg, .jpeg, .png, .gif, .bmp, .webp, .mp4, .mov, .avi, .flv, .mkv, .webm"
            multiple
            onChange={handleFileInputChange}
          />
          <label
            htmlFor="fileInput"
            className="drag-drop-area"
          >
            Choose a photo/videos
          </label>
        </div>
        )}

        { selectedFiles.length > 0 && (
          <div className="file-carousel">
          <div className="carousel-nav">
            <button onClick={prevSlide}>&#9664;</button>
            <button onClick={nextSlide}>&#9654;</button>
          </div>
          {selectedFiles.map((file: any, index: number) => (
             <div className={`carousel-slide ${index === currentSlide ? 'active' : ''}`} key={index}>
             {file.type.includes('image') ? (
               <div className='carousel-img'>
                 <img src={URL.createObjectURL(file)} alt={`Slide ${index}`} />
                 
               </div>
             ) : (
               <div className='carousel-vid'>
                 <video controls>
                   <source src={URL.createObjectURL(file)} type={file.type} />
                 </video>
               </div>
             )}
             <AiOutlineDelete
                style={{position:"absolute", right:"1em", top : "0"}}
                onClick={() => handleDeleteFile(index)}
                />
           </div>
          ))}
        </div>
        )

        }

        

        <div className='other-item-con'>
          <p>Add to your post</p>
          <div className='icons-con'>
            <AiFillFileImage className='icons' onClick={() => setShowFileInput(!showFileInput)}  />
            <BsPersonFillAdd className = 'icons' />
          </div>
        </div>

        

        <button onClick={handlePost}>Post</button>
      </div>
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      <LoadingIndicator loading={loading} />
    </div>

  );
};

export default GroupPostDialog;

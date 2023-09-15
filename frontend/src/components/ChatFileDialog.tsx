import React, { useEffect, useState } from 'react';
import './PostDialog.css'; // Import your CSS file for styling
import {AiFillFileImage, AiOutlineDelete} from 'react-icons/ai';
import {BsPersonFillAdd} from 'react-icons/bs';
import CustomSnackbar from './CustomSnackbar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingIndicator from './LoadingIndicator';

interface ChatFileDialogProps {
  onClose: () => void;
  open: boolean;
  disableBackdropClick: boolean;
  selectedFiles : any;
  setSelectedFiles : any;
  onChange: any;
}

const ChatFileDialog: React.FC<ChatFileDialogProps> = ({ onClose, open, disableBackdropClick, selectedFiles,setSelectedFiles, onChange}) => {
  if (!open) return null;

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

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


  const [currentSlide, setCurrentSlide] = useState(0);

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
    // Make a copy of the selectedFiles array
    const updatedFiles = [...selectedFiles];

    // Remove the file at the specified index
    updatedFiles.splice(index, 1);
    console.log(index, updatedFiles)

    // Update the selectedFiles state with the modified array
    setSelectedFiles(updatedFiles);

    // Update the current slide index if necessary
    if (index <= currentSlide) {
      setCurrentSlide((prevSlide) => Math.max(0, prevSlide - 1));
    }
  };

  return (
    <div className="post-dialog-overlay" onClick={handleClickOutside}>
      <div className="post-dialog-content">
        <button className='close-button' onClick={onClose}>X</button>
        
        <h3>Send File</h3>
       
        <hr />

        <div className="file-input-container">
          <input
            type="file"
            className="file-input"
            id="fileInput"
            accept=".jpg, .jpeg, .png, .gif, .bmp, .webp, .mp4, .mov, .avi, .flv, .mkv, .webm"
            multiple
            onChange={(e) => onChange(e)}
          />
          <label
            htmlFor="fileInput"
            className="drag-drop-area"
          >
            Choose a photo/videos
          </label>
        </div>
        

        { selectedFiles.length > 0 && (
          <div className="file-carousel">
          <div className="carousel-nav">
           { selectedFiles.length > 1 && ( <>
           <button onClick={prevSlide}>&#9664;</button>
            <button onClick={nextSlide}>&#9654;</button>
            </>)}
          </div>
          {selectedFiles.map((file: any, index: number) => (
             <div className={`carousel-slide ${index === currentSlide ? 'active' : ''}`} key={index}>
             {file.type.includes('image') ? (
               <div className='carousel-img' style={{position:"relative"}}>
                 <img src={URL.createObjectURL(file)} alt={`Slide ${index}`} />
                 <AiOutlineDelete
                   style={{position:"absolute", right:"1em", top : "0"}}
                   onClick={() => handleDeleteFile(index)}
                 />
               </div>
             ) : (
               <div className='carousel-vid' style={{position:"relative"}}>
                 <video controls>
                   <source src={URL.createObjectURL(file)} type={file.type} />
                 </video>
                <AiOutlineDelete
                style={{position:"absolute", right:"1em", top : "0"}}
                onClick={() => handleDeleteFile(index)}
                />
               </div>
             )}
             
           </div>
          ))}
        </div>
        )

        }

        
      </div>
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      <LoadingIndicator loading={loading} />
    </div>

  );
};

export default ChatFileDialog;

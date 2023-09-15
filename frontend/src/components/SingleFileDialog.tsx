import React, { useEffect, useState } from 'react';
import './PostDialog.css'; // Import your CSS file for styling
import {AiFillFileImage, AiOutlineDelete} from 'react-icons/ai';
import {BsPersonFillAdd} from 'react-icons/bs';
import CustomSnackbar from './CustomSnackbar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingIndicator from './LoadingIndicator';
import Axios from 'axios';
import { useMutation } from '@apollo/client';
import { CREATE_GROUP_FILE } from '../query/query';

interface SingleFileDialogProps {
  onClose: () => void;
  open: boolean;
  disableBackdropClick: boolean;
  userID: any;
  groupID: any;
  refetch:any;
}

const SingleFileDialog: React.FC<SingleFileDialogProps> = ({ onClose, open, disableBackdropClick, userID, groupID, refetch}) => {
  if (!open) return null;

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<any>();
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  const handleFileChange = (e : any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selected = files[0];
      setSelectedFile(selected);
    }
  }
  console.log(selectedFile)

  const handleDeleteFile = async () => {
    setSelectedFile(null);
  };

  const [createGroupFiles] = useMutation(CREATE_GROUP_FILE)

  const handlePost = async () => {

    if( !selectedFile){
      setErrorMessage("File must be selected");
      setErrorOpen(true)
      return
    }

    setErrorOpen(false)
    setLoading(true)

    let mediaUrls

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', 'ete7d3zg');

    let apiUrl = 'https://api.cloudinary.com/v1_1/diuzx0kak/';

    if (selectedFile.type.includes('image')) {
        apiUrl += 'image/upload';
      } else if (selectedFile.type.includes('video')) {
        apiUrl += 'video/upload';
      } else {
        apiUrl += 'raw/upload';
      }
    
    try {
    const response = await Axios.post(apiUrl, formData);
    const secureUrl = response.data.secure_url;
    mediaUrls = secureUrl
    } catch (error) {
    console.error('Error uploading file:', error);
    }
    

    // console.log(mediaUrls)
    const fileName = selectedFile.name;
    const fileType = selectedFile.type;

    const inputFile = {
        userID : userID,
        groupID: groupID,
        name: fileName,
        type: fileType,
        url : mediaUrls
      }

    // console.log(inputFile);
    
    await createGroupFiles({
        variables : {
            inputFiles : inputFile
        }
    }).then(async (response) => {
        await refetch()
        setLoading(false)
        onClose()
    })

    
  }

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
            onChange={(e) => handleFileChange(e)}
          />
          <label
            htmlFor="fileInput"
            className="drag-drop-area"
          >
            Choose a file
          </label>
        </div>
        
        {selectedFile && (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", margin:"1em"}}>
          <h4>Selected File:</h4>
          <p style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{selectedFile.name}</p>
          <AiOutlineDelete onClick={handleDeleteFile} />
        </div>
      )}

        <button onClick={handlePost}>Post</button>
      </div>
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      <LoadingIndicator loading={loading} />
    </div>

  );
};

export default SingleFileDialog;

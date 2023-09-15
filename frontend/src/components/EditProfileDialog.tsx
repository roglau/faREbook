import React, { useState } from 'react';
import './EditProfileDialog.css'; // Your CSS file for styling
import CustomSnackbar from './CustomSnackbar';

interface EditProfileDialogProps {
  onClose: () => void;
  onUpdateProfile: (newPicture: File | null) => void;
  picture: string; // Profile picture URL from the parent component
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ onClose, onUpdateProfile, picture }) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(picture);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPreviewUrl(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpdateProfile = () => {
    if(selectedFile){
        setErrorOpen(false);
        onUpdateProfile(selectedFile);
    }
    else{
        setErrorMessage("File must be selected")
        setErrorOpen(true)
    }
  };

  return (
    <div className="overlay">
      <div className="edit-dialog">
        <h2>Edit Profile Picture</h2>
        
        <input
          type="file"
          className="file-input"
          id="fileInput"
          accept="image/*"
          onChange={handleFileChange}
        />
        <label htmlFor="fileInput" className="edit-drag-drop-area">
          {selectedFile ? selectedFile.name : 'Select Profile Picture'}
        </label>
        
        {previewUrl && <img src={previewUrl} alt="Profile" className="current-profile-picture" />}

        <div className="buttons">
          <button className="save-button" style={{backgroundColor:"grey"}} onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleUpdateProfile}>
            Save
          </button>
        </div>
      </div>
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
    </div>
  );
};

export default EditProfileDialog;

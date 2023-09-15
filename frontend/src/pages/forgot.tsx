import { gql, useQuery } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomSnackbar from '../components/CustomSnackbar'
import emailjs from '@emailjs/browser';

const GET_USER_EMAIL = gql`
    query GetEmail($email:String!){
  getEmail(email:$email){
    id
    firstname
    surname
    email
    dob
    gender
  }
}
`

const Forgot = () => {
  const [email, setEmail] = useState("")
  const navigate = useNavigate()

  const { error, data, refetch} =  useQuery(GET_USER_EMAIL, {
    variables: { email },
  })

  const handleCancel = () => {
    navigate('/login')
  }

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleErrorClose = () => {
    setErrorOpen(false);
  };
  
  const sendEmail = async() => {

    const templateParams = {
      subject: "Reset faREbook Password" ,
      to_name: data.getEmail.firstname + " " +data.getEmail.surname,
      message: 'http://127.0.0.1:5173/reset/'+data.getEmail.id,
      to_email: data.getEmail.email,
      top_msg: "You can reset your password using link below"
    };

    // console.log(templateParams);

    await emailjs.send('service_rmkr2u6', 'template_38tkq5o', templateParams, 'hc8FC6vOV-zmI7wCP')
      .then((response) => {
        console.log('Email sent successfully:', response);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });
  };

  const handleSearch = async() => {
    refetch()
    if(error){  
        setErrorMessage("Email not found");
        setErrorOpen(true)
    }else if(data){
        setErrorOpen(false)
        console.log(data)
        sendEmail()
    }
  }

  return (
    <div className='form-container'>
        <div className='register-form'>
            <h2>Find Your Account</h2>
            <hr />
            <p className='find-p'>Please enter your email address to search for your account</p>
            <div className="form-">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}
            />
          </div>
          <div className='find-btn-group'>
            <button className='cancel' onClick={handleCancel}>Cancel</button>
            <button className='search' onClick={handleSearch}>Search</button>
          </div>
        </div>
          <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
    </div>
  )
}

export default Forgot
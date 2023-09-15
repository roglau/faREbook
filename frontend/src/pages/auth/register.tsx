import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import CustomSnackbar from '../../components/CustomSnackbar';
import Footer from '../../components/Footer';

const REGISTER_MUTATION = gql`
  mutation Create($inputUser:NewUser!){
  createUser(inputUser:$inputUser){
    id
    firstname
    surname
    email
    dob
    gender
  }
}
`;

const Register = () => {
  const [user, setUser] = useState<NewUser>({
    firstname: '',
    surname: '',
    email: '',
    dob: '',
    gender: '',
    password: '',
    activated: false
  });

  const [createUser] = useMutation(REGISTER_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.classList.add('input-focused');
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      e.target.classList.remove('input-focused');
    }
  };

  const sendEmail = async(id:any) => {

    const templateParams = {
      to_name: user.firstname + " " +user.surname,
      message: 'http://127.0.0.1:5173/activate/'+id,
      to_email: user.email
    };

    // console.log(templateParams);

    await emailjs.send('service_rmkr2u6', 'template_zipxd2i', templateParams, 'hc8FC6vOV-zmI7wCP')
      .then((response) => {
        console.log('Email sent successfully:', response);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });
  };

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    if(user.firstname.length < 1 || user.surname.length < 1 || user.email.length < 1 || user.dob.length < 1 || user.password.length < 1 || user.gender.length < 1){
      setErrorMessage("All field must be filled")
      setErrorOpen(true)
      return
    }

    setErrorOpen(false)

    try{
      createUser({
        variables: {
          inputUser: user,
        },
      }).then((response) => {
        console.log(response);
        sendEmail(response.data.createUser.id);
        
      })

      setUser({
        firstname: '',
        surname: '',
        email: '',
        dob: '',
        gender: '',
        password: '',
        activated: false
      })
    }catch(error) {
      console.log(error)
    }
    
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  return (
    <div>
    <div className='form-container'>
      <Link to="/">
        <img src="logofb.svg" alt="Facebook Logo" className="fblogo" />
      </Link>
      <div className="register-form">
        <h2>Register</h2>
          <div className="form-group">
            <div className="formg-left">
              <input
                type="text"
                name="firstname"
                placeholder="First Name"
                value={user.firstname}
                onChange={handleChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
            <div className="formg-right">
              <input
                type="text"
                name="surname"
                placeholder="Surname"
                value={user.surname}
                onChange={handleChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>
          <div className="form-">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={user.email}
              onChange={handleChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div className="form-">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={user.password}
              onChange={handleChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div className="form-">
            <input
              type="date"
              name="dob"
              placeholder="Date of Birth"
              value={user.dob}
              onChange={handleChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div className="form-">
            <select
              name="gender"
              value={user.gender}
              onChange={handleSelectChange}
            
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button className='regisbtn' onClick={handleSubmit}>Register</button>
          <a className='forgotten' href='/login'>Already have an account?</a>
      </div>
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
    </div>
    <Footer />
    </div>
    
  );
};

export default Register;

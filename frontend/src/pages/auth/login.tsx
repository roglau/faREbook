import React, { useState } from 'react'
import { useQuery, gql, useMutation } from '@apollo/client';
import { EncryptStorage } from 'encrypt-storage';
import { Link, useNavigate } from 'react-router-dom';
import CustomSnackbar from '../../components/CustomSnackbar';
import Footer from '../../components/Footer';

const GET_ALL_USERS = gql`
  query GetAllUser {
    getAllUser {
    id
    firstname
    surname
    email
    dob
    gender
    }
  }
`;

export const encryptStorage = new EncryptStorage('rogerganteng', {
  encAlgorithm: 'Rabbit',
});

const LOGIN_MUTATION = gql`
  mutation LoginUser($email: String!, $password: String!){
    loginUser(email: $email, password: $password)
  }
`;

const Login = () => {
  const [loginUser] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prevCredentials) => ({ ...prevCredentials, [name]: value }));
  };

  const handleRegis = (e : React.FormEvent) => {
    navigate('/register')
  }

  const handleSubmit = async(e: React.FormEvent) => {
    if(credentials.email.length < 1 || credentials.password.length < 1){
      setErrorMessage("All field must be filled")
      setErrorOpen(true)
      return
    }
    setErrorOpen(false)
    console.log(credentials)
    try{
      loginUser(
        {variables: {
          email: credentials.email,
          password: credentials.password
        }}
      ).then((response) => {
        if(response.data.loginUser !== 'Email and password is not valid'){
          setErrorOpen(false)
          encryptStorage.setItem("jwtToken", response.data.loginUser)
          navigate('/')
        }else{
          setErrorMessage(response.data.loginUser)
          setErrorOpen(true)
        }
      })
    }catch(err : any) {
      setErrorMessage(err.message)
      setErrorOpen(true)
      e.preventDefault();
    }
  };

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  return (
    <div>
    <div className='form-container'>
    <Link to="/">
        <img src="logofb.svg" alt="Facebook Logo" className="fblogo" />
      </Link>
    <div className="login-form">
      <h2>Login</h2>
      {/* <form onSubmit={handleSubmit} method='post'> */}
        <div className="form-group2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleChange}
            
          />
        </div>
        <div className="form-group2">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            
          />
        </div>
        <button className='loginbtn' onClick={handleSubmit}>Login</button>
        <a className='forgotten' href='/forgot'>Forgotten account?</a>
        <hr />
        <button className='regisbtn' onClick={handleRegis}>Create new account</button>
      {/* </form> */}
    </div>
    <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
    </div>
    <Footer />
    </div>
  );
}

export default Login
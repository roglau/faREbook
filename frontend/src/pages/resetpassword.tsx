import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CustomSnackbar from '../components/CustomSnackbar';

const UPDATEPASS_MUTATION = gql`
    mutation UpdatePassword($email: String!, $password: String!){
  updatePassword(email: $email, password: $password)
}
`;

const GET_USER = gql`
    query GetUser($id:ID!){
 getUser(id:$id){
    id
    firstname
    surname
    email
    dob
    gender
  }
}
`

const ResetPassword = () => {
  const navigate = useNavigate();
  const [updatePass] = useMutation(UPDATEPASS_MUTATION);

  const {userId} =  useParams();

  const {data} = useQuery(GET_USER, {
    variables: { id: userId},
  })

  useEffect(()=> {
    if(data)
    console.log(data.getUser.email)
  },[data])

  const[pass, setPass] = useState("")
  const[confPass, setConfPass] = useState("")

  const handleSubmit = async(e: React.FormEvent) => {
    console.log(data)
    if(pass.length < 1 || confPass.length < 1){
      setErrorMessage("All field must be filled")
      setErrorOpen(true)
      return
    }else if(pass !== confPass){
      setErrorMessage("Password must be the same with confirmation password")
      setErrorOpen(true)
      return
    }else if(pass === data.getUser.password){
      setErrorMessage("Password must not same with old password")
      setErrorOpen(true)
      return
    }
    setErrorOpen(false)
 
    updatePass(
        {variables: {
            email: data.getUser.email,
            password: pass
        }}
    ).then((response) => {
       if(response.data.updatePassword !== "Success"){
        setErrorMessage(response.data.updatePassword)
        setErrorOpen(true)
       }else{
           navigate('/login')
       }
    }).catch((err) => {
        console.log(err)
    })
  };

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  return (
    <div className='form-container'>
    <Link to="/">
        <img src="../logofb.svg" alt="Facebook Logo" className="fblogo" />
      </Link>
    <div className="login-form">
      <h2>Reset Password</h2>
        <div className="form-group2">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => {setPass(e.target.value)}}
            
          />
        </div>
        <div className="form-group2">
          <input
            type="password"
            name="confPassword"
            placeholder="Confirmation Password"
            value={confPass}
            onChange={(e) => {setConfPass(e.target.value)}}
            
          />
        </div>
        <button className='loginbtn' onClick={handleSubmit}>Change Password</button>
    </div>
    <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
    </div>
  );
}

export default ResetPassword
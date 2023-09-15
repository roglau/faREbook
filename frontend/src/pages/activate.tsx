import { gql, useMutation } from '@apollo/client';
import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';

const ACTIVATE_MUTATION = gql`
  mutation ActivateUser($id: ID!){
  activateUser(id: $id)
}
`;

const Activate = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activateUser] = useMutation(ACTIVATE_MUTATION);
  

  const handleActivate = async (e : any) => {
    try{
        await activateUser(
          {variables: {
            id: userId
          }}
        ).then((response) => {
          if(response.data.activateUser){
            navigate('/login')
          }
        })
      }catch(err) {
        console.log(err)
        e.preventDefault();
      }
  }
  
  return (
    <div className='form-container'>
      <div className='activate'>
        <Link to="/">
            <img src="../logofb.svg" alt="Facebook Logo" className="fblogo" />
        </Link>
        <h2>Activate Your Account Now</h2>
        <button className='activatebtn' onClick={handleActivate}>Activate</button>
      </div>
    </div>
  )
}

export default Activate
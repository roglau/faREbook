import React, { useEffect, useState } from 'react';
import './CommentDialog.css'; // Import your CSS file for styling
import {AiFillFileImage, AiOutlineDelete} from 'react-icons/ai';
import {BsPersonFillAdd} from 'react-icons/bs';
import CustomSnackbar from './CustomSnackbar';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_COMMENT, CREATE_LIKE_COMMENT, CREATE_REPLY_COMMENT, GET_ALL_POST, GET_ALL_POST_NORES, GET_GROUP_POST, GET_POST, INSERT_POST } from '../query/query';
import Axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import LoadingIndicator from './LoadingIndicator';
import { getUser } from '../provider/UserProvider';
import { formatDistanceToNow } from 'date-fns';
import { BiSolidShare } from 'react-icons/bi';


interface GroupCommentDialogProps {
  onClose: () => void;
  open: boolean;
  disableBackdropClick: boolean;
  forum : any;
  userId : string;
  refetchForum : any;
}

const GroupCommentDialog: React.FC<GroupCommentDialogProps> = ({ onClose, open, disableBackdropClick, forum, userId, refetchForum }) => {
  if (!open) return null;

  console.log(forum)

  const {data : newestForum, refetch: refetchNewest} = useQuery(GET_GROUP_POST, {
    variables : {
      postID : forum?.posts.id
    }
  })



  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
  if (!disableBackdropClick && event.target === event.currentTarget) {
    onClose();
  }
};

  const [createPostComment] = useMutation(CREATE_COMMENT)
  const [createLikeComment] = useMutation(CREATE_LIKE_COMMENT)
  const [createReplyComment] = useMutation(CREATE_REPLY_COMMENT)

  const [loading, setLoading] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [comment, setComment] = useState('');
  const [replyComment, setReplyComment] = useState('');

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const [selectedForum, setSelectedForum] = useState<any>()

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  const placeholder = 'Comment'

  const handlePost = async () => {

    if(comment.length < 1){
      setErrorMessage("Comment must be filled");
      setErrorOpen(true)
      return
    }

    setErrorOpen(false)
    // setLoading(true)

    const inputComment ={
      postID: forum.posts.id,
      userID: userId,
      comment: comment

    }

    console.log(inputComment)

    createPostComment({
      variables : {
        inputComment : inputComment,
      }
    }).then(async () => {
      // console.log(response)
      // refetchAllPost().then(async (response : any) => {
      //   // console.log(forum)
      //   response.data.getAllPost.map(async (comment : any) => {
      //     if(comment.posts.id === forum.posts.id){
      //       await setSelectedForum(comment)
      //     }
      //   })

      // })
      await refetchNewest()
      await refetchForum(forum?.posts?.id);
      setComment("")
      setLoading(false)
    }).catch((error) => {
      console.log(error)
      setErrorMessage(error.message)
      // setErrorOpen(true)
    })
    
  }

  const handleLikeComment = async (comment: any, likes: any) => {
    const l = await likes.some((user: any) => user.id === userId);
  
    const inputLikeComment = {
      commentID: comment.id,
      userID: userId,
      liked: l,
    };
  
    createLikeComment({
      variables: {
        inputLikeComment: inputLikeComment,
      },
    }).then(async () => {
        await refetchNewest()
        await refetchForum(forum?.posts?.id);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  

  const handleReplyComment = (comment : any) => {
    // console.log(comment.comment.id)
    setSelectedCommentId(comment.comment.id === selectedCommentId ? null : comment.comment.id)
  }

  const handlePostReply = async (comment : any) => {
    if(replyComment.length < 1){
      setErrorMessage("Reply comment must be filled")
      setErrorOpen(true)
      return
    }

    setErrorOpen(false)

    const inputReplyComment = {
      commentID : comment.comment.id,
      userID : userId,
      reply : replyComment
    }

    // console.log(inputReplyComment)

    createReplyComment({
      variables: {
        inputReplyComment: inputReplyComment,
      },
    }).then(async () => {
        await refetchNewest()
        await refetchForum(forum?.posts?.id);
        setReplyComment("")
      })
      .catch((err) => {
        console.log(err);
      });

  }

  useEffect(() => {
    setSelectedForum(forum)
  },[])

  useEffect(() => {
    // console.log(selectedForum, forum)
  },[selectedForum, forum])

  useEffect(() => {
    console.log(newestForum)
    if(newestForum)
      setSelectedForum(newestForum.getGroupPost)
  }, [newestForum])

  return (
    selectedForum && (<div className="custom-dialog-overlay" onClick={handleClickOutside}>
      <div className="custom-dialog-content">
        <button className='close-button' onClick={onClose}>X</button>
        
        <h3 style={{fontSize:"20px"}}> {selectedForum?.posts?.user.firstname + " "  + selectedForum?.posts?.user.surname+ "\'s Post"} </h3>
       
        <hr />

        {selectedForum?.comments?.length > 0 ? (
          <div className='comment-con'>
            {selectedForum.comments.map((comment : any, index : number) => (
              <div className='comment-item' key={index}>
                <img src={comment.comment.user.profile} alt="" className='profile-icon' />
                
                <div style={{width:"100%", padding:"0.3em"}}>
                  <div className='comment'>
                    <h4>{comment.comment.user.firstname + " " + comment.comment.user.surname}</h4>
                    <p style={{ fontSize: "18px" }} dangerouslySetInnerHTML = {{ __html: comment.comment.comment}}/>
                  </div>
                  <div className='comment-action'>
                      <h5 className={`${comment.likecomments.some((user : any) => user.id === userId) ? 'liked' : ''}`} 
                      onClick={() => handleLikeComment(comment.comment, comment.likecomments)}>Like{"     " +comment.likecomments.length + "     "}</h5>
                      <h5 onClick={() => handleReplyComment(comment)}>Reply{"     " +comment.replycomments.length + "     "}</h5>
                      <h5>{formatDistanceToNow(new Date(comment.comment.createdAt))} ago</h5>
                  </div>

                  {selectedCommentId == comment.comment.id && (
                  <div className='reply-con'>
                    <div style={{width:"100%", padding:"0.3em"}}>
                    {selectedCommentId === comment.comment.id && comment.replycomments.length > 0 && comment.replycomments.map((reply: any, index: number) => (
                      <div style={{display:"flex"}}>
                        <img src={reply.user.profile} alt='' className='profile-icon' />
                        <div style={{ width: '100%', padding: '0.3em' }}>
                          <div className='comment'>
                            <h4>{reply.user.firstname + ' ' + reply.user.surname}</h4>
                            <p style={{ fontSize: '18px' }} dangerouslySetInnerHTML={{ __html: reply.reply }} />
                          </div>
                          <div className='comment-action'>
                            <h5>{formatDistanceToNow(new Date(reply.createdAt))} ago</h5>
                          </div>
                        </div>
                      </div>
                    ))}
                      <div style={{display:"flex", alignItems:"center"}}>
                        <ReactQuill className='postText' theme="snow" value={replyComment} onChange={setReplyComment} placeholder={placeholder}/>
                        <div style={{cursor:"pointer"}} onClick={() => handlePostReply(comment)}>
                          <BiSolidShare className='count-icons'/>
                        </div>
                      </div>
                    </div>
                  </div>)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", height: "15em" }}>No Comment</div>
        )}


        <ReactQuill className='postText' theme="snow" value={comment} onChange={setComment} placeholder={placeholder}/>

        <button onClick={handlePost}>Post</button>
      </div>
      <CustomSnackbar open={errorOpen} message={errorMessage} onClose={handleErrorClose} />
      <LoadingIndicator loading={loading} />
    </div>)
  );
};

export default GroupCommentDialog;

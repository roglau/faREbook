import { gql } from "@apollo/client";

export const GET_USER_W_TOKEN = gql`
mutation GetUserWToken($token: String!){
getUserWToken(token: $token){
  id
  firstname
  surname
  email
  dob
  gender
  profile
}
}
`;

export const GET_USER_ID = gql`
  query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    firstname
    surname
    email
    dob
    gender
    profile
  }
}
`

export const GET_FRIEND_W_MUTUALS = gql`
query GetAllFriendWMutuals($userID: String!){
  getAllFriendWMutuals(userID: $userID){
    friend{
      id
      firstname
      surname
      profile
    }
    mutuals{
      id
      firstname
      surname
      profile
    }
  }
}` 

export const INSERT_POST= gql`
mutation CreatePost($inputPost:NewPost!, $medias:[String!]!){
  createPost(inputPost:$inputPost, medias:$medias){
    id
    userID
    content
    privacy
    createdAt
  }
}
`;

export const GET_ALL_POST = gql`
  query GetAllPost($offset: Int, $limit: Int) {
  getAllPost(offset: $offset, limit: $limit) {
    posts {
      id
      userID
      userName
      content
      privacy
      createdAt
      user {
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
		
  }
}
`

export const CREATE_LIKE_COMMENT = gql`
mutation CreateLikeComment($inputLikeComment: NewLikeComment!) {
  createLikeComment(inputLikeComment: $inputLikeComment) {
    id
    commentID
    userID
    liked
  }
}`

export const CREATE_REPLY_COMMENT = gql`
mutation CreateReplyComment($inputReplyComment: NewReplyComment!){
  createReplyComment(inputReplyComment: $inputReplyComment){
    id
    commentID
    userID
    reply
    user{
      firstname
      surname
      id
    }
  }
}`

export const GET_POST = gql `
query GetPost($id: ID!){
  getPost(id : $id){
    posts {
      id
      userID
      userName
      content
      privacy
      createdAt
      user {
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
		
  }
}`

export const GET_ALL_POST_USER = gql`
  query GetAllPostUser($id: ID!){
  getAllPostUser(userID: $id){
    posts {
      id
      userID
      userName
      content
      privacy
      createdAt
      user {
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
  }
}
`

export const GET_ALL_POST_NORES = gql`
query GetAllPostNoRes {
  getAllPostNoRes {
    posts {
      id
      userID
      userName
      content
      privacy
      createdAt
      user {
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        user{
          id
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
		
  }
}`

export const CREATE_LIKE = gql`
mutation CreatePostLike($inputLike: NewPostLike!){
  createPostLike(inputLike: $inputLike){
    userID
    postID
    liked
  }
}`

export const CREATE_COMMENT = gql`
mutation CreatePostComment($inputComment: NewPostComment!){
  createPostComment(inputComment: $inputComment){
    id
    postID
    userID
    comment
    user{
      firstname
      surname
    }
  }
}`

export const GET_ALL_STORY = gql`
query GetAllStory($userID: String!){
  getAllStory(userID: $userID){
    stories{
      id
      userID
      image
      text
      bgColor
      createdAt
    }
    user{
      id
      firstname
      surname
      profile
    }
  }
}`

export const CREATE_STORY = gql`
mutation CreateStory($inputStory: NewStory!){
  createStory(inputStory: $inputStory){
    id
    userID
    image
    text
    bgColor
    createdAt
  }
}
`

export const DELETE_POST = gql`
mutation DeletePost($postID: ID!){
  deletePost(id: $postID){
    id
    content
  }
}
`

export const GET_ALL_USER = gql`
query GetAllUser {
  getAllUser {
    id
    firstname
    surname
    email
    dob
    gender
  }
}`

export const GET_ALL_USERNAME = gql`
query GetAllUserName($name: String!, $userID:String!) {
  getAllUserName(name: $name, id:$userID) {
    user{
      id
      firstname
      surname
      profile
      gender
      dob
    }
    hasSentRequest
    hasFriendRequest
    isFriend
  }
}`

export const GET_ALL_POST_CONTENT = gql`
query GetAllPostContent($content: String!){
  getAllPostContent(content: $content){
    posts {
      id
      userID
      userName
      content
      privacy
      createdAt
      user {
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
  }
}`

export const GET_ALL_REQUESTS =  gql`
query GetAllRequest($targetID: ID!){
  getAllRequest(targetID: $targetID){
    requests{
      id
      requesterID
    	targetID
    }
    requester{
      user{
        id
        firstname
        surname
        profile
      }
      mutuals{
        id
        firstname
        surname
        profile
      }
    }
  }
}`

export const CREATE_REQUESTS = gql`
mutation CreateRequest($inputRequest: NewRequest!){
  createRequest(inputRequest: $inputRequest){
    id
    requesterID
    targetID
  }
}`

export const CREATE_FRIEND = gql`
mutation CreateFriend($inputFriend: NewFriend!){
  createFriend(inputFriend: $inputFriend){
    id
    userID
    friendID
  }
}`

export const DELETE_REQUEST = gql`
mutation DeleteRequest($reqID: ID!){
  deleteRequest(id: $reqID)
}`

export const DELETE_REQUEST_TARGET = gql`
mutation DeleteRequestTarget($reqID: ID!){
  deleteRequestTarget(id: $reqID)
}`

export const DELETE_REQUEST_REQUESTER = gql`
mutation DeleteRequestRequester($reqID: ID!){
  deleteRequestRequester(id: $reqID)
}`

export const GET_SUGGESTED_FRIENDS = gql`
query GetFriendSuggestions($userID: String!) {
  getFriendSuggestions(userID: $userID) {
    user{
      id
      firstname
      surname
      profile
    }
    mutuals{
      id
      firstname
      surname
      profile
    }
  	hasSentRequest
    hasFriendRequest
  }
}
`

export const CREATE_REELS = gql`
mutation CreateReels($inputReels: NewReels!) {
  createReels(inputReels: $inputReels) {
    id
    video
    text
    userID
  }
}`

export const GET_ALL_REELS_USER = gql`
query GetReelsUser($userID: String!){
  getAllReelsUser(userID:  $userID){
    reels {
      id
      video
      text
      userID
    }
    user {
      id
      firstname
      surname
      profile
    }
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
  }
}`

export const UPDATE_PROFILE = gql`
mutation UpdateProfile($id: String!, $profile: String!) {
  updateProfile(id: $id, profile: $profile) 
}`

export const GET_USER_W_REQUEST = gql`
query GetUserWRequest($userID: String!, $otherID: String!){
  getUserWRequest(userID: $userID, user2ID: $otherID){
    user{
      id
      firstname
      surname
      profile
      gender
      dob
      email
    }
    hasSentRequest
    hasFriendRequest
    isFriend
  }
}`

export const GET_ALL_REELS = gql`
query GetAllReels {
  getAllReels {
    reels {
      id
      video
      text
      userID
    }
    user {
      id
      firstname
      surname
      profile
    }
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
  }
}
`

export const GET_REELS = gql`
query GetReels($reelsID :ID!) {
  getReels(id: $reelsID) {
    reels {
      id
      video
      text
      userID
    }
    user {
      id
      firstname
      surname
      profile
    }
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
  }
}
`

export const GET_ALL_CONVERSATIONS = gql`
query GetAllConversations($userID: String!) {
  getAllConversation(userID: $userID) {
    conversation {
      id
      user1ID
      user2ID
      createdAt
    }
    messages {
      message{
        id
        conversationID
        senderID
        content
        createdAt
      }
      medias
    }
    interlocutor{
      id
      firstname
      surname
      profile
      gender
      dob
    }
    interlocutors{
      id
      firstname
      surname
      profile
      gender
      dob
    }
  }
}`

export const CREATE_MESSAGE = gql`
mutation CreateMessage($inputMessage: NewMessages!, $medias: [String!]!) {
  createMessage(inputMessage: $inputMessage, medias: $medias){
    id
    conversationID
    senderID
    content
    createdAt
    hasMedia
  }
}`

export const GET_ALL_FRIEND = gql`
query GetAllFriend($userID: String!){
  getAllFriend(userID: $userID){
    id
    firstname
    surname
    profile
  }
}`

export const CREATE_GROUP = gql`
  mutation CreateGroup($inputGroup: NewGroup!, $userID:String!, $invited: [String!]){
  createGroup(inputGroup: $inputGroup, userID:$userID, invited:$invited){
    id
    name
    privacy
  }
}
`

export const GET_ALL_INVITE = gql`
query GetAllInvite($userID: String!){
  getAllInvite(userID: $userID){
    group{
      id
      name
      privacy
    }
    admin{
      id
      firstname
      surname
      profile
    }
  }
}`

export const ACCEPT_INVITE = gql`
mutation AcceptInvite($groupID: String!, $invited:String!){
  acceptInvite(groupID:$groupID, invited:$invited)
}`

export const DELETE_INVITE = gql`
mutation DeleteInvite($groupID: String!, $invited:String!){
  deleteInvite(groupID:$groupID, invited:$invited)
}`

export const CREATE_CONVERSATION = gql`
mutation CreateConversation($inputConversation: NewConversations!) {
  createConversation(inputConversation: $inputConversation)
}
`

export const CREATE_NOTIF = gql`
mutation CreateNotification($inputNotif: NewNotification!){
  createNotif(inputNotif: $inputNotif){
    id
    userID
    user2ID
    notif
    createdAt
  }
}`

export const GET_ALL_NOTIF = gql`
query GetAllNotif($userID: String!){
  getAllNotif(userID: $userID){
    notifLists{
      notif{
      id
      userID
      notif
      createdAt
      }
      user2{
        profile
        firstname
        surname
        id
      }
    }
    notReadCount
  }
}`


export const GET_ALL_GROUP = gql`
query GetAllGroup($userID:String!){
  getAllGroup(userID:$userID){
    hasInvited
    hasJoinRequest
    isAdmin
    isMember
    group{
      id
      name
      privacy
      profile
    }
    admin{
      id
      firstname
      surname
      profile
    }
    members{
      id
      firstname
      surname
      profile
    }
    posts {
    	posts {
      id
      userID
      content
      createdAt
      user {
        firstname
        surname
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
    }
    files{
      files{
        id
        url
        name
        type
        groupID
        userID
        createdAt
      }
      uploader{
        id
        firstname
        surname
        profile
      }
    }
  }
}
`

export const GET_ALL_GROUP_USER = gql`
query GetAllGroupUser($userID: String!){
  getAllGroupUser(userID: $userID){
    isAdmin
    isMember
    group{
      id
      name
      privacy
      profile
    }
    admin{
      id
      firstname
      surname
      profile
    }
    members{
      id
      firstname
      surname
      profile
    }
    posts {
    	posts {
      id
      userID
      content
      createdAt
      user {
        firstname
        surname
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
    }
  }
}`

export const GET_GROUP = gql`
query GetGroup($groupID: String!, $userID:String!){
  getGroup(groupID: $groupID, userID:$userID){
    hasInvited
    hasJoinRequest
    isAdmin
    isMember
    group{
      id
      name
      privacy
      profile
    }
    admin{
      id
      firstname
      surname
      profile
    }
    members{
      id
      firstname
      surname
      profile
    }
    posts {
    	posts {
      id
      userID
      content
      createdAt
      user {
        firstname
        surname
        profile
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
    }
    files{
      files{
        id
        url
        name
        type
        groupID
        userID
        createdAt
      }
      uploader{
        id
        firstname
        surname
        profile
      }
    }
    joinRequest{
      id
      surname
      firstname
      profile
    }
  }
}`

export const CREATE_GROUP_POST = gql`
mutation CreateGroupPost($inputPost: NewGroupPost!, $medias:[String!]!){
  createGroupPost(inputPost:$inputPost, medias:$medias){
    id
    groupID
  }
}`

export const DELETE_GROUP_POST = gql`
mutation DeleteGroupPost($groupID: String!){
  deleteGroupPost(groupID:$groupID)
}`

export const GET_GROUP_POST = gql`
query GetGroupPost($postID: String!){
  getGroupPost(postID: $postID){
    posts {
      id
      userID
      content
      createdAt
      user {
        profile
        firstname
        surname
      }
    }
    medias
    comments {
      comment {
        comment
        id
        createdAt
        user {
          firstname
          surname
          profile
        }
      }
      likecomments{
        id
      }
      replycomments{
        id
        reply
        createdAt
        user{
          id
          profile
          firstname
          surname
        }
      }
      
      
    }
    likes {
      id
      firstname
      surname
    }
  }
}`

export const CREATE_GROUP_INVITED = gql`
mutation CreateGroupInvited($groupID: String!, $invited:String!){
  createGroupInvited(groupID:$groupID, invited:$invited){
    id
    groupID
    userID
  }
}`

export const GET_ALL_INVITES = gql`
query GetAllInvites($groupID: String!){
  getAllInvites(groupID:$groupID){
    id
    userID
    groupID
  }
}`

export const DELETE_JOIN = gql`
mutation DeleteJoin($groupID: String!, $userID:String!){
  deleteJoin(groupID:$groupID, userID:$userID)
}`

export const CREATE_JOIN = gql`
mutation CreateJoin($groupID: String!, $userID:String!){
  createGroupJoin(groupID: $groupID, userID:$userID){
    id
    userID
    groupID
  }
}`

export const CREATE_GROUP_FILE = gql`
mutation CreateGroupFiles($inputFiles: NewGroupFiles!){
  createGroupFiles(inputFiles: $inputFiles){
    groupID
    userID
    name
    type
    id
    url
  }
}`

export const DELETE_FILE = gql`
mutation DeleteGroupFiles($fileID: String!){
  deleteGroupFiles(fileID: $fileID)
}`


export const DELETE_MEMBER =  gql`
mutation DeleteMember($groupID: String!, $userID:String!){
	deleteMember(groupID: $groupID, memberID: $userID)
}`

export const PROMOTE_MEMBER = gql`
mutation PromoteMember($groupID: String!, $userID:String!){
  promoteMember(groupID: $groupID, memberID: $userID)
}`

export const ACCEPT_JOIN = gql`
mutation AcceptJoin($groupID: String!, $userID:String!){
  acceptJoin(groupID:$groupID, userID:$userID)
}`

export const DELETE_MEMBER_N_GROUP = gql`
mutation DeleteMemberNGroup($groupID: String!, $userID:String!){
  deleteMemberNGroup(groupID: $groupID, memberID: $userID)
}`

export const UPDATE_GROUP_PROFILE = gql`
mutation UpdateGroupProfile($groupID: String!, $profile: String!){
  updateGroupProfile(groupID: $groupID, profile: $profile)
}`
import React, {useState, useEffect} from 'react'
import '../index.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';
import { AiFillPlusCircle } from 'react-icons/ai';
import { getUser } from '../provider/UserProvider';
import { GET_ALL_STORY } from '../query/query';
import { useQuery } from '@apollo/client';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import NavbarNoBg from '../components/NavbarNoBg';

const Story = () => {
  const location = useLocation();
  const userId = location.state?.userId;  
  const data = getUser()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);

  const { data: stories, refetch:refetchStories } = useQuery(GET_ALL_STORY, {
    variables : {
      userID: data?.getUserWToken?.id
    }
  });
  const [userStory, setUserStory] = useState<any>() 
  const [othersStory, setOthersStory] = useState<any>()

  useEffect(() => {
    if(data){
        setLoading(false)
    }else{
        setLoading(true)
    }
  },[data])

  useEffect(() => {
    console.log(userStory, othersStory)
  },[userStory, othersStory])

  useEffect(() => {
    const fetchStories = async () => {
      await setUserStory(stories.getAllStory.filter((storyList: any) => {
        return storyList.user.id === data.getUserWToken.id;
     }))

     await setOthersStory(stories.getAllStory.filter((storyList: any) => {
      return storyList.user.id !== data.getUserWToken.id;
    }))

    }
    if(stories && stories.getAllStory && data.getUserWToken){
      fetchStories()
    }
  },[stories, data])

  const[selectedStories, setSelectedStories] = useState<any>() 
  const[currSlide, setCurrSlide] = useState<any>(0)

  useEffect(() => {

    const fetchStories = async () => {
      await setSelectedStories(stories.getAllStory.filter((storyList: any) => {
        return storyList.user.id === userId;
     }))
    }
    
    if(userId && !selectedStories){
      fetchStories()
    }
  },[data])

  useEffect(() => {
    if(!data){
      setLoading(true)
    }
    if(data){
      setLoading(false)    
    }
  }, [data])

  const handlePrevSlide = () => {
    if (currSlide > 0) {
      setCurrSlide(currSlide - 1);
    }
  };

  const handleNextSlide = () => {
    if (currSlide < selectedStories[0].stories.length - 1) {
      setCurrSlide(currSlide + 1);
    }else{
      setCurrSlide(0)
    }
  };

  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (selectedStories) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prevProgress => {
          if (prevProgress < 100) {
            return prevProgress + 1;
          } else {
            clearInterval(interval);
            handleNextSlide();
            return prevProgress; // Make sure to return the value here as well
          }
        });
      }, 50);
  
      return () => {
        clearInterval(interval);
      };
    }
  }, [currSlide, selectedStories]);
  
  const handleSetSelectedStories = async (userid : any) => {
    await setSelectedStories(stories.getAllStory.filter((storyList: any) => {
      return storyList.user.id === userid;
   }))
   setCurrSlide(0)
  }

  useEffect(() => {
    // console.log(loadingProgress)
  },[loadingProgress])
  return (
    data && (
    <div>
        <NavbarNoBg/>
        

      <div className='sidebar'>
        <div className='sidebar-content'>
            <div style={{width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"1.5em"}}>
                <h1>Story</h1>
            </div>
            
            {userStory?.length > 0 ? (<div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em", cursor:"pointer", position:"relative"}} onClick={() => handleSetSelectedStories(data?.getUserWToken?.id)}>
                <img
                    src={data.getUserWToken.profile}
                    alt='Profile'
                    style={{width:"3em"}}
                    />
                {data && (<p style={{fontSize:"20px"}}>{data.getUserWToken.firstname + " " + data.getUserWToken.surname}</p>)}
                <div onClick={() => {navigate('/createstory')}} style={{position:"absolute", right:"0"}}>
                  <AiFillPlusCircle className="nav-icon" style={{fontSize:"3em"}}/>
                </div>
            </div>) : (
              <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em", cursor:"pointer"}} onClick={() => navigate('/createstory')}>
                  <AiFillPlusCircle className="nav-icon" style={{fontSize:"3em"}}/>
                  <h3>Make Your Story</h3>
              </div>
            )}

            {othersStory && othersStory.map((story: any, index :number) => (
              <div style={{width:"100%", display:"flex", alignItems:"center", gap:"1em", paddingBottom:"1.5em", cursor:"pointer"}} onClick={() => handleSetSelectedStories(story.user.id)}>
                <img
                    src={story.user.profile === './defaultprofile.png' ? '../defaultprofile.png' : story.user.profile}
                    alt='Profile'
                    style={{width:"3em"}}
                    />
                <p style={{fontSize:"20px"}}>{story.user.firstname + " " + story.user.surname}</p>
              </div>
            ))}

            
            
        </div>

      </div>

      {selectedStories && (
        <div className='story-container'>
          <div className='story-preview'>
            
            <div className='preview-content'>
              
              {currSlide > 0 ? (
              <div onClick={handlePrevSlide} style={{ margin: '1em' }}>
                <FiChevronLeft style={{ width: '24px', height: '24px' }} />
              </div>
              ) : (
              <div style={{ margin: '1em', width: '24px', height: '24px' }}></div>
              )}
              <div
                style={{
                  width: '25em',
                  height: '92.5%',
                  backgroundColor: selectedStories[0].stories[currSlide].image
                    ? ''
                    : selectedStories[0].stories[currSlide].bgColor,
                  backgroundImage: selectedStories[0].stories[currSlide].image
                    ? `url(${selectedStories[0].stories[currSlide].image})`
                    : '',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position:"relative"
                }}
              >
                <div  style={{ width: "95%", height:"0.2em", background:"white", opacity:"20%", margin:"0.5em",position:"absolute", top:"0", left:"0" }}>
                  <div  style={{ width: `${loadingProgress}%`, height:"0.2em", background:"blue"}}/>
                </div>
                <div>
                  <h4 dangerouslySetInnerHTML={{ __html: selectedStories[0].stories[currSlide].text }} />
                </div>
              </div>
              {currSlide < selectedStories[0].stories.length - 1 ? (
                <div onClick={handleNextSlide} style={{ margin: '1em' }}>
                <FiChevronRight style={{ width: '24px', height: '24px' }} />
              </div>
              ) : (
                <div style={{ margin: '1em', width: '24px', height: '24px' }}></div>
              )}
            </div>
          </div>
        </div>
      )}
      <LoadingIndicator loading={loading} />
    </div>)
  )
}

export default Story
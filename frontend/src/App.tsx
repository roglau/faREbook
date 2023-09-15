import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/home';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import Activate from './pages/activate';
import Forgot from './pages/forgot';
import ResetPassword from './pages/resetpassword';
import { TokenProvider } from './context/TokenContext';
import AuthMiddleware from './middleware/AuthMiddleware';
import NonAuthMiddleware from './middleware/NonAuthMiddleware';
import Profile from './pages/user/profile';
import Story from './pages/story';
import CreateStory from './pages/createstory';
import Friend from './pages/friend';
import Search from './pages/search';
import Reel from './pages/reel';
import CreateReel from './pages/createreel';
import Chat from './pages/chat';
import Notification from './pages/notification';
import CreateGroup from './pages/creategroup';
import Group from './pages/group';
import GroupProfile from './pages/groupprofile';

function App() {

  return (
    <Router>
      {/* <div className="App"> */}
      <TokenProvider>
        <Header />
        <Routes>
          <Route path="/" element={ <AuthMiddleware><Home /></AuthMiddleware>} />
          <Route path="/login" element={<NonAuthMiddleware><Login /> </NonAuthMiddleware>} />
          <Route path="/register" element={<NonAuthMiddleware><Register /></NonAuthMiddleware>} />
          <Route path="/activate/:userId" element={<NonAuthMiddleware><Activate /> </NonAuthMiddleware>} />
          <Route path="/forgot" element={<NonAuthMiddleware> <Forgot /> </NonAuthMiddleware>} />
          <Route path="/reset/:userId" element={<NonAuthMiddleware><ResetPassword /></NonAuthMiddleware>} />
          <Route path="/profile" element={<AuthMiddleware><Profile /></AuthMiddleware>} />
          <Route path="/story/" element={<AuthMiddleware><Story /></AuthMiddleware>} />
          <Route path="/createstory" element={<AuthMiddleware><CreateStory /></AuthMiddleware>} />
          <Route path="/friend" element={<AuthMiddleware><Friend /></AuthMiddleware>} />
          <Route path="/reel" element={<AuthMiddleware><Reel /></AuthMiddleware>} />
          <Route path="/createreel" element={<AuthMiddleware><CreateReel /></AuthMiddleware>} />
          <Route path="/chat" element={<AuthMiddleware><Chat /></AuthMiddleware>} />
          <Route path="/notification" element={<AuthMiddleware><Notification /></AuthMiddleware>} />
          <Route path="/search/:search" element={<AuthMiddleware><Search /></AuthMiddleware>} />
          <Route path="/creategroup" element={<AuthMiddleware><CreateGroup /></AuthMiddleware>} />
          <Route path="/group" element={<AuthMiddleware><Group /></AuthMiddleware>} />
          <Route path="/groupprofile" element={<AuthMiddleware><GroupProfile /></AuthMiddleware>} />
        </Routes>
      </TokenProvider>
      {/* </div> */}
    </Router>
  );
}

export default App;

import { Profile } from './Profile.tsx';
import { Dashboard } from './Dashboard.tsx';

import { Routes, Route } from 'react-router-dom';
import { ErrorPage } from './components/Error.tsx';
import { LoginPage } from './LoginPage.tsx';
import { DashboardChats } from './DashboardChats.tsx';
import { Chat } from './Chat.tsx';
import { NavBar } from './NavBar.tsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/profile/:login" element={<Profile />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/chats" element={<DashboardChats />}/>
        <Route path="/chat/:title" element={<Chat />}/>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <NavBar />
    </>
  );
}

export default App

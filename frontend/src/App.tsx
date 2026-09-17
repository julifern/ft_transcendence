// import { InlineIcon } from '@iconify/react';

import { Profile } from './Profile.tsx';
import { Dashboard } from './Dashboard.tsx';

import { Routes, Route } from 'react-router-dom';
import { ErrorPage } from './components/Error.tsx';
import { LoginPage } from './LoginPage.tsx';
import { DashboardChats } from './DashboardChats.tsx';

function NavBar() {
  return (
    <>
      <div style={{display: "flex", justifyContent: "center"}}>
        <p>Nav Bar</p>
      </div>
    </>
  )
}

function App() {
  return (
    <>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/profile/:login" element={<Profile />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/chats" element={<DashboardChats />}/>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App

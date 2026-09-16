// import { Papicons } from '@getpapillon/papicons';
// import { InlineIcon } from '@iconify/react';

import { Profile } from './Profile.tsx';
import { Dashboard } from './Dashboard.tsx';

import { Routes, Route/*, redirect */} from 'react-router-dom';
import { ErrorPage } from './blueprint/Error.tsx';
import { LoginPage } from './LoginPage.tsx';
import { DashboardChats } from './DashboardChats.tsx';
import { Chat } from './Chat.tsx';

function NavBar() {
  return (
    <>
      <div style={{display: "flex", justifyContent: "center"}}>
        <p>Nav Bar</p>
      </div>
    </>
  )
}

// import {
//   QueryClient,
//   QueryClientProvider,
//   useQuery,
// } from '@tanstack/react-query'

// const queryClient = new QueryClient()

// function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Example />
//     </QueryClientProvider>
//   )
// }

// interface objTest {
//   userId: number;
//   id: number;
//   title: string;
//   completed: boolean;
// }

// function Test(lst: objTest) {
//   return (
//     <>
//       <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexFlow: "column", padding: "100px", backgroundColor: "rgba(0, 0, 0, 0.06)", borderRadius: "50px"}}>
//         <p>userId: {lst.userId}</p>
//         <p>id: {lst.id}</p>
//         <p>title: {lst.title}</p>
//         <p>completed: {lst.completed ? "YES" : "NO" }</p>
//       </div>
//     </>
//   )
// }

// function Example() {
//   const { isPending, error, data } = useQuery({queryKey: ["todo"], queryFn: () => fetch("https://jsonplaceholder.typicode.com/todos?_page=1&_limit=-1").then((res) => res.json())});

//   if (isPending)
//     return 'Loading...'

//   if (error)
//     return 'An error has occurred: ' + error.message

//   return (
//     <div style={{padding: "20px", display: "flex", gap: "20px", flexFlow: "column"}}>
//       {data.map(lst => <Test key={lst.id} {...lst}/>)}
//     </div>
//   )
// }

function App() {
  return (
    <>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/profile/:login" element={<Profile />} />
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/chats" element={<DashboardChats />}/>
        <Route path="/chat/:title" element={<Chat />}/>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App

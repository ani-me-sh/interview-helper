import {createBrowserRouter, Navigate} from 'react-router';
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Protected from './features/auth/components/Protected';
import GuestOnly from './features/auth/components/GuestOnly';
import Home from './features/interview/pages/Home';
import Interview from './features/interview/pages/Interview';

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <GuestOnly><Login/></GuestOnly>
    },
    {
        path: "/register",
        element: <GuestOnly><Register/></GuestOnly>
    },
    {
        path: "/",
        element: <Protected><Home/></Protected>
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview/></Protected>
    },
    {
        // unknown URLs: send to home (Protected then redirects to /login if signed out)
        path: "*",
        element: <Navigate to="/" replace/>
    },
])
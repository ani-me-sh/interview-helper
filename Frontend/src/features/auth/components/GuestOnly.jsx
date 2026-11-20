import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

// Wraps pages like /login and /register: already signed-in users are sent to the home page.
const GuestOnly = ({children}) => {
  const {user} = useAuth()

  if (user){
    return <Navigate to={'/'} replace/>
  }
  return children
}

export default GuestOnly

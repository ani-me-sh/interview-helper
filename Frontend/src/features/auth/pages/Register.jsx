import { useState } from 'react';
import { Link } from 'react-router';
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [username,setUsername] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const [error,setError] = useState("")

  const {loading,handleRegister} = useAuth()

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError("")
    const success = await handleRegister({username,email,password})
    // on success the GuestOnly wrapper redirects to the home page
    if (!success) setError("Registration failed. That email or username may already be in use.")
  }

  if (loading){
    return (
        <main><h1>Loading......</h1></main>
    )
  }

  return (
    <main>
        <div className="form-container">
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input value={username} onChange={(e)=>{setUsername(e.target.value)}} type="text" id="username" name="username" placeholder="Enter username"/>
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input value={email} onChange={(e)=>{setEmail(e.target.value)}} type="email" id="email" name="email" placeholder="Enter email address"/>
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input value={password} onChange={(e)=>{setPassword(e.target.value)}} type="password" id="password" name="password" placeholder="Enter password"/>
                </div>
                {error && <p role="alert" style={{color:"#ff4d4d"}}>{error}</p>}
                <button className="button primary-button">Register</button>
            </form>
            <p>Already have an account? <Link to={"/login"}>Login</Link></p>
        </div>
    </main>
  )
}

export default Register
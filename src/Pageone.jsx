import React from 'react'
import './Pageone.css'

function Pageone() {
  return (
    <>
    {/* วงกลม 4 มุม */}
    <div className="corner top-left"></div>
    <div className="corner top-right"></div>
    <div className="corner bottom-left"></div>
    <div className="corner bottom-right"></div>
        <div className='login-container'> 
          <div className='login-box'> 
           <div className='logo-container'> 
           <img src='https://upload.wikimedia.org/wikipedia/th/f/f5/%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%A1%E0%B8%AB%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%A5%E0%B8%B1%E0%B8%A2%E0%B8%AB%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B9%89%E0%B8%B2%E0%B9%84%E0%B8%97%E0%B8%A2.svg'></img>
             <span className="utcc-text"> UTCC</span>
             <span className="social-text">Social</span>
             </div>
    
    <form className='login-form'>
        <div className='form-group'>
          <input
                type='text'
                id = "Username"
                placeholder="Username / Email"
                className='form-control'
                />
        </div>
    
    <div className='form-group'>
         <input 
            type='password'
            id='passosword'
            placeholder="Password"
            className='form-control'
         />
    </div>

    <button type='submit' className='login-btn'>Login</button>
    </form>
    </div>
    </div>
    </>
  )
}

export default Pageone
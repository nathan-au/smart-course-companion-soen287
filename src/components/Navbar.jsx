import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <>
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <a className="btn btn-ghost text-xl">SCC</a>
            </div>
            <div className="navbar-center">
                <ul className="menu menu-horizontal px-1">
                    
                    <li><Link to="/signin">Sign In</Link></li>
                    <li><Link to="/signup">Sign Up</Link></li>
                </ul>
            </div>
            <div className="navbar-end">
                <input type="checkbox" value="dark" className="toggle theme-controller" />
            </div>
        </div>
       
    </>
  )
}

export default NavBar

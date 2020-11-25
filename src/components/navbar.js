const NavBar = () => {
    return (
        <div className="navbar">
            <div className="nav-logo">
              <img src={`${process.env.PUBLIC_URL}/favicon/android-icon-192x192.png`} style={{height: '30px', paddingRight: '5px'}} /><a href="index.html">US COVID ATLAS </a>
            </div>
          <ul> 
            <li><a href="data.html">DATA</a></li>
            <li><a href="api.html">API</a></li>
            <li><a href="methods.html">METHODS</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="about.html">INSIGHTS</a></li>
            <li><a href="about.html">ABOUT</a></li>
            <li><a href="contact.html">CONTACT</a></li>
          </ul>
        </div>
    )
}

export default NavBar
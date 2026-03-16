import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

function Layout({children}){

return(

<div className="layout">

<Navbar/>

<div className="main">

<Sidebar/>

<div className="content">

{children}

</div>

</div>

</div>

)

}

export default Layout

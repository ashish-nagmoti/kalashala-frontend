import { useState, useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { AuthContext } from "../context/AuthContext"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, userName, userType, isLoading, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    return location.pathname === path;
  }

  const handleLogout = async () => {
    if (await logout()) {
      navigate("/");
    }
  };

  // Get profile link based on user type
  const getProfileLink = () => {
    return userType === 'artist' ? '/portfolio' : '/profile';
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "Artisans", path: "/artists" },
    { name: "Schemes", path: "/schemes" },
    { name: "Courses", path: "/courses" },
  ];

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-bold text-xl">
              KalaShaala
            </Link>
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm hover:text-accent transition-colors ${isActive(link.path) ? "font-semibold" : ""}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-6 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl">
            KalaShaala
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm hover:text-accent transition-colors ${isActive(link.path) ? "font-semibold" : ""}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <div className="max-md:hidden flex gap-4 items-center transition-all">
              {isAuthenticated ? (
                <>
                  <Link to={getProfileLink()} className="text-sm font-medium">Hello, {userName}</Link>
                  {userType === 'artist' && (
                    <Link to="/content-create" className="btn-primary text-sm">
                      Create Content
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn-secondary text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary text-sm">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-secondary text-sm">
                    Signup
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden transition-all pt-4 pb-3 border-t mt-4">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm hover:text-accent transition-colors ${isActive(link.path) ? "font-semibold" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link to={getProfileLink()} className="text-sm font-medium">Hello, {userName}</Link>
                  {userType === 'artist' && (
                    <Link to="/content-create" className="btn-primary text-sm">
                      Create Content
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn-secondary text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary text-sm">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-secondary text-sm">
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar


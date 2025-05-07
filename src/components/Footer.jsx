import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">KalaRush</h3>
            <p className="text-sm text-gray-600 mb-4">
              Empowering artisans through technology, community, and resources.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="text-gray-600 hover:text-accent">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-accent">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-accent">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-accent">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-600 hover:text-accent">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-accent">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="text-sm text-gray-600 hover:text-accent">
                  Schemes
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-gray-600 hover:text-accent">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/artists" className="text-sm text-gray-600 hover:text-accent">
                  Artists
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/chatbot" className="text-sm text-gray-600 hover:text-accent">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/whatsapp-registration" className="text-sm text-gray-600 hover:text-accent">
                  WhatsApp Registration
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-accent">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-accent">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-accent">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <p className="text-sm text-gray-600 mb-2">Email: info@kalarush.com</p>
            <p className="text-sm text-gray-600 mb-2">Phone: +91 1234567890</p>
            <p className="text-sm text-gray-600">Address: 123 Artisan Street, Creative District, India</p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} KalaRush. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


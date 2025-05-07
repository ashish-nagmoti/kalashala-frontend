import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import LoadingSpinner from "./components/LoadingSpinner"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import BlogPostCreate from "./pages/BlogPostCreate"
import BlogPostDetail from "./pages/BlogPostDetail"
import VideoCreate from "./pages/VideoCreate"
import DocumentCreate from "./pages/DocumentCreate"
import ContentCreate from "./pages/ContentCreate"
import CoursePurchase from "./pages/CoursePurchase"
import CourseCreate from "./pages/CourseCreate"
import ModuleViewer from "./pages/ModuleViewer"
import ContentViewer from "./pages/ContentViewer"
import Portfolio from "./pages/Portfolio"
import Profile from "./pages/Profile"

const Home = lazy(() => import("./pages/Home"))
const Blog = lazy(() => import("./pages/Blog"))
const Schemes = lazy(() => import("./pages/Schemes"))
const Courses = lazy(() => import("./pages/Courses"))
const ArtistPortfolio = lazy(() => import("./pages/ArtistPortfolio"))
const ArtistsList = lazy(() => import("./pages/ArtistsList"))
const ChatBot = lazy(() => import("./pages/ChatBot"))
const WhatsappRegistration = lazy(() => import("./pages/WhatsappRegistration"))

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPostDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/schemes" element={<Schemes />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CoursePurchase />} />
              <Route path="/course-create" element={<CourseCreate />} />
              <Route path="/artists" element={<ArtistsList />} />
              <Route path="/artists/:id" element={<ArtistPortfolio />} />
              <Route path="/chatbot" element={<ChatBot />} />
              <Route path="/whatsapp-registration" element={<WhatsappRegistration />} />
              <Route path="/profile" element={<Profile />} />

              {/* Content creation routes */}
              <Route path="/content-create" element={<ContentCreate />} />
              <Route path="/create-blog" element={<BlogPostCreate />} />
              <Route path="/create-video" element={<VideoCreate />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/create-document" element={<DocumentCreate />} />

              {/* Module viewer route */}
              <Route path="/module-viewer/:moduleId" element={<ModuleViewer />} />
              
              {/* Content viewer route for standalone viewing */}
              <Route path="/content/:moduleId" element={<ContentViewer />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App


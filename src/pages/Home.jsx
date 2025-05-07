import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import SearchBar from "../components/SearchBar"

const Home = () => {
  const [featuredArtists, setFeaturedArtists] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [error, setError] = useState(null)
  const [coursesError, setCoursesError] = useState(null)
  const [csrfToken, setCsrfToken] = useState("")

  // Get CSRF token
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await fetch("http://localhost:8000/custom_auth/get-csrf-token/", {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (err) {
        console.error("Error fetching CSRF token:", err);
      }
    };

    getCsrfToken();
  }, []);

  // Fetch featured artists from the API
  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("http://localhost:8000/custom_auth/artists/", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch artists: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Get first 4 artists or fewer if there are less than 4
        setFeaturedArtists(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching artists:", error);
        setError("Failed to load featured artists");
      } finally {
        setLoading(false);
      }
    };

    if (csrfToken) {
      fetchArtists();
    }
  }, [csrfToken]);

  // Fetch courses from the API
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      setCoursesError(null);
      
      try {
        const response = await fetch("http://localhost:8000/blog/courses/", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Get first 4 courses or fewer if there are less than 4
        setCourses(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCoursesError("Failed to load courses");
      } finally {
        setCoursesLoading(false);
      }
    };

    if (csrfToken) {
      fetchCourses();
    }
  }, [csrfToken]);

  // Helper function to get featured image for artist
  const getArtistImage = (artist) => {
    // If artist has portfolio items with images, use the first one
    if (artist.portfolio_items && artist.portfolio_items.length > 0) {
      // Use placeholder for now, you'll implement real images later
      return "/placeholder.svg"; 
    }
    return "/placeholder.svg"; // Default placeholder
  };

  // Helper function to get course image
  const getCourseImage = (course) => {
    // If course has a thumbnail, properly format the URL
    if (course.thumbnail) {
      // Check if the thumbnail already starts with http:// or https://
      if (course.thumbnail.startsWith('http')) {
        return course.thumbnail;
      }
      // Check if the thumbnail already starts with /media
      if (course.thumbnail.startsWith('/media')) {
        return `http://localhost:8000${course.thumbnail}`;
      }
      // Otherwise assume it's a relative path that needs the full URL
      return `http://localhost:8000/media/${course.thumbnail}`;
    }
    return "/placeholder.svg?height=200&width=300"; // Default placeholder
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-16">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover and Support Indian Artisans</h1>
            <p className="text-lg mb-8">
              Explore traditional art forms, learn from master artisans, and discover government schemes to support your
              craft.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/artists" className="btn-primary">
                Explore Artists
              </Link>
              <Link to="/schemes" className="btn-secondary">
                Government Schemes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <SearchBar placeholder="Search for artists, courses, or schemes..." />
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="section-title">Featured Artists</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-600">{error}</div>
          ) : featuredArtists.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No artists found. Add some artists to showcase them here.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredArtists.map((artist) => (
                <Link to={`/artists/${artist.id}`} key={artist.id} className="card group">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getArtistImage(artist)}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{artist.name}</h3>
                    <p className="text-sm text-gray-600">
                      {artist.art_style || (artist.portfolio_items[0]?.category || "Artist")}
                    </p>
                    <div className="flex mt-2">
                      {/* Display tags from their portfolio or a preview of their work */}
                      {artist.portfolio_items.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {artist.portfolio_items.length} {artist.portfolio_items.length === 1 ? 'project' : 'projects'}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link to="/artists" className="btn-secondary">
              View All Artists
            </Link>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="section-title">Learn from Master Artisans</h2>
          {coursesLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : coursesError ? (
            <div className="text-center py-6 text-red-600">{coursesError}</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No courses found. Add some courses to showcase them here.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="card group">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={getCourseImage(course)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="flex items-center mt-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({course.rating_count})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">₹{course.price}</span>
                      <Link to={`/courses/${course.id}`} className="text-xs font-medium hover:underline">
                        Enroll
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/courses" className="btn-secondary">
              Browse All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp Integration */}
      <section className="py-12 bg-gray-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Access KalaShaala on WhatsApp</h2>
              <p className="mb-6">
                Register as an artist and access all your information directly through WhatsApp. Get updates on schemes,
                courses, and connect with buyers easily.
              </p>
              <Link to="/whatsapp-registration" className="btn-primary">
                Register Now
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png"
                alt="WhatsApp Integration"
                className="w-full max-w-[300px] rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Get Answers in Your Language</h2>
              <p className="mb-6">
                Our AI assistant can answer your questions about government schemes, courses, and more in multiple
                regional languages. Try voice commands too!
              </p>
              <Link to="/chatbot" className="btn-primary">
                Chat Now
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                alt="AI Chatbot"
                className="w-full max-w-[300px] rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home


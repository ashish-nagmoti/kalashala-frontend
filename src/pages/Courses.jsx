"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import { Play, Star, Plus } from "lucide-react"

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: "all",
    level: "all",
    priceRange: "all",
  })

  // Fetch real course data from backend
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching courses from API...")
        const response = await fetch("http://localhost:8000/blog/list/?content_type=course", {
          credentials: "include",
        })
        
        console.log("API Response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("API Response data:", data)
          
          // Ensure we handle both array responses and paginated responses
          const coursesArray = Array.isArray(data) ? data : (data.results || [])
          console.log("Courses array:", coursesArray)
          
          // Map API data to expected format
          const fetchedCourses = coursesArray.map(course => {
            console.log("Processing course:", course)
            // Correctly handle course_details
            let courseDetails = {};
            
            // In case course_details exists but may be array or object
            if (course.course_details) {
              courseDetails = Array.isArray(course.course_details) 
                ? course.course_details[0] || {} 
                : course.course_details;
            }
            
            return {
              id: course.id,
              title: course.title,
              description: course.description,
              instructor: course.contributor?.name || 'Anonymous',
              thumbnail: course.thumbnail 
                ? `http://localhost:8000/media/${course.thumbnail}` 
                : "/placeholder.svg?height=200&width=300",
              rating: 4.5, // Default rating if not available in API
              reviews: Math.floor(Math.random() * 100) + 10, // Default reviews count if not available
              price: parseFloat(courseDetails.price || 0),
              duration: courseDetails.duration || "Not specified",
              level: "All Levels", // Default level if not available in API
              category: course.category || "Uncategorized",
            }
          })
          
          console.log("Processed courses:", fetchedCourses)
          setAllCourses(fetchedCourses)
          setCourses(fetchedCourses)
        } else {
          console.error("Failed to fetch courses", response)
          setAllCourses([])
          setCourses([])
          setError("Failed to load courses. Please try again later.")
        }
      } catch (err) {
        console.error("Error fetching courses:", err)
        setAllCourses([])
        setCourses([])
        setError("Error connecting to server. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleSearch = (query) => {
    if (!query.trim()) {
      setCourses(allCourses)
      return
    }
    
    const filtered = allCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor.toLowerCase().includes(query.toLowerCase()) ||
        course.category.toLowerCase().includes(query.toLowerCase()),
    )
    setCourses(filtered)
  }

  const applyFilters = () => {
    let filtered = [...allCourses]

    if (filters.category !== "all") {
      filtered = filtered.filter((course) => course.category === filters.category)
    }

    if (filters.level !== "all") {
      filtered = filtered.filter((course) => course.level === filters.level)
    }

    if (filters.priceRange !== "all") {
      switch (filters.priceRange) {
        case "under1000":
          filtered = filtered.filter((course) => course.price < 1000)
          break
        case "1000to1500":
          filtered = filtered.filter((course) => course.price >= 1000 && course.price <= 1500)
          break
        case "over1500":
          filtered = filtered.filter((course) => course.price > 1500)
          break
        default:
          break
      }
    }

    setCourses(filtered)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetFilters = () => {
    setFilters({
      category: "all",
      level: "all",
      priceRange: "all",
    })
    setCourses(allCourses)
  }

  // Get unique categories and levels from actual data
  const categories = ["all", ...new Set(allCourses.map((course) => course.category))]
  const levels = ["all", ...new Set(allCourses.map((course) => course.level))]

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learn Skills From Top Artists</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enhance your craft with expert-led courses. Learn traditional techniques, modern approaches, and business
            skills to succeed as an artisan.
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="w-2/3">
            <SearchBar placeholder="Search for courses..." onSearch={handleSearch} />
          </div>
          <div>
            <Link to="/course-create" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Course
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <select
                    name="level"
                    value={filters.level}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {levels.map((level, index) => (
                      <option key={index} value={level}>
                        {level === "all" ? "All Levels" : level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price Range</label>
                  <select
                    name="priceRange"
                    value={filters.priceRange}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Prices</option>
                    <option value="under1000">Under ₹1,000</option>
                    <option value="1000to1500">₹1,000 - ₹1,500</option>
                    <option value="over1500">Over ₹1,500</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button onClick={applyFilters} className="btn-primary flex-1">
                    Apply
                  </button>
                  <button onClick={resetFilters} className="btn-secondary flex-1">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : error ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4">
                <p>{error}</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No courses found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="card group">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                          <Play className="w-5 h-5 text-black" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span>{course.level}</span>
                        <span className="mx-2">•</span>
                        <span>{course.duration}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">By {course.instructor}</p>
                      <div className="flex items-center mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.floor(course.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({course.reviews})</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default Courses


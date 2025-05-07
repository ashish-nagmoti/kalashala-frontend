import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Play, Star, Check, ChevronDown, ChevronUp, Clock, BookOpen, BarChart2, MessageSquare } from "lucide-react";

const CoursePurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  // Load course details and modules
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch course details
        console.log("Fetching course details for ID:", id);
        const response = await fetch(`http://localhost:8000/blog/detail/${id}/`, {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.status}`);
        }
        
        const courseData = await response.json();
        console.log("Course data:", courseData);
        
        // Prepare the course object
        const processedCourse = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          instructor: courseData.contributor?.name || 'Anonymous',
          instructorProfile: courseData.contributor?.bio || 'Expert Instructor',
          price: 1499, // Default price if not provided
          originalPrice: 2999, // Default original price if not provided
          duration: "6 weeks", // Default duration if not provided
          lessons: 0, // Will be updated with actual module count
          level: courseData.level || "All Levels",
          language: "Hindi, English",
          highlights: [
            "Live online sessions with the instructor",
            "Lifetime access to recorded sessions",
            "Personal feedback on your work",
            "Certificate upon completion",
            "Access to exclusive artisan community"
          ],
          image: courseData.thumbnail 
            ? `http://localhost:8000/media/${courseData.thumbnail}` 
            : "/placeholder.svg"
        };
        
        setCourse(processedCourse);
        
        // Fetch course modules
        try {
          console.log("Fetching modules for course ID:", id);
          const modulesResponse = await fetch(`http://localhost:8000/blog/course_modules/${id}/`, {
            credentials: "include",
          });
          
          if (modulesResponse.ok) {
            const modulesData = await modulesResponse.json();
            console.log("Modules data:", modulesData);
            
            // Process modules data
            const processedModules = Array.isArray(modulesData) 
              ? modulesData 
              : (modulesData.results || []);
            
            // Initialize expanded state for all modules
            const initialExpandedState = {};
            processedModules.forEach((module, index) => {
              initialExpandedState[index] = index === 0; // First module is expanded by default
            });
            
            setModules(processedModules);
            setExpandedModules(initialExpandedState);
            
            // Update lessons count based on modules
            processedCourse.lessons = processedModules.length;
          } else {
            console.error("Failed to fetch course modules:", modulesResponse.status);
            setModules([]);
          }
        } catch (moduleError) {
          console.error("Error fetching modules:", moduleError);
          setModules([]);
        }
      } catch (error) {
        console.error("Error in course details fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const toggleModuleExpand = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  // Function to navigate to module viewer
  const navigateToModuleView = (moduleId) => {
    if (moduleId) {
      navigate(`/module-viewer/${moduleId}`);
    }
  };

  // Function to start the course with the first module
  const startCourse = () => {
    if (modules.length > 0 && modules[0].id) {
      navigate(`/module-viewer/${modules[0].id}`);
    } else {
      alert("This course doesn't have any content yet.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <p className="mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Link to="/courses" className="btn-primary">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/courses" className="text-blue-600 hover:underline flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Courses
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
                  <div className="flex items-center mb-4">
                    <p className="text-gray-600">{course.instructor}</p>
                    <span className="mx-2 text-gray-400">•</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">(120)</span>
                    </div>
                  </div>
                  
                  <div className="aspect-video overflow-hidden rounded-md mb-6">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">About This Course</h2>
                    <p className="text-gray-700 mb-4">{course.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{course.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Lessons</p>
                        <p className="font-medium">{modules.length} modules</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="font-medium">{course.level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Language</p>
                        <p className="font-medium">{course.language}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Course Modules Section */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Course Content</h2>
                    
                    {modules.length === 0 ? (
                      <div className="bg-gray-50 p-4 rounded-md text-center">
                        <p className="text-gray-500">No modules are available for this course yet.</p>
                      </div>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        {modules.map((module, index) => (
                          <div key={module.id || index} className="border-b last:border-b-0">
                            <div 
                              className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                              onClick={() => toggleModuleExpand(index)}
                            >
                              <div className="flex items-center">
                                <span className="font-medium">{module.title || `Module ${index + 1}`}</span>
                              </div>
                              <button className="text-gray-500">
                                {expandedModules[index] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                            
                            {expandedModules[index] && (
                              <div className="p-4 bg-white">
                                <div className="text-sm text-gray-700 mb-3">
                                  {module.description || "No description available."}
                                </div>
                                
                                {/* Module content items - videos, documents, etc. */}
                                <div className="space-y-2">
                                  {module.content_type === 'video' && (
                                    <div 
                                      className="flex items-center p-2 border-l-2 border-blue-500 cursor-pointer hover:bg-gray-50"
                                      onClick={() => navigateToModuleView(module.id)}
                                    >
                                      <Play size={16} className="text-blue-500 mr-2" />
                                      <span className="text-sm">Watch Video - {module.title}</span>
                                    </div>
                                  )}
                                  
                                  {module.content_type === 'pdf' && (
                                    <div 
                                      className="flex items-center p-2 border-l-2 border-green-500 cursor-pointer hover:bg-gray-50"
                                      onClick={() => navigateToModuleView(module.id)}
                                    >
                                      <svg className="w-4 h-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm">View Document - {module.title}</span>
                                    </div>
                                  )}
                                  
                                  {module.content_type === 'blog' && (
                                    <div 
                                      className="flex items-center p-2 border-l-2 border-amber-500 cursor-pointer hover:bg-gray-50"
                                      onClick={() => navigateToModuleView(module.id)}
                                    >
                                      <svg className="w-4 h-4 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2h8v2H6V6zm0 3h8v2H6V9zm0 3h4v2H6v-2z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm">Read Article - {module.title}</span>
                                    </div>
                                  )}
                                  
                                  {/* Fallback if content type is not handled or no content */}
                                  {(!module.content_type || 
                                    (module.content_type === 'video' && !module.video_url && !module.video_file) ||
                                    (module.content_type === 'pdf' && !module.document_file) ||
                                    (module.content_type === 'blog' && !module.text_content)) && (
                                    <div className="flex items-center p-2 text-gray-500">
                                      <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm">Content not available yet</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-2">What You'll Get</h2>
                    <ul className="space-y-2">
                      {course.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Start Course Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Course Details</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-gray-600">{course.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <BookOpen className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Modules</p>
                        <p className="text-sm text-gray-600">{modules.length} lessons</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <BarChart2 className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Level</p>
                        <p className="text-sm text-gray-600">{course.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MessageSquare className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-gray-600">{course.language}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={startCourse}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
                    >
                      Start Learning
                    </button>
                    
                    <p className="mt-4 text-center text-sm text-gray-500">
                      All courses are free and available to everyone
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePurchase;
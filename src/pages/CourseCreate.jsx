import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Upload, Info } from "lucide-react";

const CourseCreate = () => {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    price: "0",
    is_free: false,
    duration: "",
    coverImage: null,
    coverImagePreview: ""
  });
  
  const [modules, setModules] = useState([
    {
      title: "",
      description: "",
      content_type: "blog",
      create_new: true,
      // Fields for new blog content
      blog_title: "",
      blog_description: "",
      text_content: "",
      summary: "",
      // Fields for new video content
      video_title: "",
      video_description: "",
      video_url: "",
      video_file: null,
      // Fields for new document content
      pdf_title: "",
      pdf_description: "",
      document_file: null,
      // Fields for existing content
      blog_post_id: "",
      video_id: "",
      document_id: ""
    }
  ]);
  
  const [existingContent, setExistingContent] = useState({
    blog: [],
    video: [],
    pdf: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();

  // Get CSRF token and fetch existing content when component mounts
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
        } else {
          console.error("Failed to fetch CSRF token");
        }
      } catch (err) {
        console.error("Error fetching CSRF token:", err);
      }
    };

    const fetchExistingContent = async () => {
      try {
        // Fetch existing blog posts
        const blogResponse = await fetch("http://localhost:8000/blog/list/?content_type=blog", {
          credentials: "include",
        });
        
        // Fetch existing videos
        const videoResponse = await fetch("http://localhost:8000/blog/list/?content_type=video", {
          credentials: "include",
        });
        
        // Fetch existing documents/PDFs
        const pdfResponse = await fetch("http://localhost:8000/blog/list/?content_type=pdf", {
          credentials: "include",
        });
        
        if (blogResponse.ok) {
          const data = await blogResponse.json();
          setExistingContent(prev => ({ ...prev, blog: data.results || [] }));
        }
        
        if (videoResponse.ok) {
          const data = await videoResponse.json();
          setExistingContent(prev => ({ ...prev, video: data.results || [] }));
        }
        
        if (pdfResponse.ok) {
          const data = await pdfResponse.json();
          setExistingContent(prev => ({ ...prev, pdf: data.results || [] }));
        }
      } catch (err) {
        console.error("Error fetching existing content:", err);
      }
    };

    getCsrfToken();
    fetchExistingContent();
  }, []);

  const handleCourseInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      }));
    }
  };
  
  const handleModuleInputChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setModules(prevModules => {
      const updatedModules = [...prevModules];
      updatedModules[index] = {
        ...updatedModules[index],
        [name]: type === "checkbox" ? checked : value
      };
      return updatedModules;
    });
  };
  
  const handleModuleFileChange = (index, e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setModules(prevModules => {
        const updatedModules = [...prevModules];
        updatedModules[index] = {
          ...updatedModules[index],
          [fileType]: file
        };
        return updatedModules;
      });
    }
  };
  
  const addModule = () => {
    setModules(prevModules => [
      ...prevModules,
      {
        title: "",
        description: "",
        content_type: "blog",
        create_new: true,
        blog_title: "",
        blog_description: "",
        text_content: "",
        summary: "",
        video_title: "",
        video_description: "",
        video_url: "",
        video_file: null,
        pdf_title: "",
        pdf_description: "",
        document_file: null,
        blog_post_id: "",
        video_id: "",
        document_id: ""
      }
    ]);
  };
  
  const removeModule = (index) => {
    if (modules.length > 1) {
      setModules(prevModules => prevModules.filter((_, i) => i !== index));
    } else {
      setError("You must have at least one module");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validate form
    if (!courseData.title || !courseData.description || !courseData.category) {
      setError("Please fill in all required course fields");
      return;
    }
    
    // Validate modules
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module.title) {
        setError(`Module ${i + 1} is missing a title`);
        return;
      }
      
      const contentType = module.content_type;
      if (module.create_new) {
        // Validate new content creation
        if (contentType === 'blog' && !module.text_content) {
          setError(`Module ${i + 1} is set to create a new blog but is missing content`);
          return;
        } else if (contentType === 'video' && !module.video_url && !module.video_file) {
          setError(`Module ${i + 1} is set to create a new video but is missing both URL and file`);
          return;
        } else if (contentType === 'pdf' && !module.document_file) {
          setError(`Module ${i + 1} is set to create a new document but is missing a file`);
          return;
        }
      } else {
        // Validate existing content selection
        if (contentType === 'blog' && !module.blog_post_id) {
          setError(`Module ${i + 1} requires selecting an existing blog post`);
          return;
        } else if (contentType === 'video' && !module.video_id && !module.video_url) {
          setError(`Module ${i + 1} requires selecting an existing video or providing a URL`);
          return;
        } else if (contentType === 'pdf' && !module.document_id) {
          setError(`Module ${i + 1} requires selecting an existing document`);
          return;
        }
      }
    }
    
    setIsLoading(true);
    
    // Create FormData for API submission
    const formData = new FormData();
    
    // Add course data
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("category", courseData.category);
    formData.append("tags", courseData.tags);
    formData.append("price", courseData.price);
    formData.append("is_free", courseData.is_free ? "true" : "false");
    formData.append("duration", courseData.duration);
    
    if (courseData.coverImage) {
      formData.append("thumbnail", courseData.coverImage);
    }
    
    // Convert modules data to JSON and include it
    const modulesForSubmission = modules.map((module, index) => {
      const moduleData = {
        title: module.title,
        description: module.description || "", // Ensure description is never undefined
        content_type: module.content_type,
        create_new: module.create_new
      };
      
      // Add properties based on content type and whether creating new or using existing
      if (module.create_new) {
        if (module.content_type === 'blog') {
          moduleData.blog_title = module.blog_title || module.title;
          moduleData.blog_description = module.blog_description || module.description || "";
          moduleData.text_content = module.text_content;
          moduleData.summary = module.summary || ""; // Ensure summary is never undefined
        } else if (module.content_type === 'video') {
          moduleData.video_title = module.video_title || module.title;
          moduleData.video_description = module.video_description || module.description || "";
          moduleData.video_url = module.video_url || ""; // Ensure video_url is never undefined
          // Note: video_file will be added to formData separately
        } else if (module.content_type === 'pdf') {
          moduleData.pdf_title = module.pdf_title || module.title;
          moduleData.pdf_description = module.pdf_description || module.description || "";
          // Note: document_file will be added to formData separately
        }
      } else {
        // Using existing content
        if (module.content_type === 'blog') {
          moduleData.blog_post_id = module.blog_post_id;
        } else if (module.content_type === 'video') {
          if (module.video_id) {
            moduleData.video_id = module.video_id;
          } else if (module.video_url) {
            moduleData.video_url = module.video_url;
          }
        } else if (module.content_type === 'pdf') {
          moduleData.document_id = module.document_id;
        }
      }
      
      return moduleData;
    });
    
    const modulesJson = JSON.stringify(modulesForSubmission);
    formData.append("modules", modulesJson);
    console.log("Modules JSON being sent:", modulesJson);
    
    // Add module files separately
    modules.forEach((module, index) => {
      if (module.create_new) {
        if (module.content_type === 'video' && module.video_file) {
          formData.append(`module_${index}_video_file`, module.video_file);
          console.log(`Adding video file for module ${index}`);
        } else if (module.content_type === 'pdf' && module.document_file) {
          formData.append(`module_${index}_document_file`, module.document_file);
          console.log(`Adding document file for module ${index}`);
        }
      }
    });
    
    // Log form data for debugging
    for (let pair of formData.entries()) {
      // Don't log the file contents, just the key
      if (pair[1] instanceof File) {
        console.log(pair[0], `[File: ${pair[1].name}, type: ${pair[1].type}, size: ${pair[1].size} bytes]`);
      } else {
        console.log(pair[0], pair[1]);
      }
    }
    
    try {
      console.log("Creating new course...");
      
      const response = await fetch("http://localhost:8000/blog/create/course/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken
        },
        credentials: "include",
        body: formData
      });
      
      // Check if the response is ok
      if (!response.ok) {
        let errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error("Error response:", errorData);
        } catch (e) {
          console.error("Raw error response:", errorText);
          errorData = { detail: errorText || "Unknown error occurred" };
        }
        
        throw new Error(errorData.detail || errorData.message || `Failed to create course: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Course created successfully:", data);
      
      setSuccess(true);
      
      // Clear form data
      setCourseData({
        title: "",
        description: "",
        category: "",
        tags: "",
        price: "0",
        is_free: false,
        duration: "",
        coverImage: null,
        coverImagePreview: ""
      });
      
      setModules([
        {
          title: "",
          description: "",
          content_type: "blog",
          create_new: true,
          blog_title: "",
          blog_description: "",
          text_content: "",
          summary: "",
          video_title: "",
          video_description: "",
          video_url: "",
          video_file: null,
          pdf_title: "",
          pdf_description: "",
          document_file: null,
          blog_post_id: "",
          video_id: "",
          document_id: ""
        }
      ]);
      
      // Redirect to courses page after a delay
      setTimeout(() => {
        navigate("/courses", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Error creating course:", err);
      setError(err.message || "An error occurred while creating the course. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
              
              {success && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">Your course was created successfully!</p>
                  <p>Redirecting to courses page...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Course Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={courseData.title}
                        onChange={handleCourseInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter course title"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={courseData.description}
                        onChange={handleCourseInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your course"
                        required
                      ></textarea>
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={courseData.category}
                        onChange={handleCourseInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="traditional_art">Traditional Art</option>
                        <option value="modern_techniques">Modern Techniques</option>
                        <option value="marketing_tips">Marketing Tips</option>
                        <option value="government_schemes">Government Schemes</option>
                        <option value="success_stories">Success Stories</option>
                        <option value="warli">Warli</option>
                        <option value="paithani_sarees">Paithani Sarees</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={courseData.tags}
                        onChange={handleCourseInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="pottery, techniques, beginners"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        min="0"
                        step="0.01"
                        value={courseData.price}
                        onChange={handleCourseInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-gray-700 font-medium mb-2">
                        Duration
                      </label>
                      <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={courseData.duration}
                        onChange={handleCourseInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 6 weeks, 10 hours"
                      />
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="is_free"
                        name="is_free"
                        checked={courseData.is_free}
                        onChange={handleCourseInputChange}
                        className="mr-2"
                      />
                      <label htmlFor="is_free" className="text-gray-700">
                        This is a free course
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Course Thumbnail (optional)
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded cursor-pointer hover:bg-blue-100">
                        <Upload size={20} className="mr-2" />
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                      {courseData.coverImagePreview && (
                        <div className="relative h-20 w-20">
                          <img
                            src={courseData.coverImagePreview}
                            alt="Course thumbnail"
                            className="h-full w-full object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Course Modules Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Course Modules</h3>
                    <button
                      type="button"
                      onClick={addModule}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Module
                    </button>
                  </div>
                  
                  {modules.map((module, index) => (
                    <div key={index} className="mb-8 border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Module {index + 1}</h4>
                        {modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModule(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Module Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={module.title}
                            onChange={(e) => handleModuleInputChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Content Type *
                          </label>
                          <select
                            name="content_type"
                            value={module.content_type}
                            onChange={(e) => handleModuleInputChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="blog">Blog Post</option>
                            <option value="video">Video</option>
                            <option value="pdf">Document/PDF</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Module Description
                        </label>
                        <textarea
                          name="description"
                          value={module.description}
                          onChange={(e) => handleModuleInputChange(index, e)}
                          rows="2"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`create_new_${index}`}
                            name="create_new"
                            checked={module.create_new}
                            onChange={(e) => handleModuleInputChange(index, e)}
                          />
                          <label htmlFor={`create_new_${index}`} className="text-sm font-medium">
                            Create new content for this module
                          </label>
                        </div>
                      </div>
                      
                      {/* Content-specific fields based on type and create_new */}
                      {module.create_new ? (
                        // New content form fields
                        <div className="border-t pt-4 mt-4">
                          {module.content_type === 'blog' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Blog Title (optional)
                                  </label>
                                  <input
                                    type="text"
                                    name="blog_title"
                                    value={module.blog_title}
                                    onChange={(e) => handleModuleInputChange(index, e)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Will use module title if not specified"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Blog Summary
                                  </label>
                                  <input
                                    type="text"
                                    name="summary"
                                    value={module.summary}
                                    onChange={(e) => handleModuleInputChange(index, e)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Blog Content *
                                </label>
                                <textarea
                                  name="text_content"
                                  value={module.text_content}
                                  onChange={(e) => handleModuleInputChange(index, e)}
                                  rows="6"
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  required={module.content_type === 'blog' && module.create_new}
                                ></textarea>
                              </div>
                            </div>
                          )}
                          
                          {module.content_type === 'video' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Video Title (optional)
                                  </label>
                                  <input
                                    type="text"
                                    name="video_title"
                                    value={module.video_title}
                                    onChange={(e) => handleModuleInputChange(index, e)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Will use module title if not specified"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Video File
                                </label>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleModuleFileChange(index, e, 'video_file')}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Or YouTube/External Video URL
                                </label>
                                <input
                                  type="url"
                                  name="video_url"
                                  value={module.video_url}
                                  onChange={(e) => handleModuleInputChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  placeholder="https://youtube.com/watch?v=..."
                                />
                              </div>
                            </div>
                          )}
                          
                          {module.content_type === 'pdf' && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Document Title (optional)
                                  </label>
                                  <input
                                    type="text"
                                    name="pdf_title"
                                    value={module.pdf_title}
                                    onChange={(e) => handleModuleInputChange(index, e)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Will use module title if not specified"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Document File (PDF) *
                                </label>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => handleModuleFileChange(index, e, 'document_file')}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  required={module.content_type === 'pdf' && module.create_new}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Existing content selection
                        <div className="border-t pt-4 mt-4">
                          {module.content_type === 'blog' && (
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Select Existing Blog Post *
                              </label>
                              <select
                                name="blog_post_id"
                                value={module.blog_post_id}
                                onChange={(e) => handleModuleInputChange(index, e)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required={module.content_type === 'blog' && !module.create_new}
                              >
                                <option value="">Select Blog Post</option>
                                {existingContent.blog.map((blog) => (
                                  <option key={blog.id} value={blog.id}>
                                    {blog.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          {module.content_type === 'video' && (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Select Existing Video
                                </label>
                                <select
                                  name="video_id"
                                  value={module.video_id}
                                  onChange={(e) => handleModuleInputChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                  <option value="">Select Video</option>
                                  {existingContent.video.map((video) => (
                                    <option key={video.id} value={video.id}>
                                      {video.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Or Provide External Video URL
                                </label>
                                <input
                                  type="url"
                                  name="video_url"
                                  value={module.video_url}
                                  onChange={(e) => handleModuleInputChange(index, e)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  placeholder="https://youtube.com/watch?v=..."
                                />
                              </div>
                            </div>
                          )}
                          
                          {module.content_type === 'pdf' && (
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Select Existing Document *
                              </label>
                              <select
                                name="document_id"
                                value={module.document_id}
                                onChange={(e) => handleModuleInputChange(index, e)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required={module.content_type === 'pdf' && !module.create_new}
                              >
                                <option value="">Select Document</option>
                                {existingContent.pdf.map((pdf) => (
                                  <option key={pdf.id} value={pdf.id}>
                                    {pdf.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => navigate("/courses")}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-70"
                  >
                    {isLoading ? "Creating..." : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
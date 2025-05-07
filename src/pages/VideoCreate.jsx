import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VideoCreate = () => {
  const [videoContent, setVideoContent] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    videoFile: null,
    videoUrl: "",
    coverImage: null,
    coverImagePreview: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const navigate = useNavigate();

  // Get CSRF token when component mounts
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

    getCsrfToken();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoContent((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      }));
    }
  };
  
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoContent((prev) => ({
        ...prev,
        videoFile: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validate form
    if (!videoContent.title || !videoContent.description || !videoContent.category) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!videoContent.videoFile && !videoContent.videoUrl) {
      setError("Please either upload a video file or provide a video URL");
      return;
    }
    
    setIsLoading(true);
    
    // Create form data for API submission
    const formData = new FormData();
    formData.append("title", videoContent.title);
    formData.append("description", videoContent.description);
    formData.append("category", videoContent.category.toLowerCase().replace(/ /g, '_'));
    formData.append("tags", videoContent.tags);
    formData.append("content_type", "video");
    
    if (videoContent.coverImage) {
      formData.append("thumbnail", videoContent.coverImage);
    }
    
    if (videoContent.videoFile) {
      formData.append("video_file", videoContent.videoFile);
    }
    
    if (videoContent.videoUrl) {
      formData.append("video_url", videoContent.videoUrl);
    }
    
    try {
      console.log("Uploading video...");
      
      const response = await fetch("http://localhost:8000/blog/create/video/", {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken
        },
        credentials: "include",
        body: formData
      });
      
      // Check if the response is ok first
      if (!response.ok) {
        let errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { detail: errorText || "Unknown error occurred" };
        }
        
        throw new Error(errorData.detail || errorData.message || `Failed to upload video: ${response.status}`);
      }
      
      // Then parse the JSON response
      const data = await response.json();
      console.log("Video uploaded successfully:", data);
      
      setSuccess(true);
      
      // Clear any localStorage drafts
      localStorage.removeItem("videoDraft");
      
      // Redirect to blog list after a delay - use replace to prevent going back to form
      setTimeout(() => {
        navigate("/blog", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Error uploading video:", err);
      setError(err.message || "An error occurred while uploading the video. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold mb-6">Upload New Video</h2>
              
              {success && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">Your video was uploaded successfully!</p>
                  <p>Redirecting to content repository...</p>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={videoContent.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={videoContent.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what the video is about"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Video Upload
                  </label>
                  <div className="flex flex-col space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Option 1: Upload a video file</p>
                      <label className="block">
                        <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-300">
                          Select Video File
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                        />
                      </label>
                      {videoContent.videoFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {videoContent.videoFile.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex-grow h-px bg-gray-200"></div>
                      <span className="px-4 text-gray-500 text-sm">OR</span>
                      <div className="flex-grow h-px bg-gray-200"></div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Option 2: Provide a video URL (YouTube, Vimeo, etc.)</p>
                      <input
                        type="url"
                        name="videoUrl"
                        value={videoContent.videoUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Thumbnail Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="block">
                      <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-300">
                        Select Image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    {videoContent.coverImagePreview && (
                      <div className="h-20 w-32 overflow-hidden rounded-md">
                        <img
                          src={videoContent.coverImagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={videoContent.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="Traditional Art">Traditional Art</option>
                      <option value="Modern Techniques">Modern Techniques</option>
                      <option value="Marketing Tips">Marketing Tips</option>
                      <option value="Government Schemes">Government Schemes</option>
                      <option value="Success Stories">Success Stories</option>
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
                      value={videoContent.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="handicraft, pottery, techniques"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/content-create")}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-70"
                  >
                    {isLoading ? "Uploading..." : "Upload Video"}
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

export default VideoCreate;
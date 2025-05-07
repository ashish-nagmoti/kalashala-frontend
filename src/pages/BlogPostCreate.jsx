import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BlogPostCreate = () => {
  const [blogPost, setBlogPost] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
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
    setBlogPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogPost((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validate form
    if (!blogPost.title || !blogPost.summary || !blogPost.content || !blogPost.category) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    
    // Create form data for API submission
    const formData = new FormData();
    formData.append("title", blogPost.title);
    formData.append("description", blogPost.summary);
    formData.append("text_content", blogPost.content);
    formData.append("category", blogPost.category.toLowerCase().replace(/ /g, '_'));
    formData.append("summary", blogPost.summary);
    formData.append("tags", blogPost.tags);
    formData.append("content_type", "blog");
    
    if (blogPost.coverImage) {
      formData.append("thumbnail", blogPost.coverImage);
    }
    
    try {
      console.log("Submitting blog post data...");
      
      const response = await fetch("http://localhost:8000/blog/create/blog/", {
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
        
        throw new Error(errorData.detail || errorData.message || `Failed to create blog post: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Blog post created successfully:", data);
      
      setSuccess(true);
      
      // Clear any localStorage drafts if you have them
      localStorage.removeItem("blogPostDraft");
      
      // Redirect to blog list after a delay - use replace to prevent going back to form
      setTimeout(() => {
        navigate("/blog", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Error creating blog post:", err);
      setError(err.message || "An error occurred while creating the blog post. Please try again later.");
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
              <h2 className="text-2xl font-bold mb-6">Create New Blog Post</h2>
              
              {success && (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">Your blog post was published successfully!</p>
                  <p>Redirecting to blog page...</p>
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
                    value={blogPost.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="summary" className="block text-gray-700 font-medium mb-2">
                    Summary *
                  </label>
                  <textarea
                    id="summary"
                    name="summary"
                    value={blogPost.summary}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a brief summary of your blog post"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Cover Image
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
                    {blogPost.coverImagePreview && (
                      <div className="h-20 w-32 overflow-hidden rounded-md">
                        <img
                          src={blogPost.coverImagePreview}
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
                      value={blogPost.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
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
                      value={blogPost.tags}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="handicraft, pottery, techniques"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                    Content *
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={blogPost.content}
                    onChange={handleInputChange}
                    rows="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your blog post content here..."
                    required
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    You can use Markdown syntax for formatting: **bold**, *italic*, # heading, etc.
                  </p>
                </div>
                
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/blog")}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-70"
                  >
                    {isLoading ? "Publishing..." : "Publish Post"}
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

export default BlogPostCreate;
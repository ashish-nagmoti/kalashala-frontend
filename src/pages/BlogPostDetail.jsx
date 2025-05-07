import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const BlogPostDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8000/blog/content/${id}/`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched content item:", data);
        
        // Log detailed information about the content type
        console.log("Content type:", data.content_type);
        if (data.content_type === 'video') {
          console.log("Video details:", data.video_details);
        } else if (data.content_type === 'pdf') {
          // Only log document_details if it exists to avoid the undefined error
          if (data.document_details) {
            console.log("Document details:", data.document_details);
          } else {
            console.log("Document details not provided in API response");
          }
        }
        
        setBlog(data);
        
        // Record the view count
        try {
          fetch(`http://localhost:8000/blog/content/${id}/increment_view/`, {
            method: 'POST',
            credentials: 'include'
          });
        } catch (viewError) {
          console.error("Error incrementing view count:", viewError);
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogPost();
  }, [id]);
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !blog) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Error Loading Content</h2>
          <p className="mb-4">{error || "Content not found"}</p>
          <Link to="/blog" className="text-black underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Determine video source from either video_details or directly from blog object
  const getVideoSource = () => {
    const videoDetails = blog.video_details || {};
    
    // Check for video_file in nested video_details
    if (videoDetails.video_file) {
      return `http://localhost:8000/media/${videoDetails.video_file}`;
    }
    
    // Check for video_url in nested video_details
    if (videoDetails.video_url) {
      return videoDetails.video_url;
    }
    
    // Fall back to top-level properties
    if (blog.video_file) {
      return `http://localhost:8000/media/${blog.video_file}`;
    }
    
    if (blog.video_url) {
      return blog.video_url;
    }
    
    return null;
  };

  // Determine document source from either document_details or directly from blog object
  const getDocumentSource = () => {
    const documentDetails = blog.document_details || {};
    
    // Check for document_file in nested document_details
    if (documentDetails.document_file) {
      return `http://localhost:8000/media/${documentDetails.document_file}`;
    }
    
    // Fall back to top-level property
    if (blog.document_file) {
      return `http://localhost:8000/media/${blog.document_file}`;
    }
    
    return null;
  };

  // Helper to determine if a URL is from YouTube
  const isYouTubeUrl = (url) => {
    return url && (
      url.includes('youtube.com') || 
      url.includes('youtu.be') || 
      url.includes('youtube-nocookie.com')
    );
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    
    // Handle youtube.com/watch?v=VIDEO_ID format
    const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
    const watchMatch = url.match(watchRegex);
    if (watchMatch) return watchMatch[1];
    
    // Handle youtu.be/VIDEO_ID format
    const shortRegex = /youtu\.be\/([^?]+)/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch) return shortMatch[1];
    
    // Handle youtube.com/embed/VIDEO_ID format
    const embedRegex = /youtube\.com\/embed\/([^?]+)/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch) return embedMatch[1];
    
    return null;
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <Link to="/blog" className="inline-flex items-center text-gray-600 hover:text-black">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Content
            </Link>
          </div>

          {/* Content Header & Body */}
          <article className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Content thumbnail image (if not a video) */}
            {blog.content_type !== 'video' && blog.thumbnail && (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={
                    blog.thumbnail.startsWith('http') 
                      ? blog.thumbnail 
                      : blog.thumbnail.startsWith('/media') 
                        ? `http://localhost:8000${blog.thumbnail}` 
                        : `http://localhost:8000/media/${blog.thumbnail}`
                  }
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-8">
              <div className="mb-6">
                {/* Content metadata */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{formatDate(blog.upload_date)}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{blog.category}</span>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                    {blog.content_type}
                  </span>
                  {blog.tags && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{blog.tags}</span>
                    </>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
                
                {/* Author info */}
                {blog.contributor && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                      {blog.contributor.name ? blog.contributor.name.charAt(0).toUpperCase() : 
                      blog.contributor.username ? blog.contributor.username.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <p className="font-medium">{blog.contributor.name || blog.contributor.username || 'Anonymous'}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-lg mb-6 text-gray-600">{blog.description}</p>
                
                {/* Content type-specific displays */}
                {blog.content_type === 'blog' && (
                  <div className="mt-8 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {blog.text_content || 
                     (blog.blog_details && blog.blog_details.text_content) || 
                     "No content available."}
                  </div>
                )}
                
                {blog.content_type === 'video' && (
                  <div className="mt-8">
                    {getVideoSource() ? (
                      <>
                        {isYouTubeUrl(getVideoSource()) ? (
                          <div className="aspect-video w-full">
                            <iframe
                              className="w-full h-full"
                              src={`https://www.youtube.com/embed/${getYouTubeVideoId(getVideoSource())}`}
                              title={blog.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ) : (
                          <video 
                            controls 
                            className="w-full rounded-lg" 
                            poster={blog.thumbnail ? (
                              blog.thumbnail.startsWith('http') 
                                ? blog.thumbnail 
                                : blog.thumbnail.startsWith('/media') 
                                  ? `http://localhost:8000${blog.thumbnail}` 
                                  : `http://localhost:8000/media/${blog.thumbnail}`
                            ) : undefined}
                          >
                            <source src={getVideoSource()} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </>
                    ) : (
                      <p className="text-red-500">Video source not available.</p>
                    )}
                  </div>
                )}
                
                {blog.content_type === 'pdf' && (
                  <div className="mt-8">
                    {getDocumentSource() ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-100 w-full p-8 mb-6 rounded-lg text-center">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-xl font-medium mb-2">{blog.title}</h3>
                          <p className="text-gray-600 mb-6">PDF document is available for download</p>
                          <a 
                            href={getDocumentSource()} 
                            className="text-blue-600 underline" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Click here to view the PDF in a new tab
                          </a>
                        </div>
                        <a 
                          href={getDocumentSource()} 
                          download
                          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                          onClick={() => {
                            // Record download count
                            try {
                              fetch(`http://localhost:8000/blog/content/${id}/increment_download/`, {
                                method: 'POST',
                                credentials: 'include'
                              });
                            } catch (err) {
                              console.error("Error recording download:", err);
                            }
                          }}
                        >
                          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Document
                        </a>
                      </div>
                    ) : (
                      <p className="text-red-500">Document source not available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;
"use client"

import { useState, useEffect } from "react"
import { Link, NavLink } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import { enhancedFetch, ensureCorrectApiUrl } from "../utils/apiHelpers"

const Blog = () => {
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [categories, setCategories] = useState(["all"]);
  const [contentTypes, setContentTypes] = useState(["all"]);

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        // Updated endpoint to exclude course modules
        const response = await enhancedFetch('/blog/content/?exclude_course_content=true', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched blog content:", data);
        
        // Enhanced debugging
        console.log("Content types found:", [...new Set(data.map(item => item.content_type))]);
        
        // Debug each content type
        const blogs = data.filter(item => item.content_type === 'blog');
        const videos = data.filter(item => item.content_type === 'video');
        const pdfs = data.filter(item => item.content_type === 'pdf');
        
        console.log(`Found ${blogs.length} blogs, ${videos.length} videos, ${pdfs.length} pdfs/documents`);
        
        if (videos.length > 0) {
          console.log("Sample video item:", videos[0]);
        }
        
        if (pdfs.length > 0) {
          console.log("Sample pdf item:", pdfs[0]);
        }
        
        // Debug thumbnails
        data.forEach(item => {
          console.log(`Content ${item.id} (${item.content_type}): thumbnail=${item.thumbnail}`);
        });
        
        // Ensure data is an array
        const contentArray = Array.isArray(data) ? data : [];
        
        setContent(contentArray);
        setFilteredContent(contentArray);
        
        // Extract unique categories and content types
        const uniqueCategories = ["all", ...new Set(contentArray.map(item => item.category).filter(Boolean))];
        const uniqueContentTypes = ["all", ...new Set(contentArray.map(item => item.content_type).filter(Boolean))];
        
        setCategories(uniqueCategories);
        setContentTypes(uniqueContentTypes);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch content:", err);
        // Set empty arrays to prevent further errors
        setContent([]);
        setFilteredContent([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredContent(content);
      return;
    }
    
    const filtered = content.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      (item.tags && item.tags.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredContent(filtered);
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    applyFilters(category, selectedContentType);
  };

  const filterByContentType = (contentType) => {
    setSelectedContentType(contentType);
    applyFilters(selectedCategory, contentType);
  };

  const applyFilters = (category, contentType) => {
    let filtered = content;
    
    if (category !== "all") {
      filtered = filtered.filter(item => item.category === category);
    }
    
    if (contentType !== "all") {
      filtered = filtered.filter(item => item.content_type === contentType);
    }
    
    setFilteredContent(filtered);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-4">Content Repository</h1>
        <p className="text-gray-600 mb-8">
          Access our collection of resources, documentation, and research materials for traditional crafts and techniques.
        </p>

        <div className="mb-8">
          <SearchBar placeholder="Search resources..." onSearch={handleSearch} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => filterByCategory(category)}
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      selectedCategory === category ? "bg-black text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {category === "all" ? "All Categories" : category}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
              <h2 className="font-semibold text-lg mb-4">Content Types</h2>
              <div className="space-y-2">
                {contentTypes.map((contentType, index) => (
                  <button
                    key={index}
                    onClick={() => filterByContentType(contentType)}
                    className={`block w-full text-left px-3 py-2 rounded-md ${
                      selectedContentType === contentType ? "bg-black text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {contentType === "all" ? "All Types" : contentType}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
              <h2 className="font-semibold text-lg mb-4">Contribute</h2>             
                <NavLink to="/content-create" className="btn-primary w-full block text-center">
                  Create New Content
                </NavLink>
            </div>
          </div>

          {/* Content Repository Items */}
          <div className="md:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                <p>{error}</p>
                <p>Please try again later or contact support if the issue persists.</p>
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No resources found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredContent.map((item) => (
                  <Link to={`/blog/${item.id}`} key={item.id} className="card group">
                    <div className="aspect-video overflow-hidden relative">
                      <img
                        src={
                          item.thumbnail 
                          ? (item.thumbnail.startsWith('http') 
                             ? item.thumbnail 
                             : ensureCorrectApiUrl(
                                 item.thumbnail.startsWith('/media')
                                   ? item.thumbnail
                                   : `/media/${item.thumbnail}`
                               ))
                          : "/placeholder.svg"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                        {item.content_type}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <span>{formatDate(item.upload_date)}</span>
                        <span className="mx-2">•</span>
                        <span>{item.category}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      <div className="flex items-center">
                        {item.contributor ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                              {item.contributor.name ? item.contributor.name.charAt(0).toUpperCase() : 
                               item.contributor.username ? item.contributor.username.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <span className="text-sm font-medium">
                              {item.contributor.name || item.contributor.username || 'Anonymous'}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                            <span className="text-sm font-medium">Anonymous</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog
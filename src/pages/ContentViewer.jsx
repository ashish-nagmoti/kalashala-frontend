import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import axios from "axios";

const ContentViewer = () => {
  const { moduleId } = useParams();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const response = await axios.get(`/blog/module/${moduleId}/`);
        setModuleData(response.data);
      } catch (error) {
        console.error("Error fetching module data:", error);
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId]);

  const renderContent = () => {
    if (!moduleData) return null;

    // Handle different content types appropriately
    if (moduleData.content_type === "video") {
      // Fix the URL to avoid double prefixing
      const videoUrl = moduleData.video_file.startsWith("http") 
        ? moduleData.video_file 
        : `/media/${moduleData.video_file}`;
        
      return (
        <div className="w-full aspect-video">
          <video 
            className="w-full h-full rounded-lg shadow-lg" 
            controls 
            autoPlay
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (moduleData.content_type === "document") {
      // For documents, provide a download button
      const docUrl = moduleData.document_file.startsWith("http")
        ? moduleData.document_file
        : `/media/${moduleData.document_file}`;
        
      return (
        <div className="flex flex-col items-center">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{moduleData.title}</h2>
            <p className="text-gray-600 mb-6">{moduleData.description}</p>
          </div>
          
          <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div className="flex justify-center">
              <a
                href={docUrl}
                download
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
              >
                Download Document
              </a>
            </div>
          </div>
        </div>
      );
    } else if (moduleData.content_type === "blog") {
      // For blog posts, render the content
      return (
        <div className="prose lg:prose-xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">{moduleData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: moduleData.blog_content }} />
        </div>
      );
    } else {
      return (
        <div className="text-center p-4">
          <p>Unsupported content type: {moduleData.content_type}</p>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {renderContent()}
    </div>
  );
};

export default ContentViewer;
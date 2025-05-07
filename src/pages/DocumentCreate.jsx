import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";

const DocumentCreate = () => {
  const [documentContent, setDocumentContent] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    documentFile: null,
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
    setDocumentContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentContent((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: URL.createObjectURL(file)
      }));
    }
  };
  
  const handleDocumentFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentContent((prev) => ({
        ...prev,
        documentFile: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    // Validate form
    if (!documentContent.title || !documentContent.description || !documentContent.category) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!documentContent.documentFile) {
      setError("Please upload a document file");
      return;
    }
    
    setIsLoading(true);
    
    // Create form data for API submission
    const formData = new FormData();
    formData.append("title", documentContent.title);
    formData.append("description", documentContent.description);
    formData.append("category", documentContent.category.toLowerCase().replace(/ /g, '_'));
    formData.append("tags", documentContent.tags);
    formData.append("content_type", "pdf");
    
    if (documentContent.coverImage) {
      formData.append("thumbnail", documentContent.coverImage);
    }
    
    if (documentContent.documentFile) {
      formData.append("document_file", documentContent.documentFile);
    }
    
    try {
      console.log("Uploading document...");
      
      const response = await fetch("http://localhost:8000/blog/create/document/", {
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
        
        throw new Error(errorData.detail || errorData.message || `Failed to upload document: ${response.status}`);
      }
      
      // Then parse the JSON response
      const data = await response.json();
      console.log("Document uploaded successfully:", data);
      
      setSuccess(true);
      
      // Clear any localStorage drafts if you have them
      localStorage.removeItem("documentDraft");
      
      // Reset form after success but don't clear immediately so the user can see what was submitted
      setTimeout(() => {
        // Redirect to blog list - use replace to prevent going back to form
        navigate("/blog", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Error uploading document:", err);
      setError(err.message || "An error occurred while uploading the document. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4 py-8 max-w-4xl bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Upload Document</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Document uploaded successfully!</p>
            <p>Redirecting to content repository...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Title */}
          <div>
            <label className="block mb-2 text-sm font-medium">Title *</label>
            <input
              type="text"
              name="title"
              value={documentContent.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Document Description */}
          <div>
            <label className="block mb-2 text-sm font-medium">Description *</label>
            <textarea
              name="description"
              value={documentContent.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            ></textarea>
          </div>

          {/* Document Category */}
          <div>
            <label className="block mb-2 text-sm font-medium">Category *</label>
            <select
              name="category"
              value={documentContent.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Category</option>
              <option value="Art_Craft">Art & Craft</option>
              <option value="Music">Music</option>
              <option value="Dance">Dance</option>
              <option value="Culinary">Culinary Arts</option>
              <option value="Literature">Literature</option>
              <option value="Photography">Photography</option>
              <option value="Digital_Art">Digital Art</option>
              <option value="Film_Theater">Film & Theater</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Document Tags */}
          <div>
            <label className="block mb-2 text-sm font-medium">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={documentContent.tags}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., tutorial, guide, reference"
            />
          </div>

          {/* Document File Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium">Document File (PDF) *</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded cursor-pointer hover:bg-blue-100">
                <Upload size={20} className="mr-2" />
                Choose PDF
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleDocumentFileChange}
                />
              </label>
              {documentContent.documentFile && (
                <span className="text-sm text-green-600">
                  {documentContent.documentFile.name} selected
                </span>
              )}
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium">Cover Image (optional)</label>
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
              {documentContent.coverImagePreview && (
                <div className="relative h-20 w-20">
                  <img
                    src={documentContent.coverImagePreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 text-white font-medium rounded-md ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentCreate;
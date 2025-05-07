import { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import { Plus, X, Edit, Trash } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [userType, setUserType] = useState('');
  const [userId, setUserId] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newDetail, setNewDetail] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState(null);
  const params = useParams();
  const navigate = useNavigate();

  const emptyProject = {
    title: "",
    category: "",
    description: "",
    year: new Date().getFullYear().toString(),
    details: []
  };
  
  // Get CSRF token for API requests
  const [csrfToken, setCsrfToken] = useState("");

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

  useEffect(() => {
    // Get user info from localStorage
    const storedUserType = localStorage.getItem('userType');
    const storedUserId = localStorage.getItem('userId');
    const artistIdFromUrl = params.id; // If viewing another artist's portfolio
    
    setUserType(storedUserType || '');
    setUserId(storedUserId || null);
    
    // Determine if the current user is the owner of this portfolio
    setIsOwner(!artistIdFromUrl || (storedUserId && artistIdFromUrl === storedUserId));
    
    // Fetch projects from API (either current user's or specified artist's)
    fetchProjects(artistIdFromUrl || storedUserId);
  }, [params.id]);

  const fetchProjects = async (userId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = "http://localhost:8000/custom_auth/portfolio/";
      if (userId) {
        url += `?user_id=${userId}`;
      }
      
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProjects(data);
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load portfolio items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults(projects);
      return;
    }

    const filtered = projects.filter(
      (project) =>
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()) ||
        project.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === "all") {
      setSearchResults(projects);
    } else {
      const filtered = projects.filter((project) => project.category === category);
      setSearchResults(filtered);
    }
  };

  const openEditModal = (project = null) => {
    if (project) {
      // Edit existing project
      setCurrentProject({...project});
    } else {
      // Create new project
      setCurrentProject({...emptyProject});
      setIsAddingNew(true);
    }
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentProject(null);
    setIsAddingNew(false);
  };

  const handleProjectChange = (e) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name]: value
    });
  };

  const handleDetailChange = (index, value) => {
    const updatedDetails = [...currentProject.details];
    updatedDetails[index] = value;
    setCurrentProject({
      ...currentProject,
      details: updatedDetails
    });
  };

  const addDetail = () => {
    if (newDetail.trim() === "") return;
    
    setCurrentProject({
      ...currentProject,
      details: [...currentProject.details, newDetail]
    });
    setNewDetail("");
  };

  const removeDetail = (index) => {
    const updatedDetails = [...currentProject.details];
    updatedDetails.splice(index, 1);
    setCurrentProject({
      ...currentProject,
      details: updatedDetails
    });
  };

  const saveProject = async () => {
    try {
      let response;
      let method;
      let url = "http://localhost:8000/custom_auth/portfolio/";
      
      // Prepare data for API call
      const projectData = {
        title: currentProject.title,
        category: currentProject.category,
        description: currentProject.description,
        year: currentProject.year,
        details: currentProject.details
      };
      
      if (isAddingNew) {
        // Create new project
        method = "POST";
      } else {
        // Update existing project
        method = "PUT";
        url = `${url}${currentProject.id}/`;
      }
      
      response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        credentials: "include",
        body: JSON.stringify(projectData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save project");
      }
      
      // Refresh projects after saving
      await fetchProjects(userId);
      closeEditModal();
    } catch (error) {
      console.error("Error saving project:", error);
      setError(error.message || "Failed to save project. Please try again.");
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/custom_auth/portfolio/${projectId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
      
      // Refresh projects after deletion
      await fetchProjects(userId);
    } catch (error) {
      console.error("Error deleting project:", error);
      setError("Failed to delete project. Please try again.");
    }
  };

  const categories = projects.length > 0
    ? ["all", ...new Set(projects.map((project) => project.category))]
    : ["all"];

  // Only allow editing if user is the owner and is an artist
  const canEdit = isOwner && userType === 'artist';

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-6">Portfolio</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Portfolio</h1>
          {canEdit && (
            <button 
              onClick={() => openEditModal()} 
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Project
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-8">
          <SearchBar placeholder="Search projects by keyword..." onSearch={handleSearch} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories */}
          <div className="md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => filterByCategory(category)}
                    className={`block w-full text-left px-3 py-2 rounded-md ${selectedCategory === category ? "bg-black text-white" : "hover:bg-gray-100"
                      }`}
                  >
                    {category === "all" ? "All Categories" : category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="md:w-3/4">
            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No projects found matching your criteria.</p>
                {canEdit && (
                  <button 
                    onClick={() => openEditModal()} 
                    className="btn-primary mt-4"
                  >
                    Add Your First Project
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <p className="text-sm text-gray-500">{project.category} - {project.year}</p>
                      </div>
                      {canEdit && (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openEditModal(project)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                            title="Edit project"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteProject(project.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                            title="Delete project"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-gray-700">{project.description}</p>
                    <ul className="list-disc pl-5 mt-4 space-y-1">
                      {project.details.map((detail, index) => (
                        <li key={index} className="text-gray-700">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {isAddingNew ? "Add New Project" : "Edit Project"}
                </h2>
                <button 
                  onClick={closeEditModal}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={currentProject.title}
                    onChange={handleProjectChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Project title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={currentProject.category}
                      onChange={handleProjectChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g. Exhibition, Workshop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <input
                      type="text"
                      name="year"
                      value={currentProject.year}
                      onChange={handleProjectChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="e.g. 2025"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentProject.description}
                    onChange={handleProjectChange}
                    className="w-full px-3 py-2 border rounded-md"
                    rows="3"
                    placeholder="Brief description about the project"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Details</label>
                  <div className="space-y-2 mb-4">
                    {currentProject.details.map((detail, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="text"
                          value={detail}
                          onChange={(e) => handleDetailChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md"
                        />
                        <button
                          onClick={() => removeDetail(index)}
                          className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex">
                    <input
                      type="text"
                      value={newDetail}
                      onChange={(e) => setNewDetail(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-l-md"
                      placeholder="Add new detail"
                      onKeyDown={(e) => e.key === 'Enter' && addDetail()}
                    />
                    <button
                      onClick={addDetail}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-md"
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

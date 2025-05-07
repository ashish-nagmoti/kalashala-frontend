import { Link } from "react-router-dom";

const ContentCreate = () => {
  const contentTypes = [
    {
      type: "blog",
      title: "Blog Post",
      description: "Create text-based articles, stories, or tutorials",
      icon: "📝",
      path: "/create-blog"
    },
    {
      type: "video",
      title: "Video",
      description: "Upload videos or share from external platforms like YouTube",
      icon: "🎬",
      path: "/create-video"
    },
    {
      type: "pdf",
      title: "Document/PDF",
      description: "Share documents, PDFs, presentations, or research papers",
      icon: "📄",
      path: "/create-document"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold mb-2">Create New Content</h2>
              <p className="text-gray-600 mb-6">Choose the type of content you want to create</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contentTypes.map((content) => (
                  <Link 
                    to={content.path} 
                    key={content.type}
                    className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200"
                  >
                    <div className="text-3xl mb-3">{content.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
                    <p className="text-gray-600 text-sm">{content.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreate;
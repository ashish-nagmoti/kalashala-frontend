import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingBag, Heart, Clock, Settings } from "lucide-react";

const Profile = () => {
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    username: "",
    userType: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');

  // Dummy data for purchases and saved items
  const [purchases, setPurchases] = useState([
    {
      id: 1,
      title: "Traditional Craft Techniques",
      type: "Course",
      date: "2025-04-15",
      status: "Completed"
    },
    {
      id: 2,
      title: "Modern Art Workshop",
      type: "Course",
      date: "2025-03-22",
      status: "In Progress"
    }
  ]);

  const [savedItems, setSavedItems] = useState([
    {
      id: 1,
      title: "Warli Painting Techniques",
      type: "Blog",
      saved_date: "2025-04-10"
    },
    {
      id: 2,
      title: "Marketing for Artisans",
      type: "Course",
      saved_date: "2025-04-05"
    }
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/custom_auth/user/", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setUserDetails({
            name: userData.name || userData.username,
            email: userData.email,
            username: userData.username,
            userType: userData.user_type || "None"
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="container-custom py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* Profile Overview */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{userDetails.name}</h2>
            <p className="text-gray-600">{userDetails.email}</p>
            <p className="mt-1 uppercase text-xs font-medium inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {userDetails.userType === 'buyer' ? 'Buyer' : 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-3 px-4 ${
            activeTab === 'purchases' 
              ? 'border-b-2 border-black font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('purchases')}
        >
          <div className="flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" />
            My Purchases
          </div>
        </button>
        <button
          className={`py-3 px-4 ${
            activeTab === 'saved' 
              ? 'border-b-2 border-black font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('saved')}
        >
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Saved Items
          </div>
        </button>
        <button
          className={`py-3 px-4 ${
            activeTab === 'settings' 
              ? 'border-b-2 border-black font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        {activeTab === 'purchases' && (
          <div>
            <h3 className="text-lg font-medium mb-4">My Purchases</h3>
            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">You haven't made any purchases yet.</p>
                <Link to="/courses" className="btn-primary inline-block mt-4">
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {purchases.map(purchase => (
                  <div key={purchase.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h4 className="font-medium">{purchase.title}</h4>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-3">{purchase.type}</span>
                        <span className="text-xs text-gray-400">{purchase.date}</span>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center">
                      <span className={`text-sm px-2 py-1 rounded ${
                        purchase.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status}
                      </span>
                      <Link to={`/module-viewer/${purchase.id}`} className="ml-3 text-sm text-blue-600 hover:underline">
                        {purchase.status === 'Completed' ? 'Review' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <h3 className="text-lg font-medium mb-4">Saved Items</h3>
            {savedItems.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">You haven't saved any items yet.</p>
                <Link to="/blog" className="btn-primary inline-block mt-4">
                  Explore Content
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {savedItems.map(item => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 mr-3">{item.type}</span>
                        <span className="text-xs text-gray-400">Saved on {item.saved_date}</span>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <Link to={item.type === 'Blog' ? `/blog/${item.id}` : `/courses/${item.id}`} className="text-sm text-blue-600 hover:underline">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-medium mb-4">Account Settings</h3>
            <form className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border rounded-md"
                  defaultValue={userDetails.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border rounded-md"
                  defaultValue={userDetails.email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="••••••••"
                />
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
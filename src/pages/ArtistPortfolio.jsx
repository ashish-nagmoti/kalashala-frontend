"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Phone, Mail, MapPin, ExternalLink, Linkedin, Instagram, Facebook, Twitter } from "lucide-react"

const ArtistPortfolio = () => {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [selectedWork, setSelectedWork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [csrfToken, setCsrfToken] = useState("")

  // Get CSRF token
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

  // Fetch artist data
  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8000/custom_auth/artists/${id}/`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch artist: ${response.statusText}`);
        }
        
        const artistData = await response.json();
        setArtist(artistData);
        
        if (artistData?.portfolio_items?.length > 0) {
          setSelectedWork(artistData.portfolio_items[0])
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching artist:", error);
        setError("Failed to load artist details. Please try again later.");
        setLoading(false);
      }
    };

    if (csrfToken && id) {
      fetchArtist();
    }
  }, [id, csrfToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
        <p className="mb-6">{error || "The artist you're looking for doesn't exist or has been removed."}</p>
        <Link to="/artists" className="btn-primary">
          Browse All Artists
        </Link>
      </div>
    )
  }

  // Helper function to get social icon based on platform
  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "facebook":
        return <Facebook className="w-5 h-5" />;
      case "twitter":
        return <Twitter className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="bg-white rounded-xl overflow-hidden shadow-md">
          {/* Artist Header */}
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 p-6">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={artist.profile_image || "/placeholder.svg"}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{artist.art_style || "Artist"}</p>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{artist.bio || "Artist biography not available."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {artist.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                    <span>{artist.location}</span>
                  </div>
                )}
                {artist.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-gray-500" />
                    <Link to={`mailto:${artist.email}`} className="hover:underline">
                      {artist.email}
                    </Link>
                  </div>
                )}
                {artist.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-gray-500" />
                    <Link to={`tel:${artist.phone}`} className="hover:underline">
                      {artist.phone}
                    </Link>
                  </div>
                )}
                {artist.website && (
                  <div className="flex items-center">
                    <ExternalLink className="w-5 h-5 mr-2 text-gray-500" />
                    <a href={artist.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Personal Website
                    </a>
                  </div>
                )}
              </div>

              {artist.social_links && artist.social_links.length > 0 && (
                <div className="flex space-x-4">
                  {artist.social_links.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"
                      aria-label={social.platform}
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <a href={`mailto:${artist.email}`} className="btn-primary">Contact Artist</a>
              </div>
            </div>
          </div>

          {/* Previous Works */}
          <div className="p-6 border-t">
            <h2 className="text-2xl font-bold mb-6">Portfolio Works</h2>

            {artist.portfolio_items && artist.portfolio_items.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {artist.portfolio_items.map((work, index) => (
                    <div
                      key={index}
                      className={`aspect-square overflow-hidden rounded-lg cursor-pointer border-2 ${
                        selectedWork === work ? "border-black" : "border-transparent"
                      }`}
                      onClick={() => setSelectedWork(work)}
                    >
                      <img
                        src={work.thumbnail || "/placeholder.svg"}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {selectedWork && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="aspect-video overflow-hidden rounded-lg mb-4">
                      <img
                        src={selectedWork.image || "/placeholder.svg"}
                        alt={selectedWork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{selectedWork.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedWork.description}</p>
                    {selectedWork.tags && selectedWork.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedWork.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No portfolio works available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtistPortfolio


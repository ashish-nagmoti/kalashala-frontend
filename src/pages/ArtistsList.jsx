"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import SearchBar from "../components/SearchBar"

const ArtistsList = () => {
  const [artists, setArtists] = useState([])
  const [filteredArtists, setFilteredArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    artStyle: "",
    location: "",
  })
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

  // Fetch artists from the API
  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch("http://localhost:8000/custom_auth/artists/", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch artists: ${response.statusText}`);
        }
        
        const data = await response.json();
        setArtists(data);
        setFilteredArtists(data);
      } catch (error) {
        console.error("Error fetching artists:", error);
        setError("Failed to load artists. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (csrfToken) {
      fetchArtists();
    }
  }, [csrfToken]);

  // Apply filters whenever artists data or filter values change
  useEffect(() => {
    let result = [...artists]

    if (filters.artStyle) {
      result = result.filter((artist) => 
        (artist.art_style && artist.art_style.toLowerCase().includes(filters.artStyle.toLowerCase())) ||
        (artist.portfolio_items && artist.portfolio_items.some(item => 
          item.category && item.category.toLowerCase().includes(filters.artStyle.toLowerCase())
        ))
      )
    }

    if (filters.location) {
      result = result.filter((artist) => 
        artist.location && artist.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredArtists(result)
  }, [artists, filters])

  const handleSearch = (query) => {
    const result = artists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(query.toLowerCase()) ||
        (artist.art_style && artist.art_style.toLowerCase().includes(query.toLowerCase())) ||
        (artist.location && artist.location.toLowerCase().includes(query.toLowerCase()))
    )
    setFilteredArtists(result)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Get unique art styles and locations for filters
  const artStyles = [...new Set(
    artists.flatMap(artist => [
      artist.art_style,
      ...(artist.portfolio_items?.map(item => item.category) || [])
    ]).filter(Boolean)
  )]
  
  const locations = [...new Set(
    artists.map(artist => artist.location).filter(Boolean)
  )]

  // Helper function to get featured image for artist
  const getArtistImage = (artist) => {
    // If artist has portfolio items with images, use the first one
    if (artist.portfolio_items && artist.portfolio_items.length > 0) {
      // Use placeholder for now, you'll implement real images later
      return "/placeholder.svg"; 
    }
    return "/placeholder.svg"; // Default placeholder
  };

  // Helper to get artist's art style
  const getArtistStyle = (artist) => {
    if (artist.art_style) return artist.art_style;
    if (artist.portfolio_items && artist.portfolio_items.length > 0) {
      return artist.portfolio_items[0].category || "Artist";
    }
    return "Artist";
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Discover Talented Artisans</h1>

        <div className="mb-8">
          <SearchBar placeholder="Search artists by name, art style ..." onSearch={handleSearch} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters */}
          <div className="md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Art Style</label>
                <select
                  name="artStyle"
                  value={filters.artStyle}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Styles</option>
                  {artStyles.map((style, index) => (
                    <option key={index} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Location</label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Locations</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setFilters({ artStyle: "", location: "" })}
                className="text-sm text-gray-600 hover:text-black"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredArtists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No artists found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArtists.map((artist) => (
                  <Link to={`/artists/${artist.id}`} key={artist.id} className="card group">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={getArtistImage(artist)}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{artist.name}</h3>
                      <p className="text-sm text-gray-600">{getArtistStyle(artist)}</p>
                      {artist.location && (
                        <p className="text-xs text-gray-500 mt-1">{artist.location}</p>
                      )}
                      <div className="flex mt-2">
                        {artist.portfolio_items && (
                          <p className="text-xs text-gray-500">
                            {artist.portfolio_items.length} {artist.portfolio_items.length === 1 ? 'project' : 'projects'}
                          </p>
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

export default ArtistsList


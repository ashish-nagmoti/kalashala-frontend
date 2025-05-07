import { useState, useEffect } from "react"
import SearchBar from "../components/SearchBar"
import { ChevronDown, ChevronUp, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

// Import from the correct path based on your project structure
import { useSchemes } from "../context/SchemesContext"

const Schemes = () => {
  const { schemes, setSchemes } = useSchemes()
  const [expandedScheme, setExpandedScheme] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")

  // API and pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiMetadata, setApiMetadata] = useState(null)
  const itemsPerPage = 10 // Number of schemes per page

  // Construct API URL with environment variable for API key
  const getApiUrl = (offset) => {
    const API_KEY = import.meta.env.GOV_API_KEY || "579b464db66ec23bdd000001ca1d41bc8bac41596da6cf41b94fbc1a" // Fallback key for development
    return `https://api.data.gov.in/resource/3fa8d289-8efd-4f3b-a9a1-94d3ecf11abd?api-key=${API_KEY}&format=json&offset=${offset}&limit=${itemsPerPage}`
  }

  // Fetch schemes data
  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true)
      try {
        const offset = (currentPage - 1) * itemsPerPage
        const response = await fetch(getApiUrl(offset))

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        // Set API metadata
        setApiMetadata({
          title: data.title,
          description: data.desc,
          organization: data.org?.join(", ") || "Not specified",
          sector: data.sector?.join(", ") || "Not specified",
          lastUpdated: new Date(data.updated_date).toLocaleDateString()
        })

        // Calculate total pages
        setTotalRecords(data.total)
        setTotalPages(Math.ceil(data.total / itemsPerPage))

        // Process and format the received data
        const formattedSchemes = data.records.map((record, index) => ({
          id: `scheme-${offset + index + 1}`,
          title: record.name_of_the_scheme || "Unnamed Scheme",
          category: record.category_of_artiste__based_on_the_age_group_ || "Not specified",
          description: `Financial assistance scheme with previous monthly amount of ₹${record.previous_amount_of_financial_assistance__in_rs__per_month_} enhanced to ₹${record.enhanced_amount_of_financial_assistance__in_rs__per_month_}`,
          previousAmount: record.previous_amount_of_financial_assistance__in_rs__per_month_,
          enhancedAmount: record.enhanced_amount_of_financial_assistance__in_rs__per_month_,
          year: "2022-23", // As mentioned in the dataset title
          benefits: [
            `Enhanced financial assistance of ₹${record.enhanced_amount_of_financial_assistance__in_rs__per_month_} per month`,
            `₹${record.enhanced_amount_of_financial_assistance__in_rs__per_month_ - record.previous_amount_of_financial_assistance__in_rs__per_month_} increase from previous assistance`
          ],
          eligibility: [
            `Age group: ${record.category_of_artiste__based_on_the_age_group_}`,
            "Must be an artist under the specified category"
          ],
          applyLink: "#" // Placeholder link since actual link isn't in the data
        }))

        setSchemes(formattedSchemes)
        console.log(schemes)
        setSearchResults(formattedSchemes)
        setError(null)
      } catch (err) {
        console.error("Error fetching schemes:", err)
        setError("Failed to load schemes. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchSchemes()
  }, [currentPage, setSchemes])

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults(schemes)
      return
    }

    const filtered = schemes.filter(
      (scheme) =>
        scheme.title.toLowerCase().includes(query.toLowerCase()) ||
        scheme.description.toLowerCase().includes(query.toLowerCase()) ||
        scheme.category.toLowerCase().includes(query.toLowerCase()) ||
        scheme.benefits.some((benefit) => benefit.toLowerCase().includes(query.toLowerCase())) ||
        scheme.eligibility.some((criteria) => criteria.toLowerCase().includes(query.toLowerCase())),
    )
    setSearchResults(filtered)
  }

  const toggleExpand = (id) => {
    if (expandedScheme === id) {
      setExpandedScheme(null)
    } else {
      setExpandedScheme(id)
    }
  }

  const filterByCategory = (category) => {
    setSelectedCategory(category)
    if (category === "all") {
      setSearchResults(schemes)
    } else {
      const filtered = schemes.filter((scheme) => scheme.category === category)
      setSearchResults(filtered)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Get unique categories
  const categories = schemes.length > 0
    ? ["all", ...new Set(schemes.map((scheme) => scheme.category))]
    : ["all"]

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-2">Financial Assistance Schemes for Artists</h1>

        {apiMetadata && (
          <div className="mb-8">
            <p className="text-gray-600 mb-2">{apiMetadata.description}</p>
            <div className="text-sm text-gray-500">
              <span className="inline-block mr-4">Organization: {apiMetadata.organization}</span>
              <span className="inline-block mr-4">Sector: {apiMetadata.sector}</span>
              <span>Last Updated: {apiMetadata.lastUpdated}</span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <SearchBar placeholder="Search schemes by keyword..." onSearch={handleSearch} />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories */}
          <div className="md:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Age Categories</h2>
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

            {/* Stats Box */}
            <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
              <h2 className="font-semibold text-lg mb-4">Statistics</h2>
              <div className="space-y-2">
                <p className="text-sm">Total Schemes: {totalRecords}</p>
                <p className="text-sm">Financial Year: 2022-23</p>
              </div>
            </div>
          </div>

          {/* Schemes List */}
          <div className="md:w-3/4">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">Loading schemes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => setCurrentPage(currentPage)}
                  className="mt-4 px-4 py-2 bg-black text-white rounded-md"
                >
                  Retry
                </button>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500">No schemes found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {searchResults.map((scheme) => (
                    <div key={scheme.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div
                        className="p-6 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleExpand(scheme.id)}
                      >
                        <div>
                          <h3 className="font-semibold text-lg">{scheme.title}</h3>
                          <p className="text-sm text-gray-500">For artists in age group: {scheme.category}</p>
                        </div>
                        {expandedScheme === scheme.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>

                      {expandedScheme === scheme.id && (
                        <div className="p-6 pt-0 border-t">
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Financial Assistance</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-500">Previous Amount</p>
                                <p className="text-xl font-semibold">₹{scheme.previousAmount}/month</p>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-md">
                                <p className="text-sm text-gray-500">Enhanced Amount</p>
                                <p className="text-xl font-semibold">₹{scheme.enhancedAmount}/month</p>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Benefits</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {scheme.benefits.map((benefit, index) => (
                                <li key={index} className="text-gray-700">
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Eligibility</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {scheme.eligibility.map((criteria, index) => (
                                <li key={index} className="text-gray-700">
                                  {criteria}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* <div className="mt-6"> */}
                          {/*   <a */}
                          {/*     href={scheme.applyLink} */}
                          {/*     target="_blank" */}
                          {/*     rel="noopener noreferrer" */}
                          {/*     className="btn-primary inline-flex items-center" */}
                          {/*   > */}
                          {/*     Apply Now */}
                          {/*     <ExternalLink className="w-4 h-4 ml-2" /> */}
                          {/*   </a> */}
                          {/* </div> */}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-8 flex justify-between items-center">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center px-4 py-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-100'} rounded-md`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>

                  <div className="text-gray-600">
                    Page {currentPage} of {totalPages}
                    <div className="text-xs text-gray-500 mt-1">
                      Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} schemes
                    </div>
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center px-4 py-2 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-100'} rounded-md`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Schemes

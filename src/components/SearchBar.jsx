"use client"

import { useState } from "react"
import { Search } from "lucide-react"

const SearchBar = ({ placeholder = "Search...", onSearch }) => {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch && query.trim()) {
      onSearch(query)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
      />
      <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2" aria-label="Search">
        <Search className="w-4 h-4 text-gray-500" />
      </button>
    </form>
  )
}

export default SearchBar


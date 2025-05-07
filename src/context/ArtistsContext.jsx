import { createContext, useContext, useState } from "react"

// Sample data for artists
const DUMMY_ARTISTS = [
  {
    id: "1",
    name: "Maya Gupta",
    artStyle: "Pottery",
    location: "Jaipur, Rajasthan",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "A passionate potter bringing ancient traditions with modern aesthetics through tribal motifs. Specializing in earthy tones and rhythmic patterns, their work beautifully narrates folk tales and nature's harmony.",
    email: "maya@example.com",
    phone: "+91 9876543210",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "LinkedIn", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Twitter", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Tribal Harmony Collection",
        description: "A series of handcrafted pottery pieces inspired by tribal art forms of Rajasthan.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Pottery", "Tribal", "Handcrafted"],
      },
      {
        title: "Modern Minimalist Vases",
        description: "Contemporary vases with clean lines and subtle textures.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Pottery", "Modern", "Minimalist"],
      },
      {
        title: "Traditional Tea Set",
        description: "A complete tea set inspired by traditional Rajasthani designs.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Pottery", "Traditional", "Functional"],
      },
      {
        title: "Earth Tones Collection",
        description: "A collection of pottery pieces celebrating natural earth tones and textures.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Pottery", "Natural", "Earthy"],
      },
    ],
  },
  {
    id: "2",
    name: "Rajiv Prajapati",
    artStyle: "Handloom Weaving",
    location: "Varanasi, Uttar Pradesh",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "A master weaver from Varanasi with over 20 years of experience in creating intricate Banarasi silk sarees and textiles.",
    email: "rajiv@example.com",
    phone: "+91 9876543211",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "LinkedIn", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Banarasi Silk Collection",
        description: "Traditional Banarasi silk sarees with intricate gold work.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Handloom", "Silk", "Traditional"],
      },
      {
        title: "Contemporary Scarves",
        description: "Modern scarves with traditional weaving techniques.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Handloom", "Modern", "Accessories"],
      },
    ],
  },
  {
    id: "3",
    name: "Kavya Gupta",
    artStyle: "Block Printing",
    location: "Jaipur, Rajasthan",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "An innovative block printer combining traditional Rajasthani techniques with contemporary designs.",
    email: "kavya@example.com",
    phone: "+91 9876543212",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Floral Block Print Collection",
        description: "Textiles featuring intricate floral block prints using natural dyes.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Block Printing", "Natural Dyes", "Floral"],
      },
    ],
  },
  {
    id: "4",
    name: "Tara Devi",
    artStyle: "Madhubani Painting",
    location: "Madhubani, Bihar",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "A skilled Madhubani artist preserving the ancient art form through vibrant paintings depicting nature and mythology.",
    email: "tara@example.com",
    phone: "+91 9876543213",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Mythological Series",
        description: "Traditional Madhubani paintings depicting scenes from Indian mythology.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Madhubani", "Mythology", "Traditional"],
      },
    ],
  },
  {
    id: "5",
    name: "Ankit Mishra",
    artStyle: "Metal Craft",
    location: "Moradabad, Uttar Pradesh",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "A third-generation metal craftsman specializing in brass and copper work with intricate engravings.",
    email: "ankit@example.com",
    phone: "+91 9876543214",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Engraved Brass Collection",
        description: "Intricately engraved brass items including vases, plates, and decorative pieces.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Metal Craft", "Brass", "Engraving"],
      },
    ],
  },
  {
    id: "6",
    name: "Leela Chand",
    artStyle: "Embroidery",
    location: "Kutch, Gujarat",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "An expert in traditional Kutchi embroidery, creating vibrant textiles that tell stories of rural Gujarat.",
    email: "leela@example.com",
    phone: "+91 9876543215",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Kutchi Mirror Work Collection",
        description: "Traditional embroidery with mirror work on cotton and silk fabrics.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Embroidery", "Mirror Work", "Traditional"],
      },
    ],
  },
  {
    id: "7",
    name: "Arjun Sharma",
    artStyle: "Woodcarving",
    location: "Saharanpur, Uttar Pradesh",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "A skilled woodcarver creating intricate furniture and decorative pieces using traditional techniques.",
    email: "arjun@example.com",
    phone: "+91 9876543216",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Carved Furniture Collection",
        description: "Intricately carved wooden furniture pieces including tables, chairs, and cabinets.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Woodcarving", "Furniture", "Traditional"],
      },
    ],
  },
  {
    id: "8",
    name: "Meera Kumari",
    artStyle: "Terracotta",
    location: "Bankura, West Bengal",
    profileImage: "/placeholder.svg?height=400&width=400",
    bio: "A terracotta artist creating distinctive sculptures and decorative items inspired by rural Bengal.",
    email: "meera@example.com",
    phone: "+91 9876543217",
    website: "https://example.com",
    socialLinks: [
      { platform: "Instagram", url: "#", icon: "/placeholder.svg?height=20&width=20" },
      { platform: "Facebook", url: "#", icon: "/placeholder.svg?height=20&width=20" },
    ],
    works: [
      {
        title: "Bankura Horse Collection",
        description: "Traditional terracotta horses and other animal figurines from Bankura.",
        image: "/placeholder.svg?height=600&width=800",
        thumbnail: "/placeholder.svg?height=200&width=200",
        tags: ["Terracotta", "Sculpture", "Traditional"],
      },
    ],
  },
]

const ArtistsContext = createContext()

export const ArtistsProvider = ({ children }) => {
  const [artists, setArtists] = useState(DUMMY_ARTISTS)

  // Get featured artists (first 4)
  const featuredArtists = artists.slice(0, 4)

  // Get artist by ID
  const getArtistById = (id) => {
    return artists.find((artist) => artist.id === id) || null
  }

  return (
    <ArtistsContext.Provider value={{ artists, featuredArtists, getArtistById }}>{children}</ArtistsContext.Provider>
  )
}

export const useArtists = () => {
  const context = useContext(ArtistsContext)
  if (!context) {
    throw new Error("useArtists must be used within an ArtistsProvider")
  }
  return context
}

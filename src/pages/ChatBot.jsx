"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react"
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Initialize the Gemini API with your key
const genAI = new GoogleGenerativeAI("AIzaSyCq-H6E0eJBKOF66kthg51I-GOIWUVoyh8")

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I can help you with information about government schemes for artisans, courses, and more. How can I help you today?",
      sender: "bot",
    },
  ])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const [isLoading, setIsLoading] = useState(false)
  // We'll fetch context data on demand, not on component mount
  const messagesEndRef = useRef(null)

  // Language options
  const languages = [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "marathi", label: "Marathi" },
    { value: "tamil", label: "Tamil" },
    { value: "bengali", label: "Bengali" },
    { value: "telugu", label: "Telugu" },
  ]

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Function to fetch relevant context based on user query
  const fetchContext = async (userQuery) => {
    try {
      const response = await fetch(`http://localhost:8000/blog/chatbot/context/?query=${encodeURIComponent(userQuery)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch context data")
      }
      return await response.json()
    } catch (error) {
      console.error("Error fetching context:", error)
      return {
        schemes: [],
        courses: [],
        blogs: []
      }
    }
  }

  const prepareContext = (contextData, userInput) => {
    // Always include ALL data regardless of the query
    let context = ""
    
    // Include ALL schemes data
    const allSchemes = contextData.schemes || []
    if (allSchemes.length > 0) {
      context += "Government Schemes Information from our database:\n"
      allSchemes.forEach(scheme => {
        context += `Scheme: ${scheme.title}\nDescription: ${scheme.description}\n`
        if (scheme.category) context += `Category: ${scheme.category}\n`
        if (scheme.tags) context += `Tags: ${scheme.tags}\n`
        context += `\n`
      })
    } else {
      context += "Note: There are no government schemes in our database at the moment.\n\n"
    }
    
    // Include ALL courses data
    const allCourses = contextData.courses || []
    if (allCourses.length > 0) {
      context += "Available Courses Information from our database:\n"
      allCourses.forEach(course => {
        context += `Course: ${course.title}\nDescription: ${course.description}\n`
        if (course.price && course.price !== 'N/A') context += `Price: ${course.price}\n`
        if (course.is_free) context += `This is a free course\n`
        if (course.duration && course.duration !== 'N/A') context += `Duration: ${course.duration}\n`
        if (course.tags) context += `Tags: ${course.tags}\n`
        context += `\n`
      })
    } else {
      context += "Note: There are no courses in our database at the moment.\n\n"
    }
    
    // Include ALL blogs data
    const allBlogs = contextData.blogs || []
    if (allBlogs.length > 0) {
      context += "Blog Articles Information from our database:\n"
      allBlogs.forEach(blog => {
        context += `Article: ${blog.title}\nDescription: ${blog.description}\n`
        if (blog.summary) context += `Summary: ${blog.summary}\n`
        if (blog.content) context += `Content: ${blog.content.substring(0, 200)}...\n`
        if (blog.tags) context += `Tags: ${blog.tags}\n`
        context += `\n`
      })
    } else {
      context += "Note: There are no blog articles in our database at the moment.\n\n"
    }
    
    // Add strict instructions to only answer from provided data
    context += "IMPORTANT INSTRUCTION: You must ONLY answer based on the information provided above. If the information needed to answer the question is not in the provided data, state that you don't have that information in your database. Do not make up or infer information that is not explicitly provided in the context above.\n\n"
    
    // Log the full context for debugging
    console.log("Full context being sent to Gemini API:")
    console.log(context)
    
    return context
  }

  const generateLanguagePrompt = (userInput, context) => {
    const language = selectedLanguage.toLowerCase()
    let prompt = `Question: ${userInput}\n\n`
    
    if (context) {
      prompt += `Context: ${context}\n\n`
    }
    
    if (language === "english") {
      prompt += "Please respond in English."
    } else if (language === "hindi") {
      prompt += "कृपया हिंदी में जवाब दें।"
    } else if (language === "marathi") {
      prompt += "कृपया मराठी मध्ये उत्तर द्या."
    } else if (language === "tamil") {
      prompt += "தயவுசெய்து தமிழில் பதிலளிக்கவும்."
    } else if (language === "bengali") {
      prompt += "অনুগ্রহ করে বাংলায় উত্তর দিন।"
    } else if (language === "telugu") {
      prompt += "దయచేసి తెలుగులో సమాధానం ఇవ్వండి."
    }
    
    return prompt
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === "" || isLoading) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Fetch relevant context data
      console.log("Fetching context data for query:", input)
      const contextData = await fetchContext(input)
      
      // Prepare context from fetched data
      const context = prepareContext(contextData, input)
      console.log("Context prepared:", context ? "Context available" : "No relevant context")
      
      // Generate prompt with language instruction
      const prompt = generateLanguagePrompt(input, context)
      
      try {
        // Try the most advanced model first
        console.log("Trying with gemini-1.5-flash model")
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          safetySettings 
        })
        
        // Generate content directly - using generateContent is more reliable than chat for one-off queries
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        
        console.log("Received response from Gemini API (1.5-flash)")
        
        // Add bot response
        const botResponse = {
          id: messages.length + 2,
          text: text,
          sender: "bot",
        }

        setMessages((prev) => [...prev, botResponse])

        // If text-to-speech is enabled, speak the response
        if (isSpeaking) {
          speakText(text)
        }
      } catch (apiError) {
        console.error("Gemini API Error with 1.5-flash:", apiError)
        
        // Try with gemini-pro model as fallback
        try {
          console.log("Trying fallback to gemini-pro model")
          const fallbackModel = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            safetySettings 
          })
          
          const result = await fallbackModel.generateContent(prompt)
          const text = result.response.text()
          
          console.log("Received response from fallback Gemini API (gemini-pro)")
          
          const botResponse = {
            id: messages.length + 2,
            text: text,
            sender: "bot",
          }

          setMessages((prev) => [...prev, botResponse])

          // If text-to-speech is enabled, speak the response
          if (isSpeaking) {
            speakText(text)
          }
        } catch (fallbackError) {
          console.error("Fallback API Error:", fallbackError)
          
          // Add more specific error message
          let errorMessage = "I'm sorry, I encountered an error while generating a response."
          
          if (apiError.message) {
            if (apiError.message.includes("404")) {
              errorMessage = "Error: The model was not found. This may be due to using a model name that doesn't exist."
            } else if (apiError.message.includes("403")) {
              errorMessage = "Error: The API key may be invalid or doesn't have permission to access this model."
            } else if (apiError.message.includes("429")) {
              errorMessage = "The API usage limit has been reached. Please try again later."
            } else {
              errorMessage = `Error: ${apiError.message}`
            }
          }
          
          const errorResponse = {
            id: messages.length + 2,
            text: errorMessage,
            sender: "bot",
          }
          
          setMessages((prev) => [...prev, errorResponse])
        }
      }
      
    } catch (error) {
      console.error("General error in chat processing:", error)
      
      // Add error message
      const errorResponse = {
        id: messages.length + 2,
        text: "I'm sorry, something went wrong with the chat processing. Please try again.",
        sender: "bot",
      }
      
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  // Function for speech recognition
  const toggleRecording = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 
                           selectedLanguage === 'marathi' ? 'mr-IN' : 
                           'en-US'
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsRecording(false)
        }
        
        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error)
          setIsRecording(false)
        }
        
        recognition.onend = () => {
          setIsRecording(false)
        }
        
        recognition.start()
      } else {
        alert("Speech recognition is not supported in your browser")
        setIsRecording(false)
      }
    }
  }

  // Function for text-to-speech
  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking)
  }

  // Function to speak text
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance()
      speech.text = text
      
      // Set language based on selection
      speech.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 
                   selectedLanguage === 'marathi' ? 'mr-IN' : 
                   'en-US'
      
      window.speechSynthesis.speak(speech)
    }
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold">AI Assistant</h1>
            <div className="flex items-center space-x-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm p-2 border border-gray-300 rounded-md"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSpeaking}
                className={`p-2 rounded-full ${isSpeaking ? "bg-black text-white" : "bg-gray-200"}`}
                aria-label={isSpeaking ? "Disable text-to-speech" : "Enable text-to-speech"}
              >
                {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="h-96 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3/4 p-3 rounded-lg ${
                    message.sender === "user" ? "bg-black text-white rounded-tr-none" : "bg-gray-100 rounded-tl-none"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-full mr-2 ${isRecording ? "bg-red-500 text-white" : "bg-gray-200"}`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="p-2 bg-black text-white rounded-full ml-2 disabled:opacity-50"
              disabled={input.trim() === "" || isLoading}
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">What government schemes are available for artisans?</h3>
              <p className="text-gray-600 mt-1">
                There are several schemes including pension benefits, medical aid, marketing assistance, and financial
                support for tools and equipment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How can I register for WhatsApp updates?</h3>
              <p className="text-gray-600 mt-1">
                Visit our WhatsApp Registration page and follow the simple steps to start receiving updates directly on
                WhatsApp.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">What courses are available for traditional crafts?</h3>
              <p className="text-gray-600 mt-1">
                We offer courses in pottery, handloom weaving, jewelry making, block printing, and traditional painting
                techniques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot


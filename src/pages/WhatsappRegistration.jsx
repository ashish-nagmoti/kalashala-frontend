"use client"

import { useState } from "react"
import { Check } from "lucide-react"

const WhatsappRegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    artForm: "",
    location: "",
    experience: "",
    interests: [],
  })

  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const artForms = [
    "Pottery",
    "Handloom Weaving",
    "Jewelry Making",
    "Block Printing",
    "Painting",
    "Woodwork",
    "Metalwork",
    "Embroidery",
    "Other",
  ]

  const interestOptions = [
    "Government Schemes",
    "Courses & Training",
    "Marketing Opportunities",
    "Exhibitions",
    "Connecting with Buyers",
    "Funding Opportunities",
    "Material Suppliers",
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleInterestChange = (interest) => {
    setFormData((prev) => {
      const interests = [...prev.interests]

      if (interests.includes(interest)) {
        return {
          ...prev,
          interests: interests.filter((item) => item !== interest),
        }
      } else {
        return {
          ...prev,
          interests: [...interests, interest],
        }
      }
    })
  }

  const nextStep = () => {
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, you would send the data to your backend here
    console.log("Form submitted:", formData)
    setIsSubmitted(true)
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-gray-100 border-b">
            <h1 className="text-2xl font-bold">WhatsApp Registration</h1>
            <p className="text-gray-600">
              Register to receive updates, information about schemes, and connect with buyers through WhatsApp.
            </p>
          </div>

          {!isSubmitted ? (
            <div className="p-6">
              {/* Progress Steps */}
              <div className="flex justify-between mb-8">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step >= item ? "bg-black text-white" : "bg-gray-200"
                      }`}
                    >
                      {step > item ? <Check className="w-5 h-5" /> : item}
                    </div>
                    <span className="text-xs mt-1">
                      {item === 1 ? "Personal Info" : item === 2 ? "Professional Info" : "Interests"}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 1234567890"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="pt-4">
                      <button type="button" onClick={nextStep} className="btn-primary w-full">
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="artForm" className="block text-sm font-medium mb-1">
                        Primary Art Form *
                      </label>
                      <select
                        id="artForm"
                        name="artForm"
                        value={formData.artForm}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Select your art form</option>
                        {artForms.map((form) => (
                          <option key={form} value={form}>
                            {form}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-1">
                        Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="City, State"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium mb-1">
                        Years of Experience
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Select experience</option>
                        <option value="0-2">0-2 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="10+">More than 10 years</option>
                      </select>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={prevStep} className="btn-secondary">
                        Back
                      </button>
                      <button type="button" onClick={nextStep} className="btn-primary">
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        I'm interested in receiving updates about: (Select all that apply)
                      </label>
                      <div className="space-y-2">
                        {interestOptions.map((interest) => (
                          <label key={interest} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.interests.includes(interest)}
                              onChange={() => handleInterestChange(interest)}
                              className="mr-2"
                            />
                            {interest}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-gray-600 mb-4">
                        By submitting this form, you agree to receive WhatsApp messages from KalaRush. You can
                        unsubscribe at any time.
                      </p>

                      <div className="flex justify-between">
                        <button type="button" onClick={prevStep} className="btn-secondary">
                          Back
                        </button>
                        <button type="submit" className="btn-primary">
                          Register
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">
                You have successfully registered for WhatsApp updates. You will start receiving messages shortly.
              </p>
              <div className="flex justify-center">
                <a href="/" className="btn-primary">
                  Return to Home
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Benefits of WhatsApp Registration</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Receive timely updates about new government schemes</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Get notified about upcoming exhibitions and fairs</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Connect directly with potential buyers</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Access exclusive courses and training opportunities</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Receive personalized recommendations based on your art form</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WhatsappRegistration


'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Wand2, Upload, ChevronDown } from 'lucide-react';

export default function AIDesignTool() {
  const [activeTab, setActiveTab] = useState('sketch');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [imageCount, setImageCount] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'sketch', label: 'Sketch to Render' },
    { id: 'elevation', label: 'Elevation to Render' },
    { id: 'exterior', label: 'Exterior Design' },
    { id: 'interior', label: 'Interior Design' }
  ];

  const styleOptions = {
    sketch: [
      { name: 'Realistic', image: '/images/styles/realistic.jpg' },
      { name: 'Night', image: '/images/styles/night.jpg' },
      { name: 'Snow', image: '/images/styles/snow.jpg' },
      { name: 'Rain', image: '/images/styles/rain.jpg' }
    ],
    elevation: [
      { name: 'Realistic', image: '/images/styles/realistic.jpg' },
      { name: 'Night', image: '/images/styles/night.jpg' },
      { name: 'Snow', image: '/images/styles/snow.jpg' },
      { name: 'Rain', image: '/images/styles/rain.jpg' }
    ],
    exterior: [
      { name: 'Realistic', image: '/images/styles/realistic.jpg' },
      { name: 'Night', image: '/images/styles/night.jpg' },
      { name: 'Snow', image: '/images/styles/snow.jpg' },
      { name: 'Rain', image: '/images/styles/rain.jpg' }
    ],
    interior: [
      { name: 'Modern', image: '/images/styles/modern.jpg' },
      { name: 'Minimalist', image: '/images/styles/minimalist.jpg' },
      { name: 'Neoclassical', image: '/images/styles/neoclassical.jpg' },
      { name: 'Industrial', image: '/images/styles/industrial.jpg' }
    ]
  };

  const sampleImages = [
    '/images/sample1.jpg',
    '/images/sample2.jpg', 
    '/images/sample3.jpg'
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedStyle(styleOptions[tabId as keyof typeof styleOptions][0].name);
    setIsStyleDropdownOpen(false);
  };

  const handleSampleImageSelect = (imageUrl: string) => {
    setUploadedImage(imageUrl);
  };

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    setIsStyleDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStyleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-3 max-w-4xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 border whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 border-purple-600'
                      : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50 border-slate-200 hover:border-purple-200 bg-white'
                    }
                  `}
                >
                  <span className="text-center leading-tight">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - 30% */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 space-y-6">
              {/* Image Style Dropdown */}
              <div className="space-y-3">
                <h3 className="text-slate-800 font-semibold text-sm">Image Style</h3>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-left text-slate-800 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-600 text-xs font-bold">
                          {selectedStyle.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{selectedStyle}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isStyleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isStyleDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {styleOptions[activeTab as keyof typeof styleOptions].map((style) => (
                        <button
                          key={style.name}
                          onClick={() => handleStyleSelect(style.name)}
                          className={`
                            w-full p-3 text-left text-sm transition-all duration-200 hover:bg-purple-50 border-b border-slate-100 last:border-b-0 flex items-center space-x-3
                            ${selectedStyle === style.name
                              ? 'bg-purple-50 text-purple-600 font-medium'
                              : 'text-slate-700 hover:text-purple-600'
                            }
                          `}
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-600 text-xs font-bold">
                              {style.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span>{style.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Box */}
              <div className="space-y-3">
                <div className={`
                  border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer
                  ${uploadedImage 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
                  }
                `}>
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-16 h-16 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-purple-600 text-sm font-medium">Image uploaded</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm font-medium">Add or Drop Image</p>
                    </>
                  )}
                </div>

                {/* Sample Images */}
                <div className="space-y-2">
                  <p className="text-slate-600 text-xs">Or choose sample images:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleSampleImageSelect(image)}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-purple-400 transition-all duration-200 transform hover:scale-105"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                          <span className="text-slate-500 text-xs">Sample {index + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-3">
                <label className="text-slate-800 font-semibold text-sm">Scene Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the scene"
                  className="w-full h-24 bg-white border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
                <p className="text-slate-500 text-xs">
                  Include subject, materials, details, location, lighting and other elements in your description
                </p>
              </div>

              {/* Generation Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-slate-800 font-semibold text-sm">Generation Count</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setImageCount(count)}
                        className={`
                          w-12 h-12 rounded-xl text-sm font-semibold transition-all duration-200 border
                          ${imageCount === count
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600 shadow-lg'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                          }
                        `}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Generate
                  <span className="ml-2 text-xs opacity-90">1 Credit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - 70% */}
          <div className="lg:col-span-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 h-full min-h-[600px]">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl">
                    <Wand2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    Your creation will appear here
                  </h3>
                  <p className="text-slate-600 text-lg max-w-md mx-auto">
                    Upload an image and describe your vision to generate amazing AI-powered designs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
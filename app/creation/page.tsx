'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Upload } from 'lucide-react';

export default function AIDesignTool() {
  const [activeTab, setActiveTab] = useState('text');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [imageCount, setImageCount] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'text', label: 'Text to Render' },
    { id: 'sketch', label: 'Sketch to Render' },
    { id: 'elevation', label: 'Elevation to Render' },
    { id: 'exterior', label: 'Exterior Design' },
    { id: 'interior', label: 'Interior Design' }
  ];

  const styleOptions = {
    sketch: [
      { name: 'Realistic', image: '/icons/Realistic_Icon@2x.webp' },
      { name: 'Night', image: '/icons/Night_Icon@2x.webp' },
      { name: 'Snow', image: '/icons/Snow_Icon@2x.webp' },
      { name: 'Rain', image: '/icons/Rain_Icon@2x.webp' }
    ],
    text: [
      { name: 'Realistic', image: '/icons/Realistic_Icon@2x.webp' },
      { name: 'Night', image: '/icons/Night_Icon@2x.webp' },
      { name: 'Snow', image: '/icons/Snow_Icon@2x.webp' },
      { name: 'Rain', image: '/icons/Rain_Icon@2x.webp' }
    ],
    elevation: [
      { name: 'Realistic', image: '/icons/Realistic_Icon@2x.webp' },
      { name: 'Night', image: '/icons/Night_Icon@2x.webp' },
      { name: 'Snow', image: '/icons/Snow_Icon@2x.webp' },
      { name: 'Rain', image: '/icons/Rain_Icon@2x.webp' }
    ],
    exterior: [
      { name: 'Realistic', image: '/icons/Realistic_Icon@2x.webp' },
      { name: 'Night', image: '/icons/Night_Icon@2x.webp' },
      { name: 'Snow', image: '/icons/Snow_Icon@2x.webp' },
      { name: 'Rain', image: '/icons/Rain_Icon@2x.webp' }
    ],
    interior: [
      { name: 'Modern', image: '/icons/Modern_Icon@2x.webp' },
      { name: 'Minimalist', image: '/icons/Minimalist_Icon@2x.webp' },
      { name: 'Neoclassical', image: '/icons/Neoclassical_Icon@2x.webp' },
      { name: 'Industrial', image: '/icons/Industrial_Icon@2x.webp' }
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

  // Get the image for currently selected style
  const getCurrentStyleImage = () => {
    const currentStyles = styleOptions[activeTab as keyof typeof styleOptions];
    const currentStyle = currentStyles.find(style => style.name === selectedStyle);
    return currentStyle?.image || '/icons/Realistic_Icon@2x.webp';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Create file URL for preview
      const fileUrl = URL.createObjectURL(file);
      setUploadedImage(fileUrl);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
    <div className="min-h-screen bg-background">
      {/* Top Navigation Tabs */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="md:flex md:justify-center">
            <div className="w-[calc(100vw-2rem)] md:w-auto overflow-auto max-w-full py-2 -my-2">
              <div role="group" className="grid grid-flow-col gap-0.5 items-center rounded-lg bg-muted font-medium text-sm w-max p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="radio"
                    aria-checked={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      outline-none transition-all cursor-pointer flex items-center justify-center gap-1 rounded-md h-full border-2 border-solid border-transparent hover:bg-primary/10 focus-visible:border-primary focus-visible:bg-transparent disabled:bg-muted disabled:text-muted-foreground disabled:pointer-events-none py-1.5 px-3.5 font-medium text-xs sm:text-sm whitespace-nowrap
                      ${activeTab === tab.id
                        ? '!bg-primary !text-white shadow-sm hover:!bg-primary focus-visible:!bg-primary'
                        : 'bg-transparent text-foreground hover:text-primary'
                      }
                    `}
                    style={activeTab === tab.id ? {
                      backgroundColor: 'hsl(262.1, 88.3%, 57.8%)',
                      color: 'white',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    } : undefined}
                  >
                    <span className="text-center leading-tight">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Controls Panel - Left side on PC, Top on mobile */}
          <div className="w-full lg:w-1/3 space-y-4 sm:space-y-6">
            <div className="bg-card backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Image Style */}
              <div className="space-y-3 relative">
                <button 
                  data-testid="image-style-trigger" 
                  className="flex items-center justify-start w-full min-h-[58px] rounded-lg gap-2 bg-muted border border-border border-solid p-0 cursor-pointer group focus-visible:outline-primary outline-none hover:border-primary/50 transition-all duration-200"
                  onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                >
                  <img
                    src={getCurrentStyleImage()}
                    alt="Image"
                    className="w-[76px] min-h-[58px] h-full object-cover rounded-l-lg aspect-square"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                  <div className="w-[76px] min-h-[58px] h-full bg-gradient-to-br from-muted to-muted/80 rounded-l-lg aspect-square flex items-center justify-center hidden">
                    <span className="text-muted-foreground text-xs font-bold">
                      {selectedStyle.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 w-full gap-[2px] items-start py-2">
                    <p className="m-0 font-bold text-sm text-muted-foreground group-hover:text-foreground">Image Style</p>
                    <p className="m-0 text-sm text-foreground">{selectedStyle}</p>
                  </div>
                  <svg 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4 mr-2 text-muted-foreground" 
                    height="1em" 
                    width="1em" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </div>

              {/* Upload Box - Hide for Text to Render */}
              {activeTab !== 'text' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={handleUploadClick}
                    className={`
                      border-2 border-dashed rounded-2xl text-center transition-all duration-200 cursor-pointer
                      ${uploadedImage
                        ? 'border-primary/50 bg-primary/5 p-4'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5 p-6'
                      }
                    `}
                  >
                    {uploadedImage ? (
                      <div className="space-y-3">
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-xl mx-auto shadow-lg"
                        />
                        <div className="space-y-1">
                          <p className="text-primary text-sm font-medium">Image uploaded</p>
                          <p className="text-muted-foreground text-xs">Click to change image</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-foreground text-sm font-medium">Add or Drop Image</p>
                      </>
                    )}
                  </div>

                  {/* Sample Images */}
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs">Or choose sample images:</p>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {sampleImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => handleSampleImageSelect(image)}
                          className="aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all duration-200 transform hover:scale-105"
                        >
                          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">Sample {index + 1}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium">Aspect Ratio</label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-md border transition-all duration-200 border-primary bg-primary/10" title="Landscape">
                      <div className="w-4 h-2.5 rounded-sm border transition-colors border-primary bg-primary"></div>
                    </button>
                    <button className="p-1.5 rounded-md border transition-all duration-200 border-border bg-background hover:border-primary/50" title="Portrait">
                      <div className="w-2.5 h-3.5 rounded-sm border transition-colors border-muted-foreground bg-transparent"></div>
                    </button>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button className="w-8 h-8 rounded-full border text-xs font-medium transition-all duration-200 border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground" title="1:1 - Square">1:1</button>
                    <button className="w-8 h-8 rounded-full border text-xs font-medium transition-all duration-200 border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground" title="4:3 - Standard">4:3</button>
                    <button className="w-8 h-8 rounded-full border text-xs font-medium transition-all duration-200 border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground" title="3:2 - Photo">3:2</button>
                    <button className="w-8 h-8 rounded-full border text-xs font-medium transition-all duration-200 border-primary bg-primary text-primary-foreground shadow-sm" title="16:9 - Widescreen">16:9</button>
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-3">
                <label className="text-foreground font-semibold text-sm flex items-center gap-2">
                  Scene Description
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the scene"
                  className="w-full h-24 bg-background border border-border rounded-xl p-3 text-foreground placeholder-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
                <p className="text-muted-foreground text-xs">
                  Include subject, materials, details, location, lighting and other elements in your description
                </p>
              </div>

              {/* Generation Controls */}
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-foreground font-semibold text-sm">Generation Count</label>
                  <div className="flex space-x-1.5 sm:space-x-2">
                    {[1, 2, 3, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setImageCount(count)}
                        className={`
                          w-10 h-10 sm:w-12 sm:h-12 rounded-xl text-sm font-semibold transition-all duration-200 border
                          ${imageCount === count
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                            : 'bg-background text-foreground border-border hover:border-primary hover:bg-primary/5'
                          }
                        `}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 sm:py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Generate
                  <span className="ml-2 text-xs opacity-90">1 Credit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel - Right side on PC, Bottom on mobile */}
          <div className="w-full lg:w-2/3">
            <div className="bg-card backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-border p-4 sm:p-8 h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
              {/* Placeholder content centered */}
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-xl">
                  <Wand2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                  Your creation will appear here
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
                  Upload an image and describe your vision to generate amazing AI-powered designs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style Selection Modal */}
      {isStyleDropdownOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsStyleDropdownOpen(false)}>
          <div className="bg-card rounded-xl shadow-xl border border-border p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Choose Style</h3>
              <button 
                onClick={() => setIsStyleDropdownOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {styleOptions[activeTab as keyof typeof styleOptions].map((style) => (
                <button
                  key={style.name}
                  onClick={() => handleStyleSelect(style.name)}
                  className={`
                    p-3 rounded-lg border transition-all duration-200 group
                    ${selectedStyle === style.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }
                  `}
                >
                  <div className="w-full h-24 rounded-md relative border-none before:content-[''] before:border-2 before:border-primary/20 before:border-solid before:rounded-[6px] before:absolute before:w-[calc(100%+2px)] before:h-[calc(100%+2px)] before:top-[-3px] before:left-[-3px] mb-2">
                    <img 
                      className="w-full h-full object-cover rounded-md" 
                      src={style.image} 
                      alt={style.name}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-muted', 'to-muted/80');
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-muted-foreground text-xs font-bold flex items-center justify-center h-full">${style.name.slice(0, 2).toUpperCase()}</span>`;
                      }}
                    />
                  </div>
                  <p className={`text-sm font-medium ${selectedStyle === style.name ? 'text-primary' : 'text-foreground'}`}>
                    {style.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
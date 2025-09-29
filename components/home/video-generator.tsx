'use client'

import { useState } from 'react'
import { Image, Video, ChevronDown, Type } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { LoginDialog } from '@/components/auth/login-dialog'
import { SegmentedControl, SegmentedControlOption } from '@/components/ui/segmented-control'

type GenerationMode = 'image-to-video' | 'text-to-video'

export default function VideoGenerator() {
  const { user } = useUser()

  // Mode selection
  const [generationMode, setGenerationMode] = useState<GenerationMode>('text-to-video')

  // Image to Video states
  const [characterImage, setCharacterImage] = useState<File | null>(null)
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null)

  // Text to Video states
  const [textPrompt, setTextPrompt] = useState('')

  // Common states
  const [quality, setQuality] = useState('Standard')
  const [resolution, setResolution] = useState('1080p')
  const [duration, setDuration] = useState('5')
  const [mode, setMode] = useState('Character Replacement')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const modeOptions: SegmentedControlOption[] = [
    { value: 'image-to-video', label: 'Image to video' },
    { value: 'text-to-video', label: 'Text to video' }
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCharacterImage(file)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setReferenceVideo(file)
    }
  }

  const handleClearAll = () => {
    setCharacterImage(null)
    setReferenceVideo(null)
    setTextPrompt('')
    setQuality('Standard')
    setResolution('1080p')
    setDuration('5')
    setMode('Character Replacement')
  }

  const handleAnimate = () => {
    if (generationMode === 'image-to-video') {
      if (!characterImage || !referenceVideo) return
    } else {
      if (!textPrompt.trim()) return
    }

    setIsGenerating(true)
    // Animation logic will be implemented here
    setTimeout(() => {
      setIsGenerating(false)
    }, 3000)
  }


  const canAnimate = generationMode === 'image-to-video'
    ? (characterImage && referenceVideo && !isGenerating)
    : (textPrompt.trim() && !isGenerating)

  return (
    <div id="video-generator" className="w-full max-w-7xl mx-auto p-6 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-sm shadow-2xl">
      {/* Mode Selector */}
      <div className="mb-8 flex justify-center">
        <SegmentedControl
          options={modeOptions}
          value={generationMode}
          onChange={(value) => setGenerationMode(value as GenerationMode)}
          className="shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <div className="space-y-8">
          {generationMode === 'text-to-video' ? (
            // Text to Video Mode
            <>
              {/* Text Prompt Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  VIDEO DESCRIPTION
                </label>
                <div className="border-2 border-dashed border-gray-200 dark:border-input rounded-xl p-6 bg-white/50 dark:bg-input/20">
                  <div className="flex flex-col items-center">
                    <Type className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3" />
                    <textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Describe the video you want to create... (e.g., 'A majestic dragon soaring through clouds at sunset, cinematic lighting')"
                      className="w-full min-h-[120px] resize-none bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 text-center"
                      maxLength={800}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {textPrompt.length}/800 characters
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Image to Video Mode
            <>
              {/* Character Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  UPLOAD CHARACTER STILL
                </label>
                <input
                  accept="image/*"
                  className="hidden"
                  id="ai-generator-image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="ai-generator-image-upload"
                  className="block border-2 border-dashed border-gray-200 dark:border-input rounded-xl p-8 text-center cursor-pointer transition-all duration-300 bg-white/50 dark:bg-input/20 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                  <div className="flex flex-col items-center">
                    <Image className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {characterImage ? characterImage.name : "Drop a character portrait here, or click to upload"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Supports JPG/PNG up to 10MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Reference Video Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  UPLOAD REFERENCE VIDEO
                </label>
                <input
                  accept="video/*"
                  className="hidden"
                  id="ai-generator-video-upload"
                  type="file"
                  onChange={handleVideoUpload}
                />
                <label
                  htmlFor="ai-generator-video-upload"
                  className="block border-2 border-dashed border-gray-200 dark:border-input rounded-xl p-8 text-center cursor-pointer transition-all duration-300 bg-white/50 dark:bg-input/20 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                  <div className="flex flex-col items-center">
                    <Video className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      {referenceVideo ? referenceVideo.name : "Drop a performance reference video, or click to upload"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Supports MP4/MOV up to 50MB
                    </p>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* Settings */}
          <div className="mt-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:bg-gradient-to-br dark:from-gray-900/40 dark:to-gray-800/20 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Resolution Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Video Quality
                  </label>
                  <div className="relative">
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full appearance-none border border-input rounded-md bg-transparent px-3 py-2 text-sm dark:bg-input/30 dark:hover:bg-input/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="480p">480p - Standard</option>
                      <option value="720p">720p - High</option>
                      <option value="1080p">1080p - Premium</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                  </div>
                </div>

                {generationMode === 'text-to-video' ? (
                  /* Duration Selector for Text to Video */
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </label>
                    <div className="relative">
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full appearance-none border border-input rounded-md bg-transparent px-3 py-2 text-sm dark:bg-input/30 dark:hover:bg-input/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="5">5 seconds</option>
                        <option value="10">10 seconds</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                    </div>
                  </div>
                ) : (
                  /* Mode Selector for Image to Video */
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mode
                    </label>
                    <div className="relative">
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full appearance-none border border-input rounded-md bg-transparent px-3 py-2 text-sm dark:bg-input/30 dark:hover:bg-input/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="Character Replacement">Character Replacement</option>
                        <option value="Face Swap">Face Swap</option>
                        <option value="Motion Transfer">Motion Transfer</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Cost Estimate */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                  Estimated cost
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {(() => {
                      const baseCredits = duration === '5' ? 1 : 2;
                      const resolutionMultiplier = resolution === '480p' ? 1 : resolution === '720p' ? 1.5 : 2;
                      const totalCredits = Math.ceil(baseCredits * resolutionMultiplier);
                      return `${totalCredits} credit${totalCredits === 1 ? '' : 's'} (${resolution}, ${duration}s)`;
                    })()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    480p: 1x • 720p: 1.5x • 1080p: 2x base cost
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleClearAll}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-background dark:bg-input/30 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md text-sm font-medium transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleAnimate}
              disabled={!canAnimate}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                canAnimate
                  ? 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

        </div>

        {/* Right Panel - Preview */}
        <div className="relative lg:pl-8">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block"></div>

          <div className="flex items-center justify-between mb-3 gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              GENERATION PREVIEW
            </label>
            <button
              disabled={!canAnimate}
              className="px-4 py-2 border border-gray-200 dark:border-input bg-background dark:bg-input/30 hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Run in background
            </button>
          </div>

          <div className="h-[600px] relative">
            <div className="absolute inset-0 bg-gray-50 dark:bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                <div className="mb-6">
                  <Video className="w-20 h-20 text-gray-400 dark:text-muted-foreground" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg text-center">
                  {isGenerating
                    ? `Generating your ${generationMode === 'text-to-video' ? 'text-to-video' : 'animation'}...`
                    : `Preview frames will appear here after the ${generationMode === 'text-to-video' ? 'video generation' : 'animation'} job finishes`
                  }
                </p>
                {isGenerating && (
                  <div className="mt-4 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-600 to-purple-600 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </div>
  )
}
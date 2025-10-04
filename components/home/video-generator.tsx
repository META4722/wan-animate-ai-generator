'use client'

import { useState, useEffect } from 'react'
import { Image, Video, ChevronDown, Type, Music } from 'lucide-react'
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
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null)
  const [imagePrompt, setImagePrompt] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)

  // Text to Video states
  const [textPrompt, setTextPrompt] = useState('')

  // Common states
  const [quality, setQuality] = useState('Standard')
  const [resolution, setResolution] = useState('1080p')
  const [duration, setDuration] = useState('5')
  const [mode, setMode] = useState('Character Replacement')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [generationResult, setGenerationResult] = useState<any>(null)

  const modeOptions: SegmentedControlOption[] = [
    { value: 'image-to-video', label: 'Image to video' },
    { value: 'text-to-video', label: 'Text to video' }
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCharacterImage(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setCharacterImagePreview(previewUrl)
    }
  }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setAudioPreview(previewUrl)
    }
  }

  const handleClearAll = () => {
    // Clean up preview URLs to prevent memory leaks
    if (characterImagePreview) {
      URL.revokeObjectURL(characterImagePreview)
    }
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview)
    }

    setCharacterImage(null)
    setCharacterImagePreview(null)
    setImagePrompt('')
    setAudioFile(null)
    setAudioPreview(null)
    setTextPrompt('')
    setQuality('Standard')
    setResolution('1080p')
    setDuration('5')
    setMode('Character Replacement')
    setGenerationStatus(null)
    setGenerationError(null)
    setIsGenerating(false)
  }

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (characterImagePreview) {
        URL.revokeObjectURL(characterImagePreview)
      }
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview)
      }
    }
  }, [characterImagePreview, audioPreview])

  const handleAnimate = async () => {
    // Clear previous status/errors
    setGenerationStatus(null)
    setGenerationError(null)
    setGeneratedVideoUrl(null)
    setGenerationResult(null)

    // Check authentication first
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    // Validate inputs based on mode
    if (generationMode === 'image-to-video') {
      if (!characterImage) {
        setGenerationError('Please upload a character image')
        return
      }
      if (!imagePrompt.trim()) {
        setGenerationError('Please enter a prompt describing the desired video motion')
        return
      }
    } else {
      if (!textPrompt.trim()) {
        setGenerationError('Please enter a text description for your video')
        return
      }
    }

    setIsGenerating(true)
    setGenerationStatus('Starting video generation...')

    try {
      let response;

      if (generationMode === 'text-to-video') {
        // Call text-to-video API
        setGenerationStatus('Processing text-to-video request...')
        response = await fetch('/api/wan25/text-to-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: textPrompt,
            aspect_ratio: '16:9',
            resolution: resolution,
            duration: parseInt(duration),
            enable_prompt_expansion: true,
            negative_prompt: "low resolution, error, worst quality, low quality, defects"
          })
        })
      } else {
        // For image-to-video, we need to upload files first
        setGenerationStatus('Uploading character image...')

        // Upload character image
        if (!characterImage) {
          throw new Error('No character image selected')
        }

        const imageFormData = new FormData()
        imageFormData.append('file', characterImage)
        imageFormData.append('type', 'image')

        const imageUploadResponse = await fetch('/api/wan25/upload', {
          method: 'POST',
          body: imageFormData
        })

        if (!imageUploadResponse.ok) {
          const errorData = await imageUploadResponse.json()
          console.error('Image upload failed:', errorData)
          throw new Error(errorData.error || 'Failed to upload character image')
        }

        const imageUploadResult = await imageUploadResponse.json()
        console.log('Image uploaded successfully:', imageUploadResult)
        const imageUrl = imageUploadResult.url

        // Upload audio if provided
        let audioUrl: string | undefined = undefined
        if (audioFile) {
          setGenerationStatus('Uploading audio file...')
          const audioFormData = new FormData()
          audioFormData.append('file', audioFile)
          audioFormData.append('type', 'audio')

          const audioUploadResponse = await fetch('/api/wan25/upload', {
            method: 'POST',
            body: audioFormData
          })

          if (!audioUploadResponse.ok) {
            const errorData = await audioUploadResponse.json()
            console.error('Audio upload failed:', errorData)
            throw new Error(errorData.error || 'Failed to upload audio file')
          }

          const audioUploadResult = await audioUploadResponse.json()
          console.log('Audio uploaded successfully:', audioUploadResult)
          audioUrl = audioUploadResult.url
        }

        // Now submit to image-to-video API
        setGenerationStatus('Processing video generation...')
        const requestBody: any = {
          prompt: imagePrompt,
          image_url: imageUrl,
          aspect_ratio: '16:9',
          resolution: resolution,
          duration: parseInt(duration),
          negative_prompt: "low resolution, error, worst quality, low quality, defects",
          enable_prompt_expansion: true
        }

        if (audioUrl) {
          requestBody.audio_url = audioUrl
        }

        response = await fetch('/api/wan25/image-to-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })
      }

      let result;
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError)
        const text = await response.text()
        console.error('Response text:', text)
        setGenerationError(`Server error (${response.status}): Unable to parse response`)
        return
      }

      console.log('API Response Status:', response.status)
      console.log('API Response:', result)

      if (response.ok) {
        // Success - handle the response
        console.log('Generation completed successfully:', result)
        setGenerationResult(result)
        setGeneratedVideoUrl(result.video?.url || result.video)
        setGenerationStatus(`✅ Video generated successfully! ${result.actual_prompt ? `\nPrompt: ${result.actual_prompt}` : ''}`)

        // Show success message but don't redirect
        console.log('Video URL:', result.video?.url || result.video)
        console.log('Full result:', result)
      } else {
        // Handle errors
        console.error('Generation failed with status:', response.status)
        console.error('Error details:', result)
        const errorMessage = result.error || result.message || result.details || 'Failed to start video generation. Please try again.'
        setGenerationError(`Error (${response.status}): ${errorMessage}`)
      }

    } catch (error) {
      console.error('Network error:', error)
      setGenerationError('Network error: Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }


  const canAnimate = generationMode === 'image-to-video'
    ? (characterImage && imagePrompt.trim() && !isGenerating)
    : (textPrompt.trim() && !isGenerating)

  // Allow clicking Generate button even when not logged in to show login dialog
  const canClickGenerate = generationMode === 'image-to-video'
    ? (characterImage && imagePrompt.trim() && !isGenerating)
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
                  {characterImagePreview ? (
                    // Show image preview
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4 max-w-full">
                        <img
                          src={characterImagePreview}
                          alt="Character preview"
                          className="w-full max-w-sm h-auto object-contain rounded-lg border-2 border-primary/50 dark:border-primary/50 shadow-lg"
                          style={{ maxHeight: '400px' }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            // Clean up preview URL
                            if (characterImagePreview) {
                              URL.revokeObjectURL(characterImagePreview)
                            }
                            setCharacterImage(null)
                            setCharacterImagePreview(null)
                          }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 transition-colors shadow-md"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium text-center break-all px-4">
                        {characterImage?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    // Show upload prompt
                    <div className="flex flex-col items-center">
                      <Image className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-1">
                        Drop a character portrait here, or click to upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        JPG/PNG • Min 360x360, Max 2000x2000 • Up to 25MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Motion Prompt Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  MOTION DESCRIPTION
                </label>
                <div className="border-2 border-dashed border-gray-200 dark:border-input rounded-xl p-6 bg-white/50 dark:bg-input/20">
                  <div className="flex flex-col items-center">
                    <Type className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3" />
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Describe the desired video motion... (e.g., 'Character walking forward with confident stride, camera slowly zooming in')"
                      className="w-full min-h-[120px] resize-none bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 text-center"
                      maxLength={800}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {imagePrompt.length}/800 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Audio Upload (Optional) */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  BACKGROUND MUSIC <span className="text-gray-500 dark:text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  accept="audio/wav,audio/mp3,audio/mpeg"
                  className="hidden"
                  id="ai-generator-audio-upload"
                  type="file"
                  onChange={handleAudioUpload}
                />
                <label
                  htmlFor="ai-generator-audio-upload"
                  className="block border-2 border-dashed border-gray-200 dark:border-input rounded-xl p-8 text-center cursor-pointer transition-all duration-300 bg-white/50 dark:bg-input/20 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
                >
                  {audioPreview ? (
                    // Show audio preview
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4 w-full max-w-sm">
                        <audio
                          src={audioPreview}
                          controls
                          className="w-full rounded-lg"
                        >
                          Your browser does not support the audio tag.
                        </audio>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            // Clean up preview URL
                            if (audioPreview) {
                              URL.revokeObjectURL(audioPreview)
                            }
                            setAudioFile(null)
                            setAudioPreview(null)
                          }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 transition-colors shadow-md"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium text-center break-all px-4">
                        {audioFile?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click to change audio
                      </p>
                    </div>
                  ) : (
                    // Show upload prompt
                    <div className="flex flex-col items-center">
                      <Music className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-1">
                        Drop an audio file here, or click to upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        WAV/MP3 • 3-30 seconds • Up to 15MB
                      </p>
                    </div>
                  )}
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

                {/* Duration Selector - Available for both modes */}
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
              </div>

              {/* Cost Estimate */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                  Estimated cost
                </span>
                <div className="mt-1 flex flex-col gap-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {(() => {
                      const credits = resolution === '480p' ? 5 : resolution === '720p' ? 10 : 15;
                      return `${credits} credits (${resolution}, ${duration}s)`;
                    })()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    480p: 5 credits • 720p: 10 credits • 1080p: 15 credits
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
              disabled={!canClickGenerate}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                canClickGenerate
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
              {generatedVideoUrl ? (
                // Show generated video
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <div className="w-full max-w-md aspect-video mb-4">
                    <video
                      src={generatedVideoUrl}
                      controls
                      className="w-full h-full object-cover rounded-lg"
                      poster=""
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Video Actions */}
                  <div className="flex gap-2 mb-4">
                    <a
                      href={generatedVideoUrl}
                      download="generated-video.mp4"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Download Video
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedVideoUrl)}
                      className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedVideoUrl(null)
                        setGenerationResult(null)
                        setGenerationStatus(null)
                      }}
                      className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                    >
                      Generate Another
                    </button>
                  </div>

                  {/* Generation Info */}
                  {generationResult && (
                    <div className="text-center text-sm text-muted-foreground space-y-1">
                      {generationResult.seed && <p>Seed: {generationResult.seed}</p>}
                      {generationResult.credits_used && <p>Credits used: {generationResult.credits_used}</p>}
                      {generationResult.actual_prompt && (
                        <p className="max-w-sm">Prompt: "{generationResult.actual_prompt}"</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Default state or loading
                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                  <div className="mb-6">
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary"></div>
                    ) : (
                      <Video className="w-20 h-20 text-gray-400 dark:text-muted-foreground" />
                    )}
                  </div>

                  {/* Status Messages */}
                  {generationStatus && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-300 text-sm text-center whitespace-pre-line">
                        {generationStatus}
                      </p>
                    </div>
                  )}

                  {generationError && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-700 dark:text-red-300 text-sm text-center">
                        {generationError}
                      </p>
                    </div>
                  )}

                  {!isGenerating && !generationStatus && !generationError && (
                    <p className="text-gray-500 dark:text-gray-400 text-lg text-center">
                      Preview frames will appear here after the {generationMode === 'text-to-video' ? 'video generation' : 'animation'} job finishes
                    </p>
                  )}

                  {isGenerating && (
                    <div className="mt-4 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-600 to-purple-600 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              )}
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
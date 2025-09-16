'use client'

import { useState } from 'react'
import { X, Download, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  prompt?: string
  style?: string
  aspectRatio?: string
  generatedAt?: string
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  style,
  aspectRatio,
  generatedAt
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isOpen) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `rendaily-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleImageClick = () => {
    if (!isFullscreen) {
      setIsFullscreen(true)
    }
  }

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false)
      } else {
        onClose()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onKeyDown={handleEscapeKey}
      tabIndex={0}
    >
      {/* Fullscreen Mode */}
      {isFullscreen ? (
        <div className="fixed inset-0 bg-black z-60 flex items-center justify-center">
          <div className="absolute top-4 right-4 z-70 flex gap-2">
            <button
              onClick={handleDownload}
              className="p-3 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
              title="Download image"
            >
              <Download className="w-6 h-6" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-3 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
              title="Open in new tab"
            >
              <ExternalLink className="w-6 h-6" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
              title="Exit fullscreen"
            >
              <Minimize2 className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-3 text-white hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <img
            src={imageUrl}
            alt={prompt || 'Generated image'}
            className="max-w-full max-h-full object-contain cursor-pointer"
            onClick={() => setIsFullscreen(false)}
          />
          {prompt && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm text-white p-4 rounded-lg">
              <p className="text-sm">{prompt}</p>
            </div>
          )}
        </div>
      ) : (
        /* Regular Modal Mode */
        <div className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
            {prompt && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{prompt}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-gray-100 group">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={prompt || 'Generated image'}
            className="max-w-full max-h-[60vh] object-contain cursor-pointer"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            onClick={handleImageClick}
          />
          {/* Fullscreen hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-medium text-gray-700">
              Click to view fullscreen
            </div>
          </div>
        </div>

        {/* Footer with metadata */}
        {(style || aspectRatio || generatedAt) && (
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {style && (
                <div>
                  <span className="font-medium text-gray-900">Style:</span>
                  <span className="ml-2 text-gray-600">{style}</span>
                </div>
              )}
              {aspectRatio && (
                <div>
                  <span className="font-medium text-gray-900">Aspect Ratio:</span>
                  <span className="ml-2 text-gray-600">{aspectRatio}</span>
                </div>
              )}
              {generatedAt && (
                <div>
                  <span className="font-medium text-gray-900">Generated:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(generatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {/* Click outside to close - only in regular modal mode */}
      {!isFullscreen && (
        <div
          className="absolute inset-0 -z-10"
          onClick={onClose}
          aria-label="Close modal"
        />
      )}
    </div>
  )
}
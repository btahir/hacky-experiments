'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Search,
  FileText,
  FileSearch,
  AlertCircle,
  Clock,
  X,
} from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { processJFKMarkdown } from './markdown-helpers'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Type for JFK document search results
interface JFKDocument {
  id: string
  chunk_text: string
  filename: string
}

// Create a custom renderer for ReactMarkdown to handle images properly
const customRenderers: Components = {
  img: (props) => {
    // Debug the image props
    console.log('Image render attempt:', {
      src: props.src?.substring(0, 30),
      alt: props.alt,
      isBase64: props.src?.startsWith('data:'),
      srcLength: props.src?.length,
    })

    // Check if src is a base64 image
    const isBase64 =
      props.src &&
      (props.src.startsWith('data:image/') ||
        props.src.startsWith('data:application/'))

    // If it's a base64 image, render it
    if (isBase64) {
      console.log('Rendering base64 image:', props.alt)
      return (
        <div className='my-4'>
          <img
            src={props.src}
            alt={props.alt || 'Image'}
            className='max-w-full rounded border border-amber-400'
            style={{
              zIndex: 10,
              display: 'block',
              margin: '0 auto',
            }}
            loading='lazy'
          />
        </div>
      )
    }

    // Otherwise, it's trying to load from a URL - show a placeholder
    console.log('Showing placeholder for image:', props.alt)
    return (
      <div className='my-4 rounded-md border-2 border-amber-600 bg-gray-700 p-4 text-center'>
        <span className='font-medium text-amber-400'>
          [Image not available: {props.alt}]
        </span>
      </div>
    )
  },
}

// Custom URL transformer function to prevent ReactMarkdown from sanitizing URLs
const urlTransformer = (url: string) => {
  // Important: Make sure we pass through data URLs (base64 encoded images)
  if (url.startsWith('data:')) {
    return url
  }

  // For other URLs, apply default behavior
  return url
}

export default function JFKPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<JFKDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Use our custom debounce hook
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Function to perform the search
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch('/api/jfk-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 8,
        }),
      })

      const data = await response.json()
      console.log(data)

      if (response.ok) {
        setResults(data.results || [])
      } else {
        console.error('Search error:', data.error)
        setResults([])
      }
    } catch (error) {
      console.error('Failed to search JFK documents:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Handle search button click
  const handleSearchClick = () => {
    performSearch(searchQuery)
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery)
    }
  }

  // Run search when the debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      performSearch(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery])

  // Focus the search input on page load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100'>
      {/* Header with detective theme */}
      <div className="relative overflow-hidden bg-[url('/placeholder.svg?height=400&width=1920')] bg-cover bg-center py-16">
        <div className='absolute inset-0 bg-black/70'></div>
        <div className='container relative mx-auto px-4'>
          <div className='mx-auto max-w-3xl text-center'>
            <Badge
              variant='outline'
              className='mb-4 border-amber-500 text-amber-400'
            >
              DECLASSIFIED 2025
            </Badge>
            <h1 className='mb-2 font-serif text-5xl font-bold tracking-tight text-amber-400 drop-shadow-lg'>
              The JFK Files
            </h1>
            <p className='mb-8 text-xl text-gray-300'>
              Uncover the truth behind one of history&apos;s most controversial
              events. Search through over 2,000 declassified documents from the
              Kennedy assassination investigation.
            </p>

            {/* Search bar with detective styling */}
            <div className='mx-auto mb-8 flex w-full max-w-3xl gap-2 rounded-lg bg-gray-800/80 p-1 backdrop-blur-sm'>
              <div className='relative flex-1'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <FileSearch className='h-5 w-5 text-amber-500' />
                </div>
                <Input
                  ref={searchInputRef}
                  type='text'
                  placeholder='Search for names, locations, dates...'
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyPress}
                  className='w-full border-gray-700 bg-gray-800 py-6 pl-10 pr-4 text-gray-100 placeholder:text-gray-400 focus:border-amber-500 focus:ring-amber-500'
                />
              </div>
              <Button
                onClick={handleSearchClick}
                className='flex-shrink-0 bg-amber-600 py-6 text-gray-900 hover:bg-amber-500'
              >
                <Search className='mr-2 h-4 w-4' />
                Investigate
              </Button>
            </div>

            <div className='flex items-center justify-center space-x-6 text-sm text-gray-400'>
              <div className='flex items-center'>
                <Clock className='mr-2 h-4 w-4 text-amber-500' />
                <span>Declassified March 2025</span>
              </div>
              <div className='flex items-center'>
                <AlertCircle className='mr-2 h-4 w-4 text-amber-500' />
                <span>2,000+ Documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className='container mx-auto px-4 py-12'>
        {!hasSearched && (
          <div className='my-12 text-center text-gray-400'>
            <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800'>
              <FileSearch className='h-8 w-8 text-amber-500' />
            </div>
            <p className='text-lg'>
              Enter a search term to begin your investigation
            </p>
            <p className='mt-2 text-sm text-gray-500'>
              Try searching for names, locations, or specific events
            </p>
          </div>
        )}

        {isLoading && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card
                key={`skeleton-${i}`}
                className='overflow-hidden border-gray-700 bg-gray-800'
              >
                <CardContent className='p-4'>
                  <Skeleton className='mb-2 h-4 w-3/4 bg-gray-700' />
                  <Skeleton className='h-20 w-full bg-gray-700' />
                </CardContent>
                <CardFooter className='border-t border-gray-700 bg-gray-900 p-4'>
                  <Skeleton className='h-3 w-1/2 bg-gray-700' />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className='my-12 text-center text-gray-400'>
            <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800'>
              <AlertCircle className='h-8 w-8 text-amber-500' />
            </div>
            <p className='text-lg'>
              No evidence found for &quot;{searchQuery}&quot;
            </p>
            <p className='mt-2 text-sm text-gray-500'>
              Try different keywords or broaden your investigation
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <h2 className='mb-6 font-serif text-2xl font-bold text-amber-400'>
              Evidence Files{' '}
              <span className='text-gray-400'>
                ({results.length} documents found)
              </span>
            </h2>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {results.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
            <DocumentViewer />
          </>
        )}
      </div>
    </div>
  )
}

// Document card component to display a single document result
function DocumentCard({ document }: { document: JFKDocument }) {
  // Extract the filename without extension for forming the URL
  const filenameWithoutExt = document.filename.replace('.txt', '')

  return (
    <>
      <Card className='overflow-hidden border-gray-700 bg-gray-800 transition-all duration-200 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]'>
        <div className='border-l-4 border-amber-600 px-4 py-3'>
          <h3 className='font-mono text-sm text-amber-400'>
            DOCUMENT #{document.id}
          </h3>
        </div>
        <CardContent className='p-4'>
          <p className='line-clamp-5 text-sm text-gray-300'>
            {document.chunk_text}
          </p>
        </CardContent>
        <CardFooter className='flex justify-between border-t border-gray-700 bg-gray-900 p-4'>
          <div className='flex space-x-3'>
            <a
              href={`https://www.archives.gov/files/research/jfk/releases/2025/0318/${filenameWithoutExt}.pdf`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center text-sm font-medium text-amber-400 hover:text-amber-300'
            >
              <FileText className='mr-1 h-4 w-4' />
              PDF
            </a>
          </div>
          <span className='font-mono text-xs text-gray-500'>
            {document.filename}
          </span>
        </CardFooter>
      </Card>
    </>
  )
}

// Component to view a document directly by filename
function DocumentViewer() {
  const [filename, setFilename] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [markdownContent, setMarkdownContent] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value)
  }

  const handleSampleDocument = () => {
    setFilename('104-10004-10213.txt')
  }

  const handleViewDocument = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!filename.trim()) {
      setError('Please enter a document filename')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use GET request to fetch the document
      const response = await fetch(
        `/api/jfk/document?filename=${encodeURIComponent(filename)}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`)
      }

      const jsonData = await response.json()
      const processedMarkdown = processJFKMarkdown(jsonData)

      setMarkdownContent(processedMarkdown)
      setIsOpen(true)
    } catch (error) {
      console.error('Error loading document:', error)
      setError(
        'Failed to load document. Please check the filename and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='mb-12 rounded-lg bg-gray-800 p-6'>
        <h2 className='mb-4 font-serif text-xl font-bold text-amber-400'>
          View Document Directly
        </h2>
        <p className='mb-4 text-sm text-gray-300'>
          Enter a document filename to view its contents without searching.
        </p>

        <form
          onSubmit={handleViewDocument}
          className='flex flex-col gap-4 sm:flex-row'
        >
          <div className='relative flex-1'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <FileText className='h-5 w-5 text-amber-500' />
            </div>
            <Input
              type='text'
              placeholder='Enter document filename (e.g. 104-10001-10001.txt)'
              value={filename}
              onChange={handleFilenameChange}
              className='w-full border-gray-700 bg-gray-700 py-6 pl-10 pr-4 text-gray-100 placeholder:text-gray-400 focus:border-amber-500 focus:ring-amber-500'
            />
          </div>
          <Button
            type='submit'
            disabled={isLoading}
            className='bg-amber-600 text-gray-900 hover:bg-amber-500 disabled:bg-gray-600'
          >
            {isLoading ? 'Loading...' : 'View Document'}
          </Button>
        </form>

        <div className='mt-3 flex items-center justify-center'>
          <button
            onClick={handleSampleDocument}
            className='text-xs text-amber-400 underline hover:text-amber-300'
          >
            Use Sample Document
          </button>
        </div>

        {error && (
          <div className='mt-4 rounded-md bg-red-900/20 p-3 text-red-400'>
            <div className='flex items-center'>
              <AlertCircle className='mr-2 h-4 w-4' />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Document Markdown Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent className='z-50 max-h-[80vh] max-w-4xl overflow-y-auto overflow-x-hidden border-gray-700 bg-gray-800 text-gray-100'>
          <DialogHeader>
            <DialogTitle className='text-amber-400'>{filename}</DialogTitle>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-4 top-4 text-gray-400 hover:text-gray-100'
              onClick={() => setIsOpen(false)}
            >
              <span className='sr-only'>Close</span>
              <X className='h-4 w-4' />
            </Button>
          </DialogHeader>
          <div className='markdown-content prose prose-amber prose-invert relative z-10 max-w-none overflow-visible bg-gray-800 p-6'>
            {markdownContent ? (
              <ReactMarkdown
                components={customRenderers}
                urlTransform={urlTransformer}
              >
                {markdownContent}
              </ReactMarkdown>
            ) : (
              <div>Loading content...</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

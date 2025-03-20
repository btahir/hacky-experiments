import { NextRequest, NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'

// Create a Pinecone client
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || '',
})

// Get the index reference
const index = pc.index(
  'jfk-index',
  'https://jfk-index-db6447c.svc.aped-4627-b74a.pinecone.io'
)

// Get the namespace reference
const namespace = index.namespace('jfk-namespace')

// Define the JFK document interface
interface JFKDocument {
  id: string
  chunk_text: string
  filename: string
}

interface SearchRequest {
  query: string
  limit?: number
}

// Interface for Pinecone response structure
interface PineconeResponse {
  result: {
    hits: Array<{
      _id: string
      _score: number
      fields: {
        chunk_text: string
        filename: string
      }
    }>
  }
  usage: {
    readUnits: number
    embedTotalTokens?: number
  }
}

/**
 * API route handler for JFK document search
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SearchRequest
    const { query = '', limit = 8 } = body

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Perform the search using Pinecone
    const response = (await namespace.searchRecords({
      query: {
        topK: limit,
        inputs: { text: query },
      },
      fields: ['chunk_text', 'filename'],
    })) as unknown as PineconeResponse

    console.log('Pinecone response:', JSON.stringify(response, null, 2))

    // Transform the results based on the actual response structure
    const results =
      response.result?.hits?.map((hit) => {
        return {
          id: hit._id,
          chunk_text: hit.fields.chunk_text || 'No text available',
          filename: hit.fields.filename || 'unknown.txt',
        } as JFKDocument
      }) || []

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Exception in JFK search API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

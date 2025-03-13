'use client'

import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  language: string
  code: string
}

function CodeBlock({ language, code }: CodeBlockProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden">
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={coldarkDark}
        customStyle={{ 
          borderRadius: '0.5rem',
          fontSize: '0.9rem',
          margin: 0,
          padding: '1.5rem'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock 
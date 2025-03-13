'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchBarProps {
  initialSearch?: string
}

export function SearchBar({ initialSearch = '' }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(() => {
      // Update URL with search parameter, reset to page 1 when searching
      const params = new URLSearchParams()
      if (searchTerm) {
        params.set('search', searchTerm)
      }
      router.push(
        `/experiments${params.toString() ? `?${params.toString()}` : ''}`
      )
    })
  }

  const handleClear = () => {
    setSearchTerm('')
    router.push('/experiments')
  }

  return (
    <form
      onSubmit={handleSearch}
      className='flex gap-2 max-w-xl mx-auto bg-white'
    >
      <div className='relative flex-grow'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search className='size-4 text-gray-400' />
        </div>
        <Input
          type='search'
          placeholder='Search experiments...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>
      <Button type='submit' disabled={isPending}>
        Search
      </Button>
      {initialSearch && (
        <Button variant='outline' type='button' onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  )
}

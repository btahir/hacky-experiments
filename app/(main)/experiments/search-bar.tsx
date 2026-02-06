'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  initialSearch?: string
}

export function SearchBar({ initialSearch = '' }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()

    startTransition(() => {
      const params = new URLSearchParams()
      if (searchTerm) {
        params.set('search', searchTerm)
      }

      router.push(`/experiments${params.toString() ? `?${params.toString()}` : ''}`)
    })
  }

  const handleClear = () => {
    setSearchTerm('')
    router.push('/experiments')
  }

  return (
    <form onSubmit={handleSearch} className='flex flex-col gap-2 sm:flex-row'>
      <div className='relative flex-1'>
        <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='search'
          placeholder='Search experiments by title or summary'
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className='h-11 rounded-full border-border/85 bg-card/85 pl-10 pr-4 shadow-none'
          aria-label='Search experiments'
        />
      </div>

      <div className='flex gap-2'>
        <Button type='submit' disabled={isPending} className='h-11 rounded-full px-5 font-mono text-sm'>
          Search
        </Button>
        {initialSearch ? (
          <Button
            variant='outline'
            type='button'
            onClick={handleClear}
            className='h-11 rounded-full px-4'
          >
            <X className='size-4' />
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <article className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-4xl">
      {/* Back link placeholder */}
      <Skeleton className="h-5 w-32 mb-6" />
      
      {/* Title placeholder */}
      <Skeleton className="h-12 w-3/4 mb-6" />
      
      {/* Date placeholder */}
      <Skeleton className="h-4 w-48 mb-6" />
      
      {/* Hero image placeholder */}
      <Skeleton className="w-full h-96 mb-10 rounded-lg" />
      
      {/* Content placeholders */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/6" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-3/6" />
      </div>
    </article>
  )
} 
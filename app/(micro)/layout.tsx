import { NavBar } from '@/components/navbar'
import { Toaster } from 'sonner'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <NavBar />
      <main className='pt-20'>
        {children}
        <Toaster />
      </main>
    </>
  )
}

import { NavBar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from 'sonner'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <NavBar />
      <div id='main-content' className='pt-24'>
        {children}
        <Toaster />
      </div>
      <Footer />
    </>
  )
}

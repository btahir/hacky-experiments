import { NavBar } from '@/components/navbar'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <NavBar />
      <main className='pt-20'>{children}</main>
    </>
  )
}

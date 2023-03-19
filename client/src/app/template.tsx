  import Navbar from '@/components/navbar'

export default async function TemplateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
       <Navbar />
      {children}
    </div>
  )
}

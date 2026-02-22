import Hero       from '../components/landing/Hero'
import Features   from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Pricing    from '../components/landing/Pricing'
import Footer     from '../components/landing/Footer'

export default function Landing({ onEnterDemo }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Hero       onEnterDemo={onEnterDemo} />
      <Features   />
      <HowItWorks onEnterDemo={onEnterDemo} />
      <Pricing    onEnterDemo={onEnterDemo} />
      <Footer     onEnterDemo={onEnterDemo} />
    </div>
  )
}

import { useEffect } from 'react'

export default function ParticlesBackground() {
  useEffect(() => {
    function rInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min) + min)
    }

    function setStars() {
      const distStars = document.getElementsByClassName('distStar')
      const skyWidth = window.innerWidth
      const skyHeight = window.innerHeight

      for (let i = 0; i < distStars.length; i++) {
        const star = distStars[i] as HTMLElement
        
        if (i % 4 === 0) {
          star.style.width = '2px'
          star.style.height = '2px'
        }

        const posL = rInt(0, skyWidth)
        const posT = rInt(0, skyHeight)
        const aDur = Math.random() * 4.2
        const aDel = Math.random()

        star.style.left = posL + 'px'
        star.style.top = posT + 'px'
        star.style.animationDelay = aDel + 's'
        star.style.animationDuration = aDur + 's'
      }
    }

    setStars()

    window.addEventListener('resize', setStars)
    return () => window.removeEventListener('resize', setStars)
  }, [])

  const stars = Array.from({ length: 300 }, (_, i) => (
    <div key={i} className="distStar" />
  ))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {stars}
    </div>
  )
}

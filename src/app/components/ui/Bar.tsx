import React from 'react'
import { scrollToSection } from '@/lib/utils'    



function Bar() {
  return (
    <div className='flex justify-center items-center space-x-4 font-semibold text-lg md:text-xl lg:text-2xl'>
      <button onClick={() => scrollToSection('home')} className="px-3 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-black rounded">
        Home
      </button>
      <button onClick={() => scrollToSection('aboutme')} className="px-3 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-black rounded">
        About Me
      </button>
      <button onClick={() => scrollToSection('projects')} className="px-3 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-black rounded">
        Projects
      </button>
      <button onClick={() => scrollToSection('skills')} className="px-3 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-black rounded">
        Skills
      </button>
      <button onClick={() => scrollToSection('resume')} className="px-3 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-black rounded">
        Resume
      </button>
      <button onClick={() => scrollToSection('experience')} className="px-3 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white transition-all text-black rounded">
        Experience
      </button>
    </div>
  )
}

export default Bar


import React from 'react'
import BitmojiAnimation from '../ui/front-face'

function AboutMe() {
  return (
    <div className='flex items-center justify-center min-h-screen py-12 px-4'>
      <div className='flex w-full max-w-7xl'>
        <div className='flex flex-col w-1/3 pr-8'>
          <h1 className='text-5xl font-bold mb-4'>About Me</h1>
          <div className='w-40 h-40'> {/* Adjust size as needed */}
            <BitmojiAnimation />
          </div>
        </div>
        <div className='bg-blue-100 p-10 rounded-lg flex-1 max-h-[32rem] overflow-y-auto'>
          <div className="flex flex-col items-start">
            <p className='text-xl font-mono'>
           {"  I'm Lakshanand Sugumar, a sophomore Robotics Engineering student at Arizona State University with a deep interest in emerging technologies, particularly in the fields of robotics and automation. I'm always driven to learn and apply new knowledge, especially when it comes to integrating technology to solve complex problems."} </p>
            <p className='text-xl font-mono mt-6'>
          {"As a self-taught automation engineer, I have a strong understanding of PLC systems, control automation, and process optimization. My expertise spans across app development, website development, game creation, and programming in languages such as C, C++, and Python. I've applied my knowledge of automation and coding to develop various systems and applications that streamline processes and enhance efficiency."}
            </p>
            <p className='text-xl font-mono mt-6'>
              {"I am also experienced in working with Arduino to design intelligent systems that interact with the physical world, creating solutions that bridge the gap between software and hardware. I'm passionate about exploring how automation and robotics can be applied to improve everyday life and industrial processes."}
            </p>
            <p className='text-xl font-mono mt-6'>
              {"Outside of my technical endeavors, I'm actively involved in sports, excelling in both cricket and badminton. Staying active helps me maintain a well-rounded lifestyle. I also enjoy driving, which gives me a sense of adventure and freedom."}
            </p>
            <p className='text-xl font-mono mt-6'>
              {"Currently, I serve as a Teaching Assistant for ASU 101, where I mentor first-year students and help them adapt to university life. Through this role, I've developed strong leadership and communication skills, which complement my technical expertise."}
            </p>
            <p className='text-xl font-mono mt-6'>
              {"I'm constantly looking for opportunities to grow and apply my skills in innovative ways, and I'm excited to contribute to the future of robotics and automation through my ongoing learning and work."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutMe

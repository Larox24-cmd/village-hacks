import { FaInstagram, FaEnvelope, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

export default function Coms() {
  return (
    <div className="flex flex-col items-center space-y-4 col-span-1">
      <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-6xl text-pink-600 hover:text-pink-700">
        <FaInstagram />
      </a>
      <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-5xl text-blue-600 hover:text-blue-700">
        <FaLinkedinIn />
      </a>
      <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-5xl text-gray-800 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100">
        <FaGithub />
      </a>
      <a href="mailto:slakshanand1105@gmail.com" className="text-5xl text-red-500 hover:text-red-600">
        <FaEnvelope />
      </a>
      <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-5xl text-blue-400 hover:text-blue-500">
        <FaTwitter />
      </a>
    </div>
  );
}   
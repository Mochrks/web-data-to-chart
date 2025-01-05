import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white shadow dark:bg-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-gray-600 dark:text-gray-300">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 dark:text-gray-300">Created by</span>
            <a
              href="https://github.com/mochrks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-300"
            >
              @mochrks
              <Github className="inline-block ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


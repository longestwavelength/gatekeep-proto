import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ProfileSectionDropdown = ({ 
  options, 
  selectedOption, 
  onOptionChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {selectedOption}
          <ChevronDown 
            className="w-5 h-5 ml-2 -mr-1" 
            aria-hidden="true" 
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div 
            className="py-1" 
            role="menu" 
            aria-orientation="vertical" 
            aria-labelledby="options-menu"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onOptionChange(option);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSectionDropdown;
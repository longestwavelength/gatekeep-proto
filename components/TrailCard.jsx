"use client"

import Image from 'next/image';
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const DifficultyBadge = ({ difficulty }) => {
  const colors = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${colors[difficulty]}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
};

const TrailCard = ({ post, handleEdit, handleDelete }) => {
  const { data: session } = useSession();
  const pathName = usePathname();
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/trail/${post._id}`);
  };

  const handleCreatorClick = (e) => {
    e.stopPropagation(); // Prevent the card click event from firing
    router.push(`/profile/${post.creator._id}`);
  };

  return (
    <div className="trail_card">
      {/* Main card content - clickable */}
      <div onClick={handleCardClick} className="cursor-pointer">
        {/* Trail Image */}
        <div className="relative h-48 w-full">
          <Image 
            src="/assets/images/gatekeep-logo.svg" // Replace with your default image path
            alt={post.name}
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* Trail Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold text-gray-900">{post.name}</h2>
            <DifficultyBadge difficulty={post.difficulty} />
          </div>

          <p className="text-gray-600 mb-2">📍 {post.location}</p>
          
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
            #{post.tag}
          </span>
        </div>
      </div>

      {/* Creator info and actions - not clickable */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex justify-between"> {/* edited out items-center */}
          <div className="flex items-center space-x-3">
            <Image 
              src={post.creator.image}
              alt={post.creator.username}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span 
              className="font-medium text-gray-900 cursor-pointer hover:underline"
              onClick={handleCreatorClick}
            >
              {post.creator.username}
            </span>
          </div>

          {session?.user.id === post.creator._id && pathName === '/profile' && (
            <div className="flex space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(post);
                }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Edit
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(post);
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailCard;
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

const TooltipWrapper = ({ text, children }) => {
  return (
    <div className="group relative inline-block max-w-full">
      {children}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-normal
                      max-w-xs z-50 invisible group-hover:visible">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 top-full 
                      border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
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
            src={post.images && post.images.length > 0 ? post.images[0] : "/assets/images/gatekeep-logo.svg"}
            alt={post.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {session?.user.id === post.creator._id && pathName === '/profile' && (
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-50 group-hover:opacity-200 transition-opacity duration-200">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(post);
                }}
                className="p-2 bg-black rounded-full shadow-md hover:bg-gray-200 transition-colors"
              >
                <Image
                  src="/assets/icons/edit.svg"
                  alt="Edit"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(post);
                }}
                className="p-2 bg-black rounded-full shadow-md hover:bg-gray-200 transition-colors"
              >
                <Image
                  src="/assets/icons/delete.svg"
                  alt="Delete"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
            </div>
          )}
        </div>

        {/* Trail Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3 gap-2">{/*added gap-2 */}
            <TooltipWrapper text={post.name}>
              <h2 className="text-xl font-bold text-gray-900 overflow-hidden overflow-ellipsis whitespace-nowrap flex-grow min-w-0">
                {post.name}
              </h2>
            </TooltipWrapper>
            
            {/*<h2 className="text-xl font-bold text-gray-900">{post.name}</h2> */}
            
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
        <div className="flex justify-between items-center gap-2"> {/* added items-center & gap-2 */}
          <div className="flex items-center gap-2 min-w-0 flex-grow">{/*removed space-x-1 added gap-2 min-w-0 flex-grow */}
            <Image 
              src={post.creator.image}
              alt={post.creator.username}
              width={40}
              height={40}
              className="rounded-full object-cover flex-shrink-0"
            />{/*added flex-shrink-0 */}
            <TooltipWrapper text={post.creator.username}>
              <span 
                className="font-medium text-gray-900 cursor-pointer hover:underline 
                overflow-hidden overflow-ellipsis whitespace-nowrap"
                onClick={handleCreatorClick}
              >{/*added overflow-hidden overflow-ellipsis whitespace-nowrap */}
                {post.creator.username}
              </span>
            </TooltipWrapper>
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TrailCard;

import React from 'react';
import { User } from '../types';

interface TopFriendsProps {
  friends: User[];
}

export const TopFriends: React.FC<TopFriendsProps> = ({ friends }) => {
  return (
    <div className="mb-4">
      <h3 className="font-bold text-gray-700 mb-2 text-xs uppercase tracking-wide">Top 8 Friends</h3>
      <div className="grid grid-cols-4 gap-2">
        {friends.map((friend) => (
          <div key={friend.id} className="text-center">
            <div className="relative group">
              <img 
                src={friend.avatarUrl} 
                alt={friend.username} 
                className="w-full aspect-square object-cover border border-gray-300 p-0.5 hover:border-blue-400 cursor-pointer"
              />
              {friend.isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full" title="Online"></div>
              )}
            </div>
            <a href="#" className="text-[10px] text-blue-600 hover:underline block truncate mt-1">
              {friend.username}
            </a>
          </div>
        ))}
      </div>
      <div className="text-right mt-1">
        <a href="#" className="text-[10px] text-gray-400 hover:text-gray-600">View All</a>
      </div>
    </div>
  );
};
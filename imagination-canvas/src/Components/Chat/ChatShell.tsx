import React from 'react';

export const MessageList: React.FC = () => {
  return (
    <div 
      data-testid="message-list"
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-[80%]">
        Hello! I am your Imagination Engine assistant. How can I help you today?
      </div>
    </div>
  );
};

export const InputBox: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Type your thoughts..."
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};

export const ChatShell: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <MessageList />
      <InputBox />
    </div>
  );
};

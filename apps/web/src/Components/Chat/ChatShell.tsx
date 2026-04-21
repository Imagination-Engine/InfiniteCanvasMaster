import React, { useEffect } from 'react';
import { useChat } from 'ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSessionStore } from '../../store/useSessionStore';
import { CanvasAffordance } from './CanvasAffordance';

export const ChatShell: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat();
  const { hasCanvas, setHasCanvas, toggleCanvas } = useSessionStore();

  // Detect tool calls in messages to trigger lazy canvas creation
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && (lastMessage as any).toolInvocations?.length > 0) {
      if (!hasCanvas) {
        setHasCanvas(true);
      }
    }
  }, [messages, hasCanvas, setHasCanvas]);

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      {/* Session Duality Affordance */}
      {hasCanvas && <CanvasAffordance onOpen={toggleCanvas} />}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-2 text-red-600 text-sm text-center">
          Error: {error.message}
        </div>
      )}
      {/* Message List */}
      <div 
        data-testid="message-list"
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-gray-500 text-center mt-10">
            Start a conversation to begin imagining.
          </div>
        )}
        {messages.map(m => (
          <div 
            key={m.id} 
            className={`p-3 rounded-lg shadow-sm border max-w-[85%] ${
              m.role === 'user' 
                ? 'bg-blue-50 border-blue-100 ml-auto text-blue-900' 
                : 'bg-white border-gray-200 mr-auto text-gray-900'
            }`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {m.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form 
        role="form"
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your thoughts..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

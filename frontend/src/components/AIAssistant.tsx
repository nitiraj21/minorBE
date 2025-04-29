import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAvailableProducts } from '../api/products';
import { getAIProductRecommendations, chatWithAI } from '../api/ai';
import { Product } from '../types';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  recommendations?: Product[];
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hi! I'm Orion. I can help you find the perfect products for your needs. What are you looking for today?", 
      sender: 'bot' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load available products when component mounts
    const loadProducts = async () => {
      try {
        const products = await getAvailableProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Failed to load products for AI assistant:', error);
      }
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    
    // Clear input field
    setInput('');
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Get AI response with product recommendations
      const response = await getAIProductRecommendations(input, availableProducts);
      
      // Add bot response to chat
      setMessages(prev => [
        ...prev, 
        { 
          text: response.answer, 
          sender: 'bot',
          recommendations: response.recommendedProducts 
        }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [
        ...prev, 
        { 
          text: "I'm sorry, I encountered an error while processing your request. Please try again later.", 
          sender: 'bot' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      <button
        onClick={toggleChat}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-400 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
        aria-label="Open chat"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-80 rounded-lg border border-gray-300 bg-white shadow-xl sm:w-96">
          {/* Chat header */}
          <div className="flex items-center justify-between rounded-t-lg bg-blue-400 px-4 py-3 text-white">
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="mr-2 h-5 w-5" />
              <h3 className="font-medium text-2xl text-white pt-4">Ask Orion</h3>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Chat messages */}
          <div className="h-80 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className="mb-4">
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'ml-auto bg-blue-400 text-white'
                      : 'mr-auto bg-gray-100 text-gray-800'
                  } max-w-[80%]`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                
                {/* Product recommendations */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-500">Recommended Products:</p>
                    {message.recommendations.map(product => (
                      <Link
                        key={product._id}
                        to={`/products/${product._id}`}
                        className="block rounded-md border border-gray-200 p-2 hover:bg-gray-50"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={product.image && product.image.length > 0 
                                ? product.image[0] 
                                : 'https://via.placeholder.com/40x40?text=No+Image'}
                              alt={product.name}
                              className="h-full w-full rounded-md object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xs font-medium text-gray-900">{product.name}</h4>
                            <p className="text-xs text-gray-500">{product.brand}</p>
                            <p className="text-xs font-medium">₹{product.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto mb-4 flex max-w-[80%] items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-xs">Thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="flex border-t border-gray-300 p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask about products..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`ml-2 flex items-center justify-center rounded-md px-3 py-2 text-white ${
                !input.trim() || isLoading ? 'bg-gray-400' : 'bg-blue-400 hover:bg-blue-700'
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIAssistant; 
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Conversation } from '../types';
import { format } from 'date-fns';

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            company:companies(id, name),
            conversation_individuals(
              individual:individuals(id, first_name, last_name)
            )
          `)
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        console.log("Fetched conversations:", data);
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
          <Link
            to="/conversations/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Conversation
          </Link>
        </div>
        
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            No conversations found. Add your first conversation to get started.
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {format(new Date(conversation.date), 'MMMM d, yyyy')}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {conversation.follow_up_required && (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Follow-up: {conversation.follow_up_date ? format(new Date(conversation.follow_up_date), 'MMM d, yyyy') : 'Required'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {conversation.notes}
                      </p>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        {conversation.company && (
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium text-gray-700">Company:</span>
                            <span className="ml-1">{conversation.company.name}</span>
                          </p>
                        )}
                      </div>
                      
                      {conversation.conversation_individuals && conversation.conversation_individuals.length > 0 && (
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="font-medium text-gray-700">Individuals:</span>
                          <span className="ml-1">
                            {conversation.conversation_individuals.map(
                              (item, index) => (
                                <span key={item.individual.id}>
                                  {index > 0 ? ', ' : ''}
                                  {item.individual.first_name} {item.individual.last_name}
                                </span>
                              )
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <Link
                        to={`/conversations/${conversation.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 
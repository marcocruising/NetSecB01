import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Conversation } from '../types';

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      try {
        let query = supabase
          .from('conversations')
          .select(`
            *,
            company:companies(id, name),
            individuals:conversation_individuals(individual:individuals(id, first_name, last_name))
          `)
          .order('date', { ascending: false });

        // Apply filter if present
        if (filterParam === 'follow-up') {
          const today = new Date().toISOString().split('T')[0];
          query = query
            .eq('follow_up_required', true)
            .gte('follow_up_date', today);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [filterParam]);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {filterParam === 'follow-up' ? 'Follow-ups' : 'Conversations'}
        </h1>
        <Link
          to="/conversations/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Conversation
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link to={`/conversations/${conversation.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-indigo-600">
                        {conversation.company?.name ? (
                          <span>{conversation.company.name}</span>
                        ) : conversation.individuals && conversation.individuals.length > 0 ? (
                          <span>
                            {conversation.individuals.map(i => 
                              `${i.individual.first_name} ${i.individual.last_name}`
                            ).join(', ')}
                          </span>
                        ) : (
                          <span>Conversation</span>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {formatDate(conversation.date)}
                        </p>
                        {conversation.follow_up_required && (
                          <p className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Follow-up
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      <p className="truncate">{conversation.notes}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by recording a new conversation.</p>
          <div className="mt-6">
            <Link
              to="/conversations/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Conversation
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 
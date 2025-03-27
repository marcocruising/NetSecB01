import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Company, Individual, Conversation } from '../types';

type SearchResult = {
  companies: Company[];
  individuals: Individual[];
  conversations: Conversation[];
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({
    companies: [],
    individuals: [],
    conversations: []
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      // Search companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .or(`name.ilike.%${query}%, industry.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(10);

      if (companiesError) throw companiesError;

      // Search individuals
      const { data: individuals, error: individualsError } = await supabase
        .from('individuals')
        .select(`
          *,
          company:companies(id, name)
        `)
        .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, email.ilike.%${query}%, role.ilike.%${query}%, description.ilike.%${query}%`)
        .limit(10);

      if (individualsError) throw individualsError;

      // Search conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          company:companies(id, name),
          individuals:conversation_individuals(individual:individuals(id, first_name, last_name))
        `)
        .ilike('notes', `%${query}%`)
        .limit(10);

      if (conversationsError) throw conversationsError;

      setResults({
        companies: companies || [],
        individuals: individuals || [],
        conversations: conversations || []
      });
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const hasResults = results.companies.length > 0 || 
                     results.individuals.length > 0 || 
                     results.conversations.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search for companies, individuals, or conversations.
        </p>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form onSubmit={handleSearch}>
          <div className="flex">
            <div className="flex-grow">
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="Search by name, email, content..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="ml-3">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>
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
      ) : searched && !hasResults ? (
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or creating new entries.
          </p>
        </div>
      ) : (
        searched && (
          <div className="space-y-6">
            {/* Companies Results */}
            {results.companies.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">Companies</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {results.companies.map((company) => (
                      <li key={company.id}>
                        <Link to={`/companies/${company.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">{company.name}</p>
                              {company.type && (
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {company.type}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {company.industry || 'No industry specified'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Individuals Results */}
            {results.individuals.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">Individuals</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {results.individuals.map((individual) => (
                      <li key={individual.id}>
                        <Link to={`/individuals/${individual.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {individual.first_name} {individual.last_name}
                              </p>
                              {individual.contact_type && (
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {individual.contact_type}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  {individual.role || 'No role specified'}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <p>
                                  {individual.company?.name || 'No company'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Conversations Results */}
            {results.conversations.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">Conversations</h2>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {results.conversations.map((conversation) => (
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
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
} 
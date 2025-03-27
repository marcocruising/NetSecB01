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
        .order('name', { ascending: true });

      if (companiesError) throw companiesError;

      // Search individuals
      const { data: individuals, error: individualsError } = await supabase
        .from('individuals')
        .select(`
          *,
          company:companies(id, name)
        `)
        .or(`first_name.ilike.%${query}%, last_name.ilike.%${query}%, email.ilike.%${query}%, role.ilike.%${query}%, description.ilike.%${query}%`)
        .order('last_name', { ascending: true });

      if (individualsError) throw individualsError;

      // Search conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          company:companies(id, name)
        `)
        .ilike('notes', `%${query}%`)
        .order('date', { ascending: false });

      if (conversationsError) throw conversationsError;

      setResults({
        companies: companies || [],
        individuals: individuals || [],
        conversations: conversations || []
      });
    } catch (error) {
      console.error('Error searching:', error);
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
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        
        <form onSubmit={handleSearch} className="mt-6">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for companies, individuals, or conversations..."
              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </div>
        </form>
        
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : searched && (
          <div className="mt-6">
            {results.companies.length === 0 && results.individuals.length === 0 && results.conversations.length === 0 ? (
              <p className="text-gray-500">No results found for "{query}".</p>
            ) : (
              <>
                {/* Companies */}
                {results.companies.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Companies</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {results.companies.map((company) => (
                          <li key={company.id}>
                            <Link to={`/companies/${company.id}/edit`} className="block hover:bg-gray-50">
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-indigo-600 truncate">
                                    {company.name}
                                  </p>
                                  {company.industry && (
                                    <div className="ml-2 flex-shrink-0 flex">
                                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {company.industry}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Individuals */}
                {results.individuals.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Individuals</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {results.individuals.map((individual) => (
                          <li key={individual.id}>
                            <Link to={`/individuals/${individual.id}/edit`} className="block hover:bg-gray-50">
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-indigo-600 truncate">
                                    {individual.first_name} {individual.last_name}
                                  </p>
                                  {individual.company && (
                                    <div className="ml-2 flex-shrink-0 flex">
                                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {individual.company.name}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      {individual.role}
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
                
                {/* Conversations */}
                {results.conversations.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Conversations</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {results.conversations.map((conversation) => (
                          <li key={conversation.id}>
                            <Link to={`/conversations/${conversation.id}/edit`} className="block hover:bg-gray-50">
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-indigo-600 truncate">
                                    {new Date(conversation.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {conversation.notes}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
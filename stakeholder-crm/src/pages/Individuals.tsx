import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Individual } from '../types';

export default function Individuals() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIndividuals() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('individuals')
          .select(`
            *,
            company:companies(id, name)
          `)
          .order('last_name', { ascending: true });

        if (error) {
          throw error;
        }

        setIndividuals(data || []);
      } catch (error) {
        console.error('Error fetching individuals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIndividuals();
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Individuals</h1>
          <Link
            to="/individuals/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Individual
          </Link>
        </div>
        
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : individuals.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            No individuals found. Add your first individual to get started.
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {individuals.map((individual) => (
                <li key={individual.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {individual.first_name} {individual.last_name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {individual.company && (
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {individual.company.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {individual.role}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {individual.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Link
                        to={`/individuals/${individual.id}/edit`}
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
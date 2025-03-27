import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Dashboard() {
  const [recentConversations, setRecentConversations] = useState([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState([]);
  const [individualCount, setIndividualCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch counts
        const { count: individualCount, error: individualError } = await supabase
          .from('individuals')
          .select('*', { count: 'exact', head: true });
          
        if (individualError) throw individualError;
        
        const { count: companyCount, error: companyError } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
          
        if (companyError) throw companyError;
        
        // Fetch recent conversations
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select(`
            *,
            company:companies(id, name),
            conversation_individuals(
              individual:individuals(id, first_name, last_name)
            )
          `)
          .order('date', { ascending: false })
          .limit(5);
          
        if (conversationsError) throw conversationsError;
        
        // Fetch upcoming follow-ups
        const today = new Date();
        const { data: followUps, error: followUpsError } = await supabase
          .from('conversations')
          .select(`
            *,
            company:companies(id, name),
            conversation_individuals(
              individual:individuals(id, first_name, last_name)
            )
          `)
          .eq('follow_up_required', true)
          .gte('follow_up_date', today.toISOString())
          .order('follow_up_date', { ascending: true })
          .limit(5);
          
        if (followUpsError) throw followUpsError;
        
        setIndividualCount(individualCount || 0);
        setCompanyCount(companyCount || 0);
        setRecentConversations(conversations || []);
        setUpcomingFollowUps(followUps || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Individuals
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {individualCount}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/individuals" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View all<span className="sr-only"> individuals</span>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Companies
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {companyCount}
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/companies" className="font-medium text-indigo-600 hover:text-indigo-500">
                      View all<span className="sr-only"> companies</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Conversations */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Recent Conversations</h2>
              <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
                {recentConversations.length === 0 ? (
                  <p className="p-4 text-gray-500">No recent conversations found.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {recentConversations.map((conversation) => (
                      <li key={conversation.id}>
                        <Link to={`/conversations/${conversation.id}/edit`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {format(new Date(conversation.date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                {conversation.company && (
                                  <p className="flex items-center text-sm text-gray-500">
                                    {conversation.company.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Upcoming Follow-ups */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Follow-ups</h2>
              <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
                {upcomingFollowUps.length === 0 ? (
                  <p className="p-4 text-gray-500">No upcoming follow-ups.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {upcomingFollowUps.map((followUp) => (
                      <li key={followUp.id}>
                        <Link to={`/conversations/${followUp.id}/edit`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                Follow-up: {format(new Date(followUp.follow_up_date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                {followUp.company && (
                                  <p className="flex items-center text-sm text-gray-500">
                                    {followUp.company.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
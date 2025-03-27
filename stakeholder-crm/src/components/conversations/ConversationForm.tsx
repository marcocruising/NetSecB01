import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Company, Individual } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ConversationForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>([]);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);

  useEffect(() => {
    // Fetch companies and individuals for the dropdowns
    async function fetchData() {
      try {
        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('name', { ascending: true });

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);

        // Fetch individuals
        const { data: individualsData, error: individualsError } = await supabase
          .from('individuals')
          .select(`
            *,
            company:companies(id, name)
          `)
          .order('last_name', { ascending: true });

        if (individualsError) throw individualsError;
        setIndividuals(individualsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
    
    // If in edit mode, fetch the conversation data
    if (isEditMode) {
      fetchConversation();
    }
  }, [id, isEditMode]);

  const fetchConversation = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_individuals(individual_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setDate(new Date(data.date));
        setNotes(data.notes || '');
        setFollowUpRequired(data.follow_up_required || false);
        setFollowUpDate(data.follow_up_date ? new Date(data.follow_up_date) : null);
        setCompanyId(data.company_id || '');
        
        // Set selected individuals
        if (data.conversation_individuals) {
          const individualIds = data.conversation_individuals.map(
            (item: { individual_id: string }) => item.individual_id
          );
          setSelectedIndividuals(individualIds);
        }
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation data');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleIndividualChange = (individualId: string) => {
    setSelectedIndividuals(prev => {
      if (prev.includes(individualId)) {
        return prev.filter(id => id !== individualId);
      } else {
        return [...prev, individualId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimeoutError(false);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setTimeoutError(true);
      setLoading(false);
      setError("Operation timed out. Please try again.");
    }, 15000); // 15 seconds timeout
    
    try {
      // Format dates for Supabase
      const formattedDate = date.toISOString();
      const formattedFollowUpDate = followUpRequired && followUpDate ? followUpDate.toISOString() : null;
      
      // Log the current user session to debug
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (isEditMode) {
        // Update existing conversation
        const { error: conversationError, data: conversationData } = await supabase
          .from('conversations')
          .update({
            date: formattedDate,
            notes,
            follow_up_required: followUpRequired,
            follow_up_date: formattedFollowUpDate,
            company_id: companyId || null
          })
          .eq('id', id)
          .select();

        if (conversationError) {
          console.error("Supabase error:", conversationError);
          throw conversationError;
        }
        
        // Delete existing conversation_individuals
        const { error: deleteError } = await supabase
          .from('conversation_individuals')
          .delete()
          .eq('conversation_id', id);
          
        if (deleteError) {
          console.error("Error deleting conversation individuals:", deleteError);
          throw deleteError;
        }
        
        // Insert new conversation_individuals
        if (selectedIndividuals.length > 0) {
          const conversationIndividuals = selectedIndividuals.map(individualId => ({
            conversation_id: id,
            individual_id: individualId
          }));
          
          const { error: insertError } = await supabase
            .from('conversation_individuals')
            .insert(conversationIndividuals);
            
          if (insertError) {
            console.error("Error inserting conversation individuals:", insertError);
            throw insertError;
          }
        }
        
        console.log("Successfully updated conversation:", conversationData);
      } else {
        // Create new conversation
        console.log("Creating conversation with data:", { 
          date: formattedDate,
          notes,
          follow_up_required: followUpRequired,
          follow_up_date: formattedFollowUpDate,
          company_id: companyId || null
        });
        
        const { error: conversationError, data: conversationData } = await supabase
          .from('conversations')
          .insert([
            {
              date: formattedDate,
              notes,
              follow_up_required: followUpRequired,
              follow_up_date: formattedFollowUpDate,
              company_id: companyId || null
            }
          ])
          .select();

        if (conversationError) {
          console.error("Supabase error:", conversationError);
          throw conversationError;
        }
        
        console.log("Successfully created conversation:", conversationData);

        // Insert conversation_individuals
        if (selectedIndividuals.length > 0 && conversationData && conversationData[0]) {
          const newConversationId = conversationData[0].id;
          
          console.log("Inserting conversation individuals for conversation ID:", newConversationId);
          
          // Create an array of objects to insert
          const conversationIndividualsToInsert = selectedIndividuals.map(individualId => ({
            conversation_id: newConversationId,
            individual_id: individualId
          }));
          
          console.log("Conversation individuals to insert:", conversationIndividualsToInsert);
          
          // Try inserting with upsert option
          const { error: insertError } = await supabase
            .from('conversation_individuals')
            .upsert(conversationIndividualsToInsert, { 
              onConflict: 'conversation_id,individual_id',
              ignoreDuplicates: true 
            });
            
          if (insertError) {
            console.error("Error upserting conversation individuals:", insertError);
            // Don't throw, just log the error
          } else {
            console.log("Successfully inserted conversation individuals");
          }
        }

        // After creating the conversation, verify it was created
        if (conversationData && conversationData.length > 0) {
          console.log("Conversation created successfully with ID:", conversationData[0].id);
          
          // Verify the conversation exists in the database
          const { data: verifyData, error: verifyError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationData[0].id)
            .single();
            
          if (verifyError) {
            console.error("Error verifying conversation:", verifyError);
          } else {
            console.log("Verified conversation exists:", verifyData);
          }
        } else {
          console.error("No conversation data returned after insert");
        }
      }
      
      // Clear the timeout if successful
      clearTimeout(timeoutId);
      
      // Redirect back to conversations list
      navigate('/conversations');
    } catch (err) {
      // Clear the timeout if there's an error
      clearTimeout(timeoutId);
      
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} conversation`);
    } finally {
      // Clear the timeout in finally block as well
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Add this function to the component to help with debugging
  const checkTablePermissions = async () => {
    try {
      console.log("Checking table permissions...");
      
      // Try a simple select query
      const { data: selectData, error: selectError } = await supabase
        .from('conversation_individuals')
        .select('*')
        .limit(1);
        
      console.log("Select test:", selectError ? `Error: ${selectError.message}` : "Success");
      
      // Try a simple insert query with a random UUID (will fail due to FK constraints but should show permission issues)
      const testConversationId = '00000000-0000-0000-0000-000000000000';
      const testIndividualId = '00000000-0000-0000-0000-000000000000';
      
      const { error: insertError } = await supabase
        .from('conversation_individuals')
        .insert({
          conversation_id: testConversationId,
          individual_id: testIndividualId
        })
        .select();
        
      // We expect a foreign key error, not a permission error
      console.log("Insert test:", insertError ? 
        (insertError.code === '23503' ? "Expected FK error (good)" : `Permission error: ${insertError.message}`) 
        : "Unexpected success");
        
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  };

  // Call this function when the component mounts
  useEffect(() => {
    checkTablePermissions();
  }, []);

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit' : 'Add New'} Conversation</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <p className="mt-2">Please try again or contact support if the issue persists.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <DatePicker
              selected={date}
              onChange={(date: Date) => setDate(date)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              dateFormat="MMMM d, yyyy"
              required
            />
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <select
              id="company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">-- No Company --</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Individuals
            </label>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
              {individuals.length === 0 ? (
                <p className="text-gray-500 text-sm">No individuals available</p>
              ) : (
                individuals.map((individual) => (
                  <div key={individual.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`individual-${individual.id}`}
                      checked={selectedIndividuals.includes(individual.id)}
                      onChange={() => handleIndividualChange(individual.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`individual-${individual.id}`} className="ml-2 block text-sm text-gray-900">
                      {individual.first_name} {individual.last_name}
                      {individual.company && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({individual.company.name})
                        </span>
                      )}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div className="sm:col-span-2">
            <div className="flex items-center">
              <input
                id="followUpRequired"
                type="checkbox"
                checked={followUpRequired}
                onChange={(e) => {
                  setFollowUpRequired(e.target.checked);
                  if (!e.target.checked) {
                    setFollowUpDate(null);
                  }
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="followUpRequired" className="ml-2 block text-sm text-gray-900">
                Follow-up required
              </label>
            </div>
          </div>
          
          {followUpRequired && (
            <div>
              <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700">
                Follow-up Date
              </label>
              <DatePicker
                selected={followUpDate}
                onChange={(date: Date) => setFollowUpDate(date)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                dateFormat="MMMM d, yyyy"
                minDate={new Date()}
                placeholderText="Select a date"
                required
              />
            </div>
          )}
        </div>
        
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/conversations')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
} 
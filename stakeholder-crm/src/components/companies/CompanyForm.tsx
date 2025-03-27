import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Company } from '../../types';

export default function CompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);

  useEffect(() => {
    // If in edit mode, fetch the company data
    if (isEditMode) {
      fetchCompany();
    }
  }, [id, isEditMode]);

  const fetchCompany = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setName(data.name);
        setIndustry(data.industry || '');
        setWebsite(data.website || '');
        setDescription(data.description || '');
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError('Failed to load company data');
    } finally {
      setFetchLoading(false);
    }
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
    }, 10000); // 10 seconds timeout
    
    try {
      // Log the current user session to debug
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (isEditMode) {
        // Update existing company
        const { error, data } = await supabase
          .from('companies')
          .update({
            name,
            industry,
            website,
            description
          })
          .eq('id', id)
          .select();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Successfully updated company:", data);
      } else {
        // Create new company
        console.log("Creating company with data:", { name, industry, website, description });
        
        const { error, data } = await supabase
          .from('companies')
          .insert([
            {
              name,
              industry,
              website,
              description
            }
          ])
          .select();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Successfully created company:", data);
      }
      
      // Clear the timeout if successful
      clearTimeout(timeoutId);
      
      // Redirect back to companies list
      navigate('/companies');
    } catch (err) {
      // Clear the timeout if there's an error
      clearTimeout(timeoutId);
      
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} company`);
    } finally {
      // Clear the timeout in finally block as well
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit' : 'Add New'} Company</h2>
      
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="text"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="https://example.com"
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/companies')}
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
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

interface LegacyAccess {
  id: string;
  trustee_email: string;
  access_type: 'full' | 'limited';
  created_at: string;
}

export default function LegacyAccess() {
  const { user } = useAuth();
  const [trustees, setTrustees] = useState<LegacyAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTrustee, setNewTrustee] = useState({
    trustee_email: '',
    access_type: 'limited' as LegacyAccess['access_type']
  });

  useEffect(() => {
    fetchTrustees();
  }, [user]);

  const fetchTrustees = async () => {
    try {
      const { data, error } = await supabase
        .from('legacy_access')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrustees(data || []);
    } catch (error) {
      toast.error('Error fetching trustees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('legacy_access')
        .insert([{ ...newTrustee, user_id: user?.id }]);

      if (error) throw error;

      toast.success('Trustee added successfully');
      setShowForm(false);
      setNewTrustee({ trustee_email: '', access_type: 'limited' });
      fetchTrustees();
    } catch (error) {
      toast.error('Error adding trustee');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('legacy_access')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Trustee removed successfully');
      fetchTrustees();
    } catch (error) {
      toast.error('Error removing trustee');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500">Loading trustees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <SEO 
        title="Legacy Access - Look Back"
        description="Manage who can access your memories in the future. Set up trusted contacts and access permissions."
        type="article"
      />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legacy Access</h1>
            <p className="mt-2 text-gray-600">Manage who can access your memories in the future.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Trustee
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Trustee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Trustee Email</label>
                <input
                  type="email"
                  value={newTrustee.trustee_email}
                  onChange={(e) => setNewTrustee({ ...newTrustee, trustee_email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Access Type</label>
                <select
                  value={newTrustee.access_type}
                  onChange={(e) => setNewTrustee({ ...newTrustee, access_type: e.target.value as LegacyAccess['access_type'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="limited">Limited Access</option>
                  <option value="full">Full Access</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Trustee
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added On
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trustees.map((trustee) => (
                <tr key={trustee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trustee.trustee_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      trustee.access_type === 'full' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trustee.access_type === 'full' ? 'Full Access' : 'Limited Access'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(trustee.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(trustee.id)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {trustees.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trustees</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a trustee.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
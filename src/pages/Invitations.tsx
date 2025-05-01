import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaEnvelope, FaCheck, FaTimes, FaPaperPlane, FaInbox } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface Invitation {
  _id: string;
  senderId: User;
  receiverId: User;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface Alumni {
  _id: string;
  name: string;
  email: string;
}

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([]);
  const [role, setRole] = useState<string>('');
  const [receiverEmail, setReceiverEmail] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [alumniList, setAlumniList] = useState<Alumni[]>([]);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    filterInvitations();
  }, [invitations, searchTerm, statusFilter]);

  const fetchUserData = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail') || '';
      
      const [roleResponse, invitationsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/current-user`, {
          headers: { email: localStorage.getItem('email') },
          withCredentials: true,
        }),
        axios.get<Invitation[]>(`${import.meta.env.VITE_API_URL}/api/invitations`, {
          headers: { email: localStorage.getItem('email') }
        })
      ]);
      
      setRole(roleResponse.data.role || '');
      setInvitations(invitationsResponse.data);
      
      if (roleResponse.data.role === 'faculty') {
        axios.get<Alumni[]>(`${import.meta.env.VITE_API_URL}/api/get_alumni`, {
          headers: { email: userEmail }
        }).then(response => {
          setAlumniList(response.data);
        }).catch(err => {
          console.error('Error fetching alumni list:', err);
        });
      }

      setIsInitialLoad(false);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching user data:', err);
      setIsInitialLoad(false);
    }
  };

  const filterInvitations = () => {
    let result = [...invitations];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(inv => 
        (role === 'faculty' 
          ? inv.receiverId.name.toLowerCase().includes(term) || 
            inv.receiverId.email.toLowerCase().includes(term)
          : inv.senderId.name.toLowerCase().includes(term) || 
            inv.senderId.email.toLowerCase().includes(term)) ||
        inv.description.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.status === statusFilter);
    }
    
    setFilteredInvitations(result);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setShowSuccess(false);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/invitations/send`,
        { receiverEmail, description },
        { headers: { email: localStorage.getItem('email') } }
      );
      setDescription('');
      setReceiverEmail('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      fetchUserData();
    } catch (err) {
      setError('Failed to send invitation');
      console.error('Error sending invitation:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResponse = async (invitationId: string, status: 'accepted' | 'rejected') => {
    setIsSending(true);
    try {
      setInvitations(prev => prev.map(inv => 
        inv._id === invitationId ? { ...inv, status } : inv
      ));
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/invitations/${invitationId}/respond`,
        { status },
        { headers: { email: localStorage.getItem('email') } }
      );
      
      fetchUserData();
    } catch (err) {
      setError('Failed to respond to invitation');
      console.error('Error responding to invitation:', err);
      fetchUserData();
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-600">
      {error}
    </div>
  );

  const renderSkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            {role === 'faculty' ? 'Manage Invitations' : 'My Invitations'}
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>
        </motion.div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${role === 'faculty' ? 'sent' : 'received'} invitations...`}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {role === 'faculty' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaPaperPlane className="mr-2 text-blue-600" />
              Send New Invitation
            </h2>
            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Alumni</label>
                {alumniList.length > 0 ? (
                  <select
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Choose an alumni...</option>
                    {alumniList.map((alumni) => (
                      <option key={alumni._id} value={alumni.email}>
                        {alumni.name} ({alumni.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Write your invitation message (minimum 10 characters)..."
                />
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSending}
                  className={`flex items-center px-6 py-2 rounded-lg transition ${
                    isSending ? 'bg-gray-400' : showSuccess ? 'bg-green-600' : 'bg-blue-600'
                  } text-white hover:bg-blue-700`}
                  whileHover={{ scale: isSending ? 1 : 1.05 }}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : showSuccess ? (
                    <>
                      <FaCheck className="mr-2" />
                      Sent
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Send Invitation
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaInbox className="mr-2 text-blue-600" />
              {role === 'faculty' ? 'Sent Invitations' : 'Received Invitations'}
            </h2>
            {!isInitialLoad && (
              <span className="text-sm text-gray-500">
                {filteredInvitations.length} {filteredInvitations.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {isInitialLoad ? (
            renderSkeletonLoader()
          ) : filteredInvitations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-500">No invitations found</p>
              {searchTerm || statusFilter !== 'all' ? (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear filters to see all invitations
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvitations.map((invitation) => (
                <motion.div
                  key={invitation._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-3 h-3 mt-2 rounded-full ${
                            invitation.status === 'pending' ? 'bg-yellow-400' :
                            invitation.status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {role === 'faculty' ? (
                                <>
                                  To: <span className="text-blue-600">{invitation.receiverId.name}</span>
                                  <span className="text-gray-500 text-sm ml-2">({invitation.receiverId.email})</span>
                                </>
                              ) : (
                                <>
                                  From: <span className="text-blue-600">{invitation.senderId.name}</span>
                                  <span className="text-gray-500 text-sm ml-2">({invitation.senderId.email})</span>
                                </>
                              )}
                            </p>
                            <p className="text-gray-600 mt-2">{invitation.description}</p>
                            <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500 space-x-4">
                              <span>
                                <span className="font-medium">Status:</span> 
                                <span className={`ml-1 ${
                                  invitation.status === 'pending' ? 'text-yellow-600' :
                                  invitation.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                                </span>
                              </span>
                              <span>
                                <span className="font-medium">Sent:</span> {formatDate(invitation.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {role === 'alumni' && invitation.status === 'pending' && (
                        <div className="mt-4 sm:mt-0 flex space-x-2">
                          <motion.button
                            onClick={() => handleResponse(invitation._id, 'accepted')}
                            disabled={isSending}
                            className={`flex items-center px-4 py-2 rounded-lg/transition-colors ${
                              isSending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                            whileHover={{ scale: isSending ? 1 : 1.05 }}
                          >
                            {isSending ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <FaCheck className="mr-2" />
                                Accept
                              </>
                            )}
                          </motion.button>
                          <motion.button
                            onClick={() => handleResponse(invitation._id, 'rejected')}
                            disabled={isSending}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                              isSending ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                            } text-white`}
                            whileHover={{ scale: isSending ? 1 : 1.05 }}
                          >
                            {isSending ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <FaTimes className="mr-2" />
                                Reject
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Invitations;
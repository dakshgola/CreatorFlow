/**
 * Example usage of the useFetch hook
 * 
 * This file demonstrates various ways to use the useFetch hook
 * in different scenarios. Copy these examples into your components.
 */

import useFetch from './useFetch';

// ============================================
// Example 1: Basic GET Request
// ============================================
const ExampleBasicFetch = () => {
  const { data, loading, error } = useFetch('/api/clients');

  if (loading) return <div>Loading clients...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Clients</h2>
      {data && data.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
};

// ============================================
// Example 2: POST Request with Body
// ============================================
const ExamplePostRequest = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const { data, loading, error, refetch } = useFetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  }, false); // Don't fetch immediately

  const handleSubmit = (e) => {
    e.preventDefault();
    refetch(); // Trigger fetch on form submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Client'}
      </button>
      {error && <div>Error: {error.message}</div>}
      {data && <div>Success! Client created: {data.id}</div>}
    </form>
  );
};

// ============================================
// Example 3: Lazy Loading / Manual Trigger
// ============================================
const ExampleLazyFetch = () => {
  const { data, loading, error, refetch } = useFetch('/api/tasks', {}, false);

  return (
    <div>
      <button onClick={refetch} disabled={loading}>
        {loading ? 'Loading...' : 'Load Tasks'}
      </button>
      {error && <div>Error: {error.message}</div>}
      {data && (
        <ul>
          {data.map(task => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ============================================
// Example 4: With Authentication Headers
// ============================================
const ExampleWithAuth = () => {
  const token = localStorage.getItem('authToken');
  
  const { data, loading, error } = useFetch('/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {data?.name}</p>
      <p>Email: {data?.email}</p>
    </div>
  );
};

// ============================================
// Example 5: Conditional Fetching
// ============================================
const ExampleConditionalFetch = ({ clientId }) => {
  // Only fetch if clientId exists
  const { data, loading, error } = useFetch(
    clientId ? `/api/clients/${clientId}` : null
  );

  if (!clientId) return <div>Please select a client</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Client: {data?.name}</div>;
};

// ============================================
// Example 6: Error Handling with Retry
// ============================================
const ExampleWithRetry = () => {
  const { data, loading, error, refetch } = useFetch('/api/clients');

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={refetch}>Retry</button>
        </div>
      )}
      {data && (
        <div>
          {data.map(client => (
            <div key={client.id}>{client.name}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Example 7: Using in Dashboard Component
// ============================================
const ExampleDashboard = () => {
  const { data: clients, loading: clientsLoading } = useFetch('/api/clients');
  const { data: tasks, loading: tasksLoading } = useFetch('/api/tasks');
  const { data: stats, loading: statsLoading } = useFetch('/api/stats');

  const isLoading = clientsLoading || tasksLoading || statsLoading;

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Total Clients: {clients?.length || 0}</div>
      <div>Pending Tasks: {tasks?.filter(t => !t.completed).length || 0}</div>
      <div>Revenue: ${stats?.revenue || 0}</div>
    </div>
  );
};

export {
  ExampleBasicFetch,
  ExamplePostRequest,
  ExampleLazyFetch,
  ExampleWithAuth,
  ExampleConditionalFetch,
  ExampleWithRetry,
  ExampleDashboard,
};



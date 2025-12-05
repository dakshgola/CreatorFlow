/**
 * useApi Hook Usage Examples
 * 
 * This file demonstrates various ways to use the useApi hook
 * for making API calls in your React components.
 */

import useApi from './useApi';

// ============================================
// Example 1: Basic GET Request (Manual Trigger)
// ============================================
const ExampleBasicGet = () => {
  const { data, loading, error, callApi } = useApi('/clients');

  useEffect(() => {
    callApi();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data?.data?.map(client => (
        <div key={client._id}>{client.name}</div>
      ))}
    </div>
  );
};

// ============================================
// Example 2: Immediate GET Request
// ============================================
const ExampleImmediateGet = () => {
  const { data, loading, error } = useApi('/clients', { immediate: true });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Clients: {data?.count}</div>;
};

// ============================================
// Example 3: POST Request with Body
// ============================================
const ExamplePost = () => {
  const { data, loading, error, callApi } = useApi('/clients', {
    method: 'POST',
    body: {
      name: 'New Client',
      niche: 'Technology',
      paymentRate: 5000,
    },
  });

  const handleSubmit = () => {
    callApi();
  };

  return (
    <button onClick={handleSubmit} disabled={loading}>
      {loading ? 'Creating...' : 'Create Client'}
    </button>
  );
};

// ============================================
// Example 4: PUT Request (Update)
// ============================================
const ExampleUpdate = ({ clientId }) => {
  const { data, loading, error, callApi } = useApi(`/clients/${clientId}`, {
    method: 'PUT',
  });

  const handleUpdate = (updates) => {
    callApi({ body: updates });
  };

  return (
    <button onClick={() => handleUpdate({ name: 'Updated Name' })}>
      Update Client
    </button>
  );
};

// ============================================
// Example 5: DELETE Request
// ============================================
const ExampleDelete = ({ clientId }) => {
  const { data, loading, error, callApi } = useApi(`/clients/${clientId}`, {
    method: 'DELETE',
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure?')) {
      callApi();
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
};

// ============================================
// Example 6: Public Endpoint (No Auth)
// ============================================
const ExampleLogin = () => {
  const { data, loading, error, callApi } = useApi('/auth/login', {
    method: 'POST',
    authRequired: false,
  });

  const handleLogin = (email, password) => {
    callApi({
      body: { email, password },
    });
  };

  return (
    <button onClick={() => handleLogin('user@example.com', 'password')}>
      Login
    </button>
  );
};

// ============================================
// Example 7: Using with Form Data
// ============================================
const ExampleForm = () => {
  const { data, loading, error, callApi, reset } = useApi('/clients', {
    method: 'POST',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      niche: e.target.niche.value,
      paymentRate: parseFloat(e.target.paymentRate.value),
    };
    
    callApi({ body: formData });
  };

  // Reset form after successful submission
  useEffect(() => {
    if (data?.success) {
      reset();
      // Reset form or show success message
    }
  }, [data, reset]);

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Client Name" />
      <input name="niche" placeholder="Niche" />
      <input name="paymentRate" type="number" placeholder="Payment Rate" />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

// ============================================
// Example 8: Conditional API Call
// ============================================
const ExampleConditional = ({ clientId }) => {
  const { data, loading, error, callApi } = useApi(`/clients/${clientId}`);

  useEffect(() => {
    if (clientId) {
      callApi();
    }
  }, [clientId, callApi]);

  if (!clientId) return <div>No client selected</div>;
  if (loading) return <div>Loading client...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Client: {data?.data?.name}</div>;
};

// ============================================
// Example 9: Using with Custom Headers
// ============================================
const ExampleCustomHeaders = () => {
  const { data, loading, error, callApi } = useApi('/api/endpoint', {
    headers: {
      'X-Custom-Header': 'custom-value',
    },
  });

  return (
    <button onClick={() => callApi()}>
      Make Request with Custom Headers
    </button>
  );
};

// ============================================
// Example 10: Refetch Pattern
// ============================================
const ExampleRefetch = () => {
  const { data, loading, error, callApi } = useApi('/clients');

  useEffect(() => {
    callApi();
  }, []);

  const handleRefresh = () => {
    callApi(); // Refetch data
  };

  return (
    <div>
      <button onClick={handleRefresh} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
      {/* Display data */}
    </div>
  );
};

// ============================================
// Example 11: Using in AI Tools Component
// ============================================
const ExampleAITools = () => {
  const [prompt, setPrompt] = useState('');
  const { data, loading, error, callApi } = useApi('/ai/ideas', {
    method: 'POST',
  });

  const handleGenerate = () => {
    callApi({
      body: {
        prompt: prompt,
        niche: 'Technology',
        count: 5,
      },
    });
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Ideas'}
      </button>
      {data?.data && (
        <div>
          {data.data.map((idea, index) => (
            <div key={index}>{idea.title}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export {
  ExampleBasicGet,
  ExampleImmediateGet,
  ExamplePost,
  ExampleUpdate,
  ExampleDelete,
  ExampleLogin,
  ExampleForm,
  ExampleConditional,
  ExampleCustomHeaders,
  ExampleRefetch,
  ExampleAITools,
};



import React, { useState } from 'react';
import axios from 'axios';

const GuardApp = () => {
  const [visitorId, setVisitorId] = useState('');
  const [status, setStatus] = useState(null);

  const checkVisitorStatus = async () => {
    try {
      const response = await axios.get(`/api/visitors/check-status/${visitorId}`);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error checking visitor status:', error);
      setStatus('unknown');
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'approved':
        return <div style={{ color: 'green' }}>✅ Approved</div>;
      case 'pending':
        return <div style={{ color: 'yellow' }}>⏳ Pending Approval</div>;
      case 'denied':
        return <div style={{ color: 'red' }}>❌ Denied</div>;
      default:
        return <div style={{ color: 'gray' }}>⚠️ Unknown Visitor</div>;
    }
  };

  return (
    <div>
      <h1>Guard App</h1>
      <input
        type="text"
        placeholder="Enter Visitor ID"
        value={visitorId}
        onChange={(e) => setVisitorId(e.target.value)}
      />
      <button onClick={checkVisitorStatus}>Check Status</button>
      {status && <div>{getStatusIndicator()}</div>}
    </div>
  );
};

export default GuardApp;
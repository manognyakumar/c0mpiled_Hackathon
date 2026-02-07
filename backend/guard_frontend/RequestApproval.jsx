import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PhotoCapture from './PhotoCapture';

const RequestApproval = () => {
  const [visitorName, setVisitorName] = useState('');
  const [apartment, setApartment] = useState('');
  const [purpose, setPurpose] = useState('');
  const [photo, setPhoto] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null);

  const submitRequest = async () => {
    try {
      const response = await axios.post('/api/visitors/request-approval', {
        name: visitorName,
        apartment,
        purpose,
        photo,
      });
      setApprovalStatus('pending');
      pollApprovalStatus(response.data.requestId);
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const pollApprovalStatus = (requestId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/visitors/approval-status/${requestId}`);
        if (response.data.status !== 'pending') {
          setApprovalStatus(response.data.status);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling approval status:', error);
      }
    }, 5000);
  };

  return (
    <div>
      <h1>Request Approval</h1>
      <input
        type="text"
        placeholder="Visitor Name"
        value={visitorName}
        onChange={(e) => setVisitorName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Apartment"
        value={apartment}
        onChange={(e) => setApartment(e.target.value)}
      />
      <input
        type="text"
        placeholder="Purpose"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      />
      <PhotoCapture onPhotoCaptured={setPhoto} />
      <button onClick={submitRequest}>Submit Request</button>
      {approvalStatus && <div>Approval Status: {approvalStatus}</div>}
    </div>
  );
};

export default RequestApproval;
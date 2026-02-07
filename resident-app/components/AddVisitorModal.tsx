/**
 * AddVisitorModal — Form to pre-approve a visitor via the backend.
 */
'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal';
import Button from '@/components/shared/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddVisitorModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName('');
    setPhone('');
    setPurpose('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !purpose.trim()) {
      setError('Name and purpose are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/visitors/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_name: name.trim(),
          visitor_phone: phone.trim() || undefined,
          purpose: purpose.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Failed to add visitor.');
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1200);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <Modal.Header>
        <h2 className="text-title text-ink">Add Visitor</h2>
        <p className="text-caption text-ink-muted mt-1">Pre-approve a new visitor</p>
      </Modal.Header>

      <Modal.Body>
        {success ? (
          <div className="text-center py-6">
            <span className="text-4xl">✅</span>
            <p className="text-body text-status-success mt-3 font-medium">Visitor added successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-caption text-status-error">
                {error}
              </div>
            )}

            <div>
              <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                Visitor Name <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full px-4 py-2.5 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +971 50 123 4567"
                className="w-full px-4 py-2.5 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-caption text-ink-secondary mb-1.5 font-medium">
                Purpose <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Delivery, Meeting, Maintenance"
                className="w-full px-4 py-2.5 rounded-button border border-base-border bg-base-surface text-body text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>
          </div>
        )}
      </Modal.Body>

      {!success && (
        <Modal.Footer>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={loading}>
            Add Visitor
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}

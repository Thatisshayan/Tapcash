"use client";
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'vpn' | 'bot' | 'duplicate_device' | 'suspicious_pattern' | 'rapid_completion' | 'ip_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: any;
  status: 'pending' | 'reviewed' | 'resolved' | 'false_positive';
  timestamp: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

interface FraudStats {
  totalAlerts: number;
  pendingAlerts: number;
  criticalAlerts: number;
  bannedUsers: number;
  blockedIPs: number;
  detectionRate: number;
}

export default function FraudDetection() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const loadFraudData = useCallback(async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/fraud', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 403) {
        router.push('/dashboard');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch fraud data');
      }

      const data = await response.json();
      setAlerts(data.alerts);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fraud data');
    } finally {
      setIsLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      loadFraudData();
    }
  }, [user, loading, loadFraudData]);

  const handleReviewAlert = async (alertId: string, status: string, notes: string, action?: 'ban' | 'suspend') => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/fraud', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ alertId, status, notes, action })
      });

      if (!response.ok) {
        throw new Error('Failed to review alert');
      }

      await loadFraudData();
      setShowAlertModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to review alert');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    return matchesType && matchesSeverity && matchesStatus;
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fraud detection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🛡️ Fraud Detection</h1>
              <p className="text-gray-600 mt-1">Monitor and manage suspicious activity</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Total Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalAlerts || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats?.pendingAlerts || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Critical</p>
            <p className="text-2xl font-bold text-red-600">{stats?.criticalAlerts || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Banned Users</p>
            <p className="text-2xl font-bold text-red-600">{stats?.bannedUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Blocked IPs</p>
            <p className="text-2xl font-bold text-orange-600">{stats?.blockedIPs || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm">Detection Rate</p>
            <p className="text-2xl font-bold text-green-600">{stats?.detectionRate.toFixed(1) || 0}%</p>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {stats && stats.criticalAlerts > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <span className="font-medium">⚠️ {stats.criticalAlerts} critical alerts</span> require immediate attention!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="vpn">VPN Detection</option>
                <option value="bot">Bot Detection</option>
                <option value="duplicate_device">Duplicate Device</option>
                <option value="suspicious_pattern">Suspicious Pattern</option>
                <option value="rapid_completion">Rapid Completion</option>
                <option value="ip_mismatch">IP Mismatch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No fraud alerts found
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{alert.userName}</div>
                          <div className="text-sm text-gray-500">{alert.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {alert.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {alert.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          alert.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowAlertModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 font-medium"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alert Review Modal */}
      {showAlertModal && selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setShowAlertModal(false)}
          onReview={handleReviewAlert}
        />
      )}
    </div>
  );
}

function AlertModal({ alert, onClose, onReview }: {
  alert: FraudAlert;
  onClose: () => void;
  onReview: (alertId: string, status: string, notes: string, action?: 'ban' | 'suspend') => void;
}) {
  const [notes, setNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState<'ban' | 'suspend' | undefined>();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Fraud Alert Review</h2>
              <p className="text-gray-600 font-mono text-sm">{alert.id}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Alert Details */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium mt-1 capitalize">{alert.type.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">User</p>
              <p className="font-medium">{alert.userName}</p>
              <p className="text-sm text-gray-500">{alert.userEmail}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{alert.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Detected</p>
              <p className="font-medium">{new Date(alert.timestamp).toLocaleString()}</p>
            </div>

            {alert.metadata && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Additional Details</p>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(alert.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Review Actions */}
          {alert.status === 'pending' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your review notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Action (Optional)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAction(selectedAction === 'suspend' ? undefined : 'suspend')}
                    className={`px-4 py-2 rounded-lg ${
                      selectedAction === 'suspend'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Suspend User
                  </button>
                  <button
                    onClick={() => setSelectedAction(selectedAction === 'ban' ? undefined : 'ban')}
                    className={`px-4 py-2 rounded-lg ${
                      selectedAction === 'ban'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Ban User
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onReview(alert.id, 'resolved', notes, selectedAction)}
                  disabled={!notes}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                >
                  ✓ Confirm & Resolve
                </button>
                <button
                  onClick={() => onReview(alert.id, 'false_positive', notes)}
                  disabled={!notes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Mark as False Positive
                </button>
              </div>
            </div>
          )}

          {alert.status !== 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Status:</strong> {alert.status}
              </p>
              {alert.reviewedBy && (
                <p className="text-sm text-blue-900 mt-1">
                  <strong>Reviewed by:</strong> {alert.reviewedBy} on {new Date(alert.reviewedAt!).toLocaleString()}
                </p>
              )}
              {alert.notes && (
                <p className="text-sm text-blue-900 mt-1">
                  <strong>Notes:</strong> {alert.notes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob

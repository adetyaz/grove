"use client";

import { useState, useEffect } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";

interface UserPunishmentStatusProps {
  circleId?: string;
}

interface PunishmentStatus {
  activePunishments: Punishment[];
  recentViolations: Violation[];
  pendingAppeals: Appeal[];
  suspensions: Suspension[];
}

interface Punishment {
  id: string;
  type: string;
  severity: number;
  description: string;
  status: string;
  appliedAt: string;
  expiresAt?: string;
  fineAmount?: string;
  appealAllowed: boolean;
}

interface Violation {
  id: string;
  type: string;
  description?: string;
  createdAt: string;
}

interface Appeal {
  id: string;
  punishmentId: string;
  reason: string;
  status: string;
  submittedAt: string;
}

interface Suspension {
  id: string;
  reason: string;
  suspendedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export default function UserPunishmentStatus({
  circleId,
}: UserPunishmentStatusProps) {
  const [status, setStatus] = useState<PunishmentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [appealForm, setAppealForm] = useState<{
    show: boolean;
    punishmentId: string;
    reason: string;
    evidence: string;
  }>({
    show: false,
    punishmentId: "",
    reason: "",
    evidence: "",
  });

  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  useEffect(() => {
    if (address) {
      fetchStatus();
    }
  }, [address, circleId]);

  const fetchStatus = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ userAddress: address });
      if (circleId) params.append("circleId", circleId);

      const response = await fetch(`/api/punishments?${params}`);
      const data = await response.json();

      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch punishment status:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitAppeal = async () => {
    if (!address || !appealForm.punishmentId || !appealForm.reason) {
      groveToast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/punishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          punishmentId: appealForm.punishmentId,
          reason: appealForm.reason,
          evidence: appealForm.evidence,
        }),
      });

      const data = await response.json();

      if (data.success) {
        groveToast.success("Appeal submitted successfully");
        setAppealForm({
          show: false,
          punishmentId: "",
          reason: "",
          evidence: "",
        });
        fetchStatus();
      } else {
        groveToast.error(data.error || "Failed to submit appeal");
      }
    } catch (error) {
      console.error("Failed to submit appeal:", error);
      groveToast.error("Failed to submit appeal");
    }
  };

  const getPunishmentTypeIcon = (type: string) => {
    switch (type) {
      case "WARNING":
        return "⚠️";
      case "FINE":
        return "💰";
      case "SUSPENSION":
        return "⏸️";
      case "STREAK_RESET":
        return "🔄";
      case "MEMBERSHIP_TERMINATION":
        return "🚫";
      case "CONTRIBUTION_HOLD":
        return "⏳";
      default:
        return "❗";
    }
  };

  const getPunishmentTypeColor = (type: string) => {
    switch (type) {
      case "WARNING":
        return "text-yellow-300 bg-yellow-500/20 border-yellow-500/30";
      case "FINE":
        return "text-orange-300 bg-orange-500/20 border-orange-500/30";
      case "SUSPENSION":
        return "text-red-300 bg-red-500/20 border-red-500/30";
      case "STREAK_RESET":
        return "text-blue-300 bg-blue-500/20 border-blue-500/30";
      case "MEMBERSHIP_TERMINATION":
        return "text-red-600 bg-red-600/20 border-red-600/30";
      case "CONTRIBUTION_HOLD":
        return "text-gray-300 bg-gray-500/20 border-gray-500/30";
      default:
        return "text-gray-300 bg-gray-500/20 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-300 rounded w-1/4 mb-4'></div>
          <div className='space-y-3'>
            <div className='h-4 bg-gray-300 rounded w-full'></div>
            <div className='h-4 bg-gray-300 rounded w-3/4'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const hasAnyIssues =
    status.activePunishments.length > 0 ||
    status.recentViolations.length > 0 ||
    status.suspensions.length > 0;

  if (!hasAnyIssues) {
    return (
      <div className='bg-green-500/20 border border-green-500/30 rounded-lg p-4'>
        <div className='flex items-center space-x-3'>
          <span className='text-2xl'>✅</span>
          <div>
            <h3 className='text-green-300 font-semibold'>Good Standing</h3>
            <p className='text-green-200 text-sm'>
              No active punishments or violations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Active Suspensions */}
      {status.suspensions.length > 0 && (
        <div className='bg-red-500/20 border border-red-500/30 rounded-lg p-4'>
          <h3 className='text-red-300 font-semibold mb-3 flex items-center'>
            <span className='mr-2'>⏸️</span>
            Active Suspensions
          </h3>
          {status.suspensions.map((suspension) => (
            <div key={suspension.id} className='bg-red-600/20 rounded-lg p-3'>
              <p className='text-red-200 font-medium'>{suspension.reason}</p>
              <p className='text-red-300 text-sm'>
                Suspended until:{" "}
                {new Date(suspension.expiresAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Active Punishments */}
      {status.activePunishments.length > 0 && (
        <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20'>
          <h3 className='text-white font-semibold mb-4 flex items-center'>
            <span className='mr-2'>⚖️</span>
            Active Punishments ({status.activePunishments.length})
          </h3>
          <div className='space-y-3'>
            {status.activePunishments.map((punishment) => (
              <div
                key={punishment.id}
                className={`border rounded-lg p-4 ${getPunishmentTypeColor(
                  punishment.type
                )}`}
              >
                <div className='flex justify-between items-start mb-2'>
                  <div className='flex items-center space-x-3'>
                    <span className='text-2xl'>
                      {getPunishmentTypeIcon(punishment.type)}
                    </span>
                    <div>
                      <h4 className='font-semibold'>
                        {punishment.type.replace("_", " ")}
                      </h4>
                      <p className='text-sm opacity-80'>
                        Severity: {punishment.severity}/10
                      </p>
                    </div>
                  </div>
                  {punishment.appealAllowed && (
                    <button
                      onClick={() =>
                        setAppealForm({
                          show: true,
                          punishmentId: punishment.id,
                          reason: "",
                          evidence: "",
                        })
                      }
                      className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'
                    >
                      Appeal
                    </button>
                  )}
                </div>
                <p className='text-sm mb-2'>{punishment.description}</p>
                <div className='flex justify-between text-xs opacity-70'>
                  <span>
                    Applied:{" "}
                    {new Date(punishment.appliedAt).toLocaleDateString()}
                  </span>
                  {punishment.expiresAt && (
                    <span>
                      Expires:{" "}
                      {new Date(punishment.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  {punishment.fineAmount && (
                    <span>Fine: {punishment.fineAmount} sats</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Appeals */}
      {status.pendingAppeals.length > 0 && (
        <div className='bg-blue-500/20 border border-blue-500/30 rounded-lg p-4'>
          <h3 className='text-blue-300 font-semibold mb-3 flex items-center'>
            <span className='mr-2'>🔄</span>
            Pending Appeals ({status.pendingAppeals.length})
          </h3>
          {status.pendingAppeals.map((appeal) => (
            <div key={appeal.id} className='bg-blue-600/20 rounded-lg p-3 mb-2'>
              <p className='text-blue-200 text-sm'>{appeal.reason}</p>
              <p className='text-blue-300 text-xs'>
                Submitted: {new Date(appeal.submittedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Violations */}
      {status.recentViolations.length > 0 && (
        <div className='bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4'>
          <h3 className='text-yellow-300 font-semibold mb-3 flex items-center'>
            <span className='mr-2'>❗</span>
            Recent Violations ({status.recentViolations.length})
          </h3>
          {status.recentViolations.slice(0, 3).map((violation) => (
            <div
              key={violation.id}
              className='bg-yellow-600/20 rounded-lg p-3 mb-2'
            >
              <p className='text-yellow-200 font-medium'>
                {violation.type.replace("_", " ")}
              </p>
              <p className='text-yellow-300 text-sm'>
                {new Date(violation.createdAt).toLocaleDateString()}
              </p>
              {violation.description && (
                <p className='text-yellow-200 text-xs mt-1'>
                  {violation.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Appeal Form Modal */}
      {appealForm.show && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full'>
            <h2 className='text-2xl font-bold text-white mb-6'>
              Submit Appeal
            </h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Reason for Appeal *
                </label>
                <textarea
                  value={appealForm.reason}
                  onChange={(e) =>
                    setAppealForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                  rows={3}
                  placeholder='Explain why this punishment should be overturned...'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Evidence (Optional)
                </label>
                <textarea
                  value={appealForm.evidence}
                  onChange={(e) =>
                    setAppealForm((prev) => ({
                      ...prev,
                      evidence: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
                  rows={2}
                  placeholder='Provide any supporting evidence...'
                />
              </div>
            </div>

            <div className='flex space-x-4 mt-6'>
              <button
                onClick={() =>
                  setAppealForm({
                    show: false,
                    punishmentId: "",
                    reason: "",
                    evidence: "",
                  })
                }
                className='flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={submitAppeal}
                disabled={!appealForm.reason}
                className='flex-1 py-2 px-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors'
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

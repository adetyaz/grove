"use client";

import { useState, useEffect } from "react";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";

interface Violation {
  id: string;
  userAddress: string;
  circleId: string;
  type: string;
  description?: string;
  createdAt: string;
  punishments: Punishment[];
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

interface Appeal {
  id: string;
  userAddress: string;
  punishmentId: string;
  reason: string;
  evidence?: string;
  status: string;
  submittedAt: string;
}

export default function PunishmentManagement() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "violations" | "appeals" | "stats"
  >("violations");

  const { primaryWallet } = useDynamicConnection();
  const address = primaryWallet?.address;

  useEffect(() => {
    if (address) {
      fetchData();
    }
  }, [address, selectedUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [violationsRes, appealsRes] = await Promise.all([
        fetch(
          `/api/admin/violations${
            selectedUser ? `?userAddress=${selectedUser}` : ""
          }`
        ),
        fetch("/api/admin/appeals"),
      ]);

      if (violationsRes.ok) {
        const violationsData = await violationsRes.json();
        setViolations(violationsData.violations || []);
      }

      if (appealsRes.ok) {
        const appealsData = await appealsRes.json();
        setAppeals(appealsData.appeals || []);
      }
    } catch (error) {
      console.error("Failed to fetch punishment data:", error);
      groveToast.error("Failed to load punishment data");
    } finally {
      setLoading(false);
    }
  };

  const handleAppeal = async (
    appealId: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    try {
      const response = await fetch("/api/admin/appeals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appealId,
          action,
          reviewedBy: address,
          reviewNotes: notes,
        }),
      });

      if (response.ok) {
        groveToast.success(`Appeal ${action}d successfully`);
        fetchData();
      } else {
        throw new Error("Failed to process appeal");
      }
    } catch (error) {
      console.error("Failed to process appeal:", error);
      groveToast.error("Failed to process appeal");
    }
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case "MISSED_PAYMENT":
        return "text-red-400 bg-red-500/20";
      case "LATE_PAYMENT":
        return "text-yellow-400 bg-yellow-500/20";
      case "INSUFFICIENT_FUNDS":
        return "text-orange-400 bg-orange-500/20";
      case "REPEATED_FAILURES":
        return "text-red-600 bg-red-600/20";
      case "FRAUDULENT_ACTIVITY":
        return "text-red-800 bg-red-800/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getPunishmentTypeColor = (type: string) => {
    switch (type) {
      case "WARNING":
        return "text-yellow-300 bg-yellow-500/20";
      case "FINE":
        return "text-orange-300 bg-orange-500/20";
      case "SUSPENSION":
        return "text-red-300 bg-red-500/20";
      case "MEMBERSHIP_TERMINATION":
        return "text-red-600 bg-red-600/20";
      default:
        return "text-gray-300 bg-gray-500/20";
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold text-white'>
              Punishment Management
            </h1>
            <div className='flex space-x-4'>
              <input
                type='text'
                placeholder='Filter by user address...'
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className='px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className='px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50'
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className='flex space-x-1 mb-6 bg-white/5 rounded-lg p-1'>
            {["violations", "appeals", "stats"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-purple-500 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab}{" "}
                {tab === "appeals" &&
                  appeals.filter((a) => a.status === "PENDING").length > 0 && (
                    <span className='ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full'>
                      {appeals.filter((a) => a.status === "PENDING").length}
                    </span>
                  )}
              </button>
            ))}
          </div>

          {/* Violations Tab */}
          {activeTab === "violations" && (
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold text-white mb-4'>
                Recent Violations
              </h2>
              {violations.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span className='text-2xl'>⚖️</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    No Violations
                  </h3>
                  <p className='text-gray-300'>
                    All users are following the rules!
                  </p>
                </div>
              ) : (
                violations.map((violation) => (
                  <div
                    key={violation.id}
                    className='bg-white/5 border border-white/10 rounded-lg p-6'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <div className='flex items-center space-x-3 mb-2'>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getViolationTypeColor(
                              violation.type
                            )}`}
                          >
                            {violation.type.replace("_", " ")}
                          </span>
                          <span className='text-gray-400 text-sm'>
                            {new Date(violation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className='text-white font-medium'>
                          User: {violation.userAddress.slice(0, 10)}...
                        </p>
                        <p className='text-gray-300 text-sm'>
                          Circle: {violation.circleId}
                        </p>
                        {violation.description && (
                          <p className='text-gray-300 text-sm mt-1'>
                            {violation.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Applied Punishments */}
                    {violation.punishments.length > 0 && (
                      <div className='mt-4'>
                        <h4 className='text-gray-300 text-sm font-medium mb-2'>
                          Applied Punishments
                        </h4>
                        <div className='space-y-2'>
                          {violation.punishments.map((punishment) => (
                            <div
                              key={punishment.id}
                              className='flex justify-between items-center bg-white/5 rounded-lg p-3'
                            >
                              <div className='flex items-center space-x-3'>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPunishmentTypeColor(
                                    punishment.type
                                  )}`}
                                >
                                  {punishment.type}
                                </span>
                                <span className='text-white text-sm'>
                                  {punishment.description}
                                </span>
                                <span className='text-gray-400 text-xs'>
                                  Severity: {punishment.severity}/10
                                </span>
                              </div>
                              <div className='flex items-center space-x-2'>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    punishment.status === "ACTIVE"
                                      ? "bg-green-500/20 text-green-300"
                                      : "bg-gray-500/20 text-gray-300"
                                  }`}
                                >
                                  {punishment.status}
                                </span>
                                {punishment.fineAmount && (
                                  <span className='text-yellow-300 text-xs'>
                                    Fine: {punishment.fineAmount} sats
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Appeals Tab */}
          {activeTab === "appeals" && (
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold text-white mb-4'>
                Punishment Appeals
              </h2>
              {appeals.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <span className='text-2xl'>🔄</span>
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    No Appeals
                  </h3>
                  <p className='text-gray-300'>
                    No punishment appeals to review.
                  </p>
                </div>
              ) : (
                appeals.map((appeal) => (
                  <div
                    key={appeal.id}
                    className='bg-white/5 border border-white/10 rounded-lg p-6'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <div className='flex items-center space-x-3 mb-2'>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              appeal.status === "PENDING"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : appeal.status === "APPROVED"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {appeal.status}
                          </span>
                          <span className='text-gray-400 text-sm'>
                            {new Date(appeal.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className='text-white font-medium'>
                          User: {appeal.userAddress.slice(0, 10)}...
                        </p>
                        <p className='text-gray-300 text-sm'>
                          Punishment ID: {appeal.punishmentId}
                        </p>
                      </div>
                      {appeal.status === "PENDING" && (
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handleAppeal(appeal.id, "approve")}
                            className='px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600'
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAppeal(appeal.id, "reject")}
                            className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600'
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    <div className='space-y-3'>
                      <div>
                        <h4 className='text-gray-300 text-sm font-medium mb-1'>
                          Reason
                        </h4>
                        <p className='text-white text-sm'>{appeal.reason}</p>
                      </div>
                      {appeal.evidence && (
                        <div>
                          <h4 className='text-gray-300 text-sm font-medium mb-1'>
                            Evidence
                          </h4>
                          <p className='text-white text-sm'>
                            {appeal.evidence}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-white font-semibold mb-2'>
                  Total Violations
                </h3>
                <p className='text-3xl font-bold text-purple-400'>
                  {violations.length}
                </p>
              </div>
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-white font-semibold mb-2'>
                  Pending Appeals
                </h3>
                <p className='text-3xl font-bold text-yellow-400'>
                  {appeals.filter((a) => a.status === "PENDING").length}
                </p>
              </div>
              <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
                <h3 className='text-white font-semibold mb-2'>
                  Active Punishments
                </h3>
                <p className='text-3xl font-bold text-red-400'>
                  {violations.reduce(
                    (acc, v) =>
                      acc +
                      v.punishments.filter((p) => p.status === "ACTIVE").length,
                    0
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWriteContract } from "wagmi";
import { useDynamicConnection } from "@/hooks/useDynamicConnection";
import { groveToast } from "@/lib/toast";
import InheritanceForm from "./inheritance-form";
import InheritanceClaimForm from "./inheritance-claim-form";

interface InheritancePanelProps {
  circleId: number;
  circleMembers: string[];
}

export default function InheritancePanel({
  circleId,
  circleMembers,
}: InheritancePanelProps) {
  const [showSetBeneficiaries, setShowSetBeneficiaries] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedDeceasedMember, setSelectedDeceasedMember] = useState("");
  const [showActivateForm, setShowActivateForm] = useState(false);
  const [activationReason, setActivationReason] = useState("");
  
  const { primaryWallet } = useDynamicConnection();
  const { writeContractAsync } = useWriteContract();
  const address = primaryWallet?.address;

  // Fetch user's current beneficiaries
  const { data: userBeneficiaries, refetch: refetchBeneficiaries } = useQuery({
    queryKey: ["inheritance-beneficiaries", circleId, address],
    queryFn: async () => {
      if (!address) return null;
      const response = await fetch(
        `/api/inheritance/${circleId}/beneficiaries?member=${address}`
      );
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!address,
  });

  // Fetch inheritance status for other members (for activation)
  const { data: memberInheritanceStatus } = useQuery({
    queryKey: ["inheritance-status", circleId, circleMembers],
    queryFn: async () => {
      if (!address || circleMembers.length === 0) return [];
      
      const statusPromises = circleMembers.map(async (member) => {
        if (member === address) return null; // Skip self
        
        try {
          const response = await fetch(
            `/api/inheritance/${circleId}/activate?deceased=${member}&activator=${address}`
          );
          if (!response.ok) return null;
          const data = await response.json();
          return { member, ...data };
        } catch {
          return null;
        }
      });
      
      const results = await Promise.all(statusPromises);
      return results.filter(Boolean);
    },
    enabled: !!address && circleMembers.length > 0,
  });

  const handleActivateInheritance = async (deceasedAddress: string, reason: string) => {
    try {
      const response = await fetch(`/api/inheritance/${circleId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deceasedAddress,
          reason,
          activatorAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate inheritance");
      }

      const { transactionData } = await response.json();
      
      // Execute the activation transaction
      const txHash = await writeContractAsync({
        address: transactionData.contractAddress as `0x${string}`,
        abi: transactionData.abi,
        functionName: transactionData.functionName,
        args: transactionData.args,
      });
      
      groveToast.success("Inheritance activated successfully!");
      console.log("Inheritance activated with tx hash:", txHash);
      
    } catch (error: any) {
      groveToast.error("Failed to activate inheritance: " + (error?.message || "Unknown error"));
      console.error("Error activating inheritance:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Inheritance Management</h3>
        
        {/* Your Beneficiaries Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Your Beneficiaries</h4>
            <button
              onClick={() => setShowSetBeneficiaries(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              {userBeneficiaries?.beneficiaries?.length > 0 ? "Update" : "Set"} Beneficiaries
            </button>
          </div>
          
          {userBeneficiaries?.beneficiaries?.length > 0 ? (
            <div className="space-y-2">
              {userBeneficiaries.beneficiaries.map((beneficiary: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                  <span className="text-white/80 font-mono text-sm">
                    {beneficiary.beneficiary}
                  </span>
                  <span className="text-green-400 font-semibold">
                    {(beneficiary.share / 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-4">
              No beneficiaries set. Your funds will be locked if something happens to you.
            </div>
          )}
        </div>

        {/* Member Inheritance Status */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Member Inheritance Status</h4>
          
          {memberInheritanceStatus && memberInheritanceStatus.length > 0 ? (
            <div className="space-y-3">
              {memberInheritanceStatus.map((status: any) => (
                <div key={status.member} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-white/80 font-mono text-sm">
                      {status.member}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      status.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {status.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-white/60">
                      {status.canActivate ? 'Can activate inheritance' : 'Cannot activate yet'}
                    </div>
                    
                    <div className="flex space-x-2">
                      {status.isActive && (
                        <button
                          onClick={() => {
                            setSelectedDeceasedMember(status.member);
                            setShowClaimForm(true);
                          }}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
                        >
                          Claim
                        </button>
                      )}
                      
                      {status.canActivate && !status.isActive && (
                        <button
                          onClick={() => {
                            setSelectedDeceasedMember(status.member);
                            setShowActivateForm(true);
                          }}
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-4">
              No other members in this circle.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSetBeneficiaries && (
        <InheritanceForm
          circleId={circleId}
          onSuccess={() => {
            refetchBeneficiaries();
            setShowSetBeneficiaries(false);
          }}
          onClose={() => setShowSetBeneficiaries(false)}
        />
      )}

      {showClaimForm && selectedDeceasedMember && (
        <InheritanceClaimForm
          circleId={circleId}
          deceasedAddress={selectedDeceasedMember}
          onSuccess={() => setShowClaimForm(false)}
          onClose={() => setShowClaimForm(false)}
        />
      )}

      {/* Activation Modal */}
      {showActivateForm && selectedDeceasedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              Activate Inheritance
            </h2>
            
            <div className="space-y-4 mb-6">
              <p className="text-white/80">
                <strong>Member:</strong> {selectedDeceasedMember}
              </p>
              
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Activation Reason
                </label>
                <textarea
                  value={activationReason}
                  onChange={(e) => setActivationReason(e.target.value)}
                  placeholder="Please provide a reason for activating inheritance..."
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 resize-none h-24"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowActivateForm(false);
                  setActivationReason("");
                }}
                className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleActivateInheritance(selectedDeceasedMember, activationReason);
                  setShowActivateForm(false);
                  setActivationReason("");
                }}
                disabled={!activationReason.trim()}
                className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
              >
                Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

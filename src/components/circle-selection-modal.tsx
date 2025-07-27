"use client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBTCAmount, calculateProgress } from "@/hooks/useDashboardData";
import { Users, Target, Clock, Wallet } from "lucide-react";

interface Circle {
  id: string;
  onChainId: number;
  name: string;
  targetAmount: bigint;
  currentAmount: bigint;
  deadline: bigint;
  memberCount: number;
}

interface CircleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  circles: Circle[];
  actionType: "contribute" | "gift";
}

export default function CircleSelectionModal({
  isOpen,
  onClose,
  circles,
  actionType,
}: CircleSelectionModalProps) {
  const router = useRouter();

  const handleSelectCircle = (circleId: string) => {
    if (actionType === "contribute") {
      router.push(`/circles/${circleId}`);
    } else {
      router.push(`/circles/${circleId}?tab=gift`);
    }
    onClose();
  };

  const formatTimeLeft = (deadline: bigint) => {
    const now = Date.now() / 1000;
    const timeLeft = Number(deadline) - now;
    
    if (timeLeft <= 0) return "Expired";
    
    const days = Math.floor(timeLeft / 86400);
    if (days > 0) return `${days} days left`;
    
    const hours = Math.floor(timeLeft / 3600);
    return `${hours} hours left`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900/95 backdrop-blur-sm border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold flex items-center">
            {actionType === "contribute" ? (
              <>
                <Wallet className="w-5 h-5 mr-2 text-secondary" />
                Select Circle to Contribute
              </>
            ) : (
              <>
                <Target className="w-5 h-5 mr-2 text-trust" />
                Select Circle for Gift
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {circles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No circles available</p>
              <Button
                onClick={() => router.push('/create')}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                Create Your First Circle
              </Button>
            </div>
          ) : (
            circles.map((circle) => {
              const progress = calculateProgress(circle.currentAmount, circle.targetAmount);
              
              return (
                <Card
                  key={circle.id}
                  className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer hover-lift"
                  onClick={() => handleSelectCircle(circle.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold text-lg truncate flex-1">
                        {circle.name}
                      </h3>
                      <div className="flex items-center text-secondary text-sm ml-4">
                        <Users className="w-4 h-4 mr-1" />
                        {circle.memberCount}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Progress</p>
                        <div className="flex items-center">
                          <div className="w-12 h-2 bg-gray-700 rounded-full mr-2">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-white font-medium">{progress.toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 mb-1">Saved</p>
                        <p className="text-white font-medium">
                          {formatBTCAmount(circle.currentAmount)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 mb-1">Deadline</p>
                        <p className="text-white font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeLeft(circle.deadline)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-gray-400 text-xs">
                        Target: {formatBTCAmount(circle.targetAmount)} BTC
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

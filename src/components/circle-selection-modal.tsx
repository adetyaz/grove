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
      <DialogContent className='max-w-2xl h-fit max-h-[80vh] bg-slate-900/95 backdrop-blur-sm border-white/20 flex flex-col'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='text-white text-xl font-bold flex items-center'>
            {actionType === "contribute" ? (
              <>
                <Wallet className='w-5 h-5 mr-2 text-secondary' />
                Select Circle to Contribute
              </>
            ) : (
              <>
                <Target className='w-5 h-5 mr-2 text-trust' />
                Select Circle for Gift
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className='flex-1 min-h-0 mt-4'>
          <div className='space-y-4 max-h-full overflow-y-auto'>
            {circles.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-400'>No circles available</p>
                <Button
                  onClick={() => router.push("/create")}
                  className='mt-4 bg-primary hover:bg-primary/90'
                >
                  Create Your First Circle
                </Button>
              </div>
            ) : (
              circles.map((circle) => {
                return (
                  <Card
                    key={circle.id}
                    className='bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer hover-lift'
                    onClick={() => handleSelectCircle(circle.id)}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-white font-semibold text-lg truncate flex-1'>
                          {circle.name}
                        </h3>
                        <div className='flex items-center text-secondary text-sm ml-4'>
                          <Users className='w-4 h-4 mr-1' />
                          {circle.memberCount}
                        </div>
                      </div>

                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <p className='text-gray-400 mb-1'>Current</p>
                          <p className='text-white font-medium'>
                            {circle.currentAmount.toString()}
                          </p>
                        </div>

                        <div>
                          <p className='text-gray-400 mb-1'>Target</p>
                          <p className='text-white font-medium'>
                            {circle.targetAmount.toString()}
                          </p>
                        </div>

                        <div>
                          <p className='text-gray-400 mb-1'>Deadline</p>
                          <p className='text-white font-medium flex items-center'>
                            <Clock className='w-3 h-3 mr-1' />
                            {formatTimeLeft(circle.deadline)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <div className='flex justify-end mt-6 flex-shrink-0'>
          <Button
            variant='outline'
            onClick={onClose}
            className='border-white/20 text-black hover:bg-white/10'
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------- START OF DummyCard.tsx -----------------

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { X } from 'lucide-react';

// Define the props for this component using TypeScript
interface DummyCardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DummyCard({ isOpen, onClose }: DummyCardProps) {

  const handleValueCopy = async (value: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${fieldName} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy.");
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Stripe Test Card Information</DialogTitle>
        </DialogHeader>
        <div className="w-[375px] h-[225px] p-4 rounded-xl relative overflow-hidden shadow-2xl text-white font-sans
                        bg-gradient-to-br from-gray-800 to-black">

          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {/* Chip */}
          <div className="absolute top-4 left-4 w-12 h-9 bg-gradient-to-br from-gray-400 to-yellow-500 rounded-md" />

          {/* Card Type */}
          <p className="absolute top-6 right-4 text-xs font-semibold tracking-wider">CREDIT</p>

          {/* Card Number */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
            <p
              className="text-2xl font-mono tracking-widest cursor-pointer"
              onClick={() => handleValueCopy("4242424242424242", "Card Number")}
            >
              4242 4242 4242 4242
            </p>
          </div>

          {/* Bottom Details */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <p
                className="text-sm font-medium tracking-wider cursor-pointer"
                onClick={() => handleValueCopy("Robert Downey Jr", "Cardholder Name")}
              >
                Robert Downey Jr
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs">VALID THRU</p>
              <p
                className="font-medium tracking-wider cursor-pointer"
                onClick={() => handleValueCopy("12/26", "Expiry Date")}
              >
                12/26
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs">CVV</p>
              <p
                className="font-medium tracking-wider cursor-pointer"
                onClick={() => handleValueCopy("123", "CVV")}
              >
                123
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Gift } from './Icons';
import { awardAction, checkCanEarn } from '../services/gamificationService';
import { getCurrentUser } from '../services/authService';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const LuckyDropManager: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(u => setUserId(u?.id || null));
  }, []);

  useEffect(() => {
    // Reset state on every navigation
    setIsVisible(false);

    const tryTriggerLuck = async () => {
        if (!userId) return;

        // 1. Chance Logic: 15% Chance per page navigation
        // A low percentage keeps it exciting without being annoying
        const isLucky = Math.random() < 0.15; 

        if (isLucky) {
            // 2. Check Daily Limit (Max 3 per day)
            const canEarn = await checkCanEarn(userId, 'LUCKY_DROP');
            if (canEarn) {
                // Delay slightly (1.5s) so it doesn't clutter the UI immediately upon load
                setTimeout(() => setIsVisible(true), 1500);
            }
        }
    };

    if (userId) {
        tryTriggerLuck();
    }
  }, [location.pathname, userId]);

  const handleClaim = async () => {
      if (!userId) return;
      
      // Calculate random points (Between 5 and 20)
      const points = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
      
      setIsVisible(false); // Hide immediately to prevent double clicks

      try {
          await awardAction(userId, 'LUCKY_DROP', points);
          
          // Visual Celebration
          confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.8 },
              colors: ['#F59E0B', '#10B981', '#3B82F6']
          });

          // Custom Toast
          toast.success((t) => (
            <div className="flex items-center">
                <span className="text-xl mr-2">🎁</span>
                <div>
                    <p className="font-bold">សំណាងល្អ! (Lucky!)</p>
                    <p className="text-xs">អ្នកទទួលបាន {points} ពិន្ទុ</p>
                </div>
            </div>
          ), {
              duration: 4000,
              style: {
                  borderRadius: '12px',
                  background: '#1F2937',
                  color: '#fff',
                  border: '1px solid #374151'
              },
          });
      } catch (e) {
          console.error("Failed to claim lucky drop", e);
      }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[90] animate-bounce-in">
        <div 
            className="relative group cursor-pointer transition-transform hover:scale-110 active:scale-95" 
            onClick={handleClaim}
            title="ចុចដើម្បីទទួលរង្វាន់ (Click to Claim)"
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
            
            {/* Chest Icon */}
            <div className="relative bg-gradient-to-br from-yellow-300 to-orange-500 p-4 rounded-2xl shadow-2xl border-2 border-yellow-100 flex items-center justify-center">
                <Gift className="h-8 w-8 text-white drop-shadow-md fill-white/20" />
                
                {/* Notification Dot */}
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-bounce border border-white">
                    !
                </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-3 py-2 rounded-xl shadow-xl border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                <p className="text-xs font-bold text-gray-800 text-center">កាដូសំណាង!<br/><span className="text-primary font-normal">ចុចបើកភ្លាម</span></p>
                <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rotate-45 border-r border-t border-gray-100"></div>
            </div>
        </div>
    </div>
  );
};

export default LuckyDropManager;

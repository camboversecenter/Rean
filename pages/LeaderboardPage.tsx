import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLeaderboard } from '../services/leaderboardService';
import { UserProfile } from '../types';
import { Award, Zap, ShieldCheck, Loader2 } from '../components/Icons';

const LeaderboardPage: React.FC = () => {
  const [state, setState] = useState({
    users: [] as UserProfile[],
    loading: true,
  });

  const { users, loading } = state;

  const loadData = React.useCallback(async () => {
    const data = await fetchLeaderboard();
    setState({ users: data, loading: false });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);

  return (
    <div className="min-h-screen bg-surface-2 pb-20 pt-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-content flex items-center justify-center mb-2">
            <Award className="h-8 w-8 mr-3 text-yellow-500 fill-yellow-500" />
            តារាងពិន្ទុ (Leaderboard)
          </h1>
          <p className="text-content-muted">ទទួលស្គាល់សិស្សដែលមានភាពសកម្មបំផុតនៅលើ REAN</p>
        </div>

        {/* Top 3 Podium */}
        {users.length > 0 && (
          <div className="mb-12 relative flex justify-center items-end gap-4 md:gap-8 h-64 md:h-80 animate-fade-in">
            {/* Background Glow */}
            <div className="absolute bottom-0 w-full max-w-2xl h-32 bg-gradient-to-t from-yellow-100/50 to-transparent rounded-t-full blur-xl -z-10"></div>

            {/* 2nd Place */}
            {users[1] && (
              <Link
                to={`/profile/${users[1].id}`}
                className="flex flex-col items-center group w-1/3 max-w-[140px]"
              >
                <div className="relative mb-2 transition-transform group-hover:-translate-y-2">
                  <img
                    src={
                      users[1].avatar_url ||
                      `https://ui-avatars.com/api/?name=${users[1].full_name}`
                    }
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-line-strong shadow-lg object-cover"
                    alt="2nd"
                  />
                  <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                    <span className="bg-line-strong text-white text-xs md:text-sm font-bold px-2.5 py-0.5 rounded-full shadow-sm ring-2 ring-white">
                      2nd
                    </span>
                  </div>
                </div>
                <div className="text-center mb-2 mt-2">
                  <p className="font-bold text-content text-sm md:text-base line-clamp-1">
                    {users[1].full_name}
                  </p>
                  <p className="text-xs text-content-muted font-mono">{users[1].lifetime_xp} XP</p>
                </div>
                <div className="w-full bg-gradient-to-t from-gray-200 to-gray-100 h-24 md:h-32 rounded-t-xl shadow-sm border-t border-white/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-surface/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </Link>
            )}

            {/* 1st Place */}
            {users[0] && (
              <Link
                to={`/profile/${users[0].id}`}
                className="flex flex-col items-center z-10 w-1/3 max-w-[160px] group"
              >
                <div className="relative mb-2 transition-transform group-hover:-translate-y-2">
                  <div className="absolute -top-8 inset-x-0 flex justify-center animate-bounce">
                    <span className="text-4xl filter drop-shadow-md">👑</span>
                  </div>
                  <img
                    src={
                      users[0].avatar_url ||
                      `https://ui-avatars.com/api/?name=${users[0].full_name}`
                    }
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-yellow-400 shadow-xl object-cover ring-4 ring-yellow-100"
                    alt="1st"
                  />
                  <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                    <span className="bg-yellow-400 text-white text-sm md:text-base font-bold px-3 py-0.5 rounded-full shadow-sm ring-2 ring-white">
                      1st
                    </span>
                  </div>
                </div>
                <div className="text-center mb-2 mt-4">
                  <p className="font-bold text-content text-base md:text-lg line-clamp-1">
                    {users[0].full_name}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300 font-bold font-mono bg-yellow-50 dark:bg-yellow-900/50 px-2 py-0.5 rounded-full">
                    {users[0].lifetime_xp} XP
                  </p>
                </div>
                <div className="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 h-36 md:h-48 rounded-t-2xl shadow-lg border-t border-yellow-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute inset-0 bg-surface/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </Link>
            )}

            {/* 3rd Place */}
            {users[2] && (
              <Link
                to={`/profile/${users[2].id}`}
                className="flex flex-col items-center group w-1/3 max-w-[140px]"
              >
                <div className="relative mb-2 transition-transform group-hover:-translate-y-2">
                  <img
                    src={
                      users[2].avatar_url ||
                      `https://ui-avatars.com/api/?name=${users[2].full_name}`
                    }
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-orange-300 shadow-md object-cover"
                    alt="3rd"
                  />
                  <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                    <span className="bg-orange-300 text-white text-xs md:text-sm font-bold px-2.5 py-0.5 rounded-full shadow-sm ring-2 ring-white">
                      3rd
                    </span>
                  </div>
                </div>
                <div className="text-center mb-2 mt-2">
                  <p className="font-bold text-content text-sm md:text-base line-clamp-1">
                    {users[2].full_name}
                  </p>
                  <p className="text-xs text-content-muted font-mono">{users[2].lifetime_xp} XP</p>
                </div>
                <div className="w-full bg-gradient-to-t from-orange-200 to-orange-100 h-20 md:h-24 rounded-t-xl shadow-sm border-t border-white/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-surface/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* List View (Rank 4+) */}
        {restUsers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 animate-fade-in delay-100">
            {restUsers.map((user, idx) => {
              const rank = idx + 4;
              return (
                <Link
                  to={`/profile/${user.id}`}
                  key={user.id}
                  className="flex items-center p-3 md:p-4 rounded-xl border border-line bg-surface shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-8 md:w-10 font-bold text-content-faint text-center mr-2 md:mr-4 font-mono text-lg">
                    #{rank}
                  </div>
                  <div className="relative mr-3 md:mr-4">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-line-strong object-cover border border-line"
                      alt={user.full_name}
                    />
                    {user.role === 'tutor' && (
                      <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                        <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-content text-sm md:text-base truncate group-hover:text-primary transition-colors">
                      {user.full_name}
                    </h4>
                    <p className="text-xs text-content-muted truncate capitalize">
                      {user.role || 'Student'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-content text-sm md:text-base block">
                      {user.lifetime_xp} XP
                    </span>
                    <span className="text-[10px] text-content-faint bg-surface-2 px-2 py-0.5 rounded-full inline-block mt-1">
                      Lvl {Math.floor((user.lifetime_xp || 0) / 100) + 1}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-20 text-content-faint">
            <p>មិនទាន់មានទិន្នន័យ។</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

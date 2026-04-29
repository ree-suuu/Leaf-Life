import { Trophy, Gift, Star, ChevronRight } from 'lucide-react';
import './Rewards.css';

const LEADERBOARD = [
  { id: 1, name: 'EcoWarrior', points: 2450, avatar: '🌱' },
  { id: 2, name: 'PlantMom99', points: 2100, avatar: '🌸' },
  { id: 3, name: 'GreenThumb', points: 1950, avatar: '🪴' },
  { id: 4, name: 'CactusJack', points: 1800, avatar: '🌵' },
  { id: 5, name: 'FernLover', points: 1650, avatar: '🌿' },
];

export default function Rewards() {
  return (
    <div className="animate-fade-in rewards-container">
      <h2 className="title-medium">Rewards</h2>
      <p className="text-subtle mb-4">Earn points and win free plants every month.</p>
      
      {/* Current User Stats */}
      <div className="stats-card glass-panel">
        <div className="points-display">
          <Star className="star-icon" size={32} />
          <h3 className="points">1,240</h3>
          <p className="text-subtle">Total Points</p>
        </div>
        <div className="stats-divider"></div>
        <div className="rank-display">
          <Trophy className="trophy-icon" size={32} />
          <h3 className="rank">#42</h3>
          <p className="text-subtle">Current Rank</p>
        </div>
      </div>

      {/* Monthly Prize Promo */}
      <div className="prize-banner">
        <div className="prize-info">
          <h3>Monthly Top Prize</h3>
          <p>Win a rare Pink Princess Philodendron!</p>
          <div className="time-left">14 days left</div>
        </div>
        <div className="prize-image">🌺</div>
      </div>

      <h3 className="section-title">How to earn</h3>
      <div className="tasks-list">
        <div className="task-item">
          <div className="task-icon bg-green">📷</div>
          <div className="task-info">
            <h4>Scan a new plant</h4>
            <p>+50 pts</p>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>
        <div className="task-item">
          <div className="task-icon bg-orange">🤝</div>
          <div className="task-info">
            <h4>Swap a plant</h4>
            <p>+200 pts</p>
          </div>
          <ChevronRight size={20} className="text-muted" />
        </div>
      </div>

      <h3 className="section-title mt-6">Leaderboard</h3>
      <div className="leaderboard glass-panel">
        {LEADERBOARD.map((user, index) => (
          <div key={user.id} className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}>
            <div className="rank-number">{index + 1}</div>
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-name">{user.name}</div>
            <div className="user-points">{user.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}

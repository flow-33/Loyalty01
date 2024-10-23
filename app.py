from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from datetime import datetime
import os
import json

app = Flask(__name__)
CORS(app)

# In-memory storage with additional tracking
users = {}

class User:
    def __init__(self, monthly_budget):
        self.points = 0
        self.total_spent = 0
        self.monthly_budget = monthly_budget
        self.monthly_spent = 0
        self.flights_this_month = 0
        self.tier = 'Bronze'
        self.history = []
        self.current_month = datetime.now().month
        self.redeemed_rewards = []
        self.last_tier = 'Bronze'
        self.gameMonth = 1

    def check_tier_up(self):
        old_tier = self.last_tier
        new_tier = self.tier
        self.last_tier = new_tier
        return old_tier != new_tier
    
    def reset_monthly_stats(self):
        self.monthly_spent = 0
        self.flights_this_month = 0
        self.current_month = datetime.now().month

    def to_dict(self):
        return {
            'points': self.points,
            'totalSpent': self.total_spent,
            'monthlySpent': self.monthly_spent,
            'monthlyBudget': self.monthly_budget,
            'flightsThisMonth': self.flights_this_month,
            'tier': self.tier,
            'history': self.history,
            'gameMonth': self.gameMonth,
            'redeemed_rewards': self.redeemed_rewards
        }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/init', methods=['POST'])
def initialize_user():
    data = request.json
    user_id = data.get('userId', 'default')
    monthly_budget = data.get('monthlyBudget', 1000)
    
    users[user_id] = User(monthly_budget)
    return jsonify(users[user_id].to_dict())

@app.route('/api/simulate', methods=['POST'])
def simulate_transaction():
    data = request.json
    user_id = data.get('userId', 'default')
    amount = data.get('amount', 0)
    category = data.get('category', 'default')
    
    if user_id not in users:
        return jsonify({'error': 'User not initialized'}), 400

    user = users[user_id]
    
    # Check if we need to reset monthly stats
    current_month = datetime.now().month
    if current_month != user.current_month:
        user.reset_monthly_stats()

    # Validate transaction
    if user.monthly_spent + amount > user.monthly_budget:
        return jsonify({'error': 'Exceeds monthly budget'}), 400
        
    if category == 'flights':
        if user.flights_this_month >= 2:
            return jsonify({'error': 'Flight limit reached this month'}), 400
        user.flights_this_month += 1

    # Calculate points
    tier_multipliers = {
        'Bronze': 1,
        'Silver': 1.5,
        'Gold': 2,
        'Platinum': 3
    }
    
    category_multipliers = {
        'creditCard': 1,
        'flights': 2
    }
    
    multiplier = tier_multipliers[user.tier] * category_multipliers.get(category, 1)
    earned_points = int(amount * multiplier)
    
    # Update user stats
    user.points += earned_points
    user.total_spent += amount
    user.monthly_spent += amount
    
    # Update tier
    old_tier = user.tier
    if user.total_spent >= 10000:
        user.tier = 'Platinum'
    elif user.total_spent >= 5000:
        user.tier = 'Gold'
    elif user.total_spent >= 1000:
        user.tier = 'Silver'

    tier_changed = old_tier != user.tier
    
    # Add to history
    user.history.append({
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'amount': amount,
        'category': category,
        'pointsEarned': earned_points,
        'tier': user.tier
    })
    
    return jsonify({
        **user.to_dict(),
        'tierUp' : tier_changed,
        'newTier' : user.tier if tier_changed else None
    })

@app.route('/api/redeem', methods=['POST'])
def redeem_reward():
    data = request.json
    user_id = data.get('userId', 'default')
    points_cost = data.get('points', 0)
    reward_name = data.get('rewardName', '')
    
    if user_id not in users:
        return jsonify({'error': 'User not initialized'}), 404
    
    user = users[user_id]
    if user.points < points_cost:
        return jsonify({'error': 'Not enough points'}), 400
    
    user.points -= points_cost
    user.redeemed_rewards.append({
        'name': reward_name,
        'cost': points_cost,
        'date': datetime.now().strftime('%Y-%m-%d %H:%M')
    })
    
    return jsonify(user.to_dict())

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/api/reset', methods=['POST'])
def reset_user():
    data = request.json
    user_id = data.get('userId', 'default')

    if user_id in users:
        del users[user_id]
    return jsonify({'status': 'success'})

@app.route('/api/next-month', methods=['POST'])
def advance_month():
    data = request.json
    user_id = data.get('userId', 'default')
    
    if user_id not in users:
        return jsonify({'error': 'User not initialized'}), 400
        
    users[user_id].reset_monthly_stats()
    users[user_id].gameMonth += 1
    return jsonify(users[user_id].to_dict())

@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/rewards')
def rewards():
    return render_template('rewards.html')

@app.route('/api/user/<user_id>')
def get_user(user_id):
    if user_id not in users:
        users[user_id] = User(1000)  # Default budget
    return jsonify(users[user_id].to_dict())

if __name__ == '__main__':
    # Use environment variable to detect if we're running on Railway
    if os.getenv('RAILWAY_ENVIRONMENT'):
        app.run(host='0.0.0.0', port=os.getenv('PORT', 8080))
    else:
        # Local development
        app.run(debug=True, port=5000)
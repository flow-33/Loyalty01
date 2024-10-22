from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from datetime import datetime
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
            'history': self.history
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
    if user.total_spent >= 10000:
        user.tier = 'Platinum'
    elif user.total_spent >= 5000:
        user.tier = 'Gold'
    elif user.total_spent >= 1000:
        user.tier = 'Silver'
    
    # Add to history
    user.history.append({
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'amount': amount,
        'category': category,
        'pointsEarned': earned_points,
        'tier': user.tier
    })
    
    return jsonify(user.to_dict())

@app.route('/api/next-month', methods=['POST'])
def advance_month():
    data = request.json
    user_id = data.get('userId', 'default')
    
    if user_id not in users:
        return jsonify({'error': 'User not initialized'}), 400
        
    users[user_id].reset_monthly_stats()
    return jsonify(users[user_id].to_dict())

if __name__ == '__main__':
    app.run(debug=True)
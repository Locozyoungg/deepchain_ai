# mpc/coordinator/server.py
from flask import Flask, request, jsonify
from flask_limiter import Limiter
import jwt

app = Flask(__name__)
limiter = Limiter(app)
aggregator = MPCAggregator(global_model)

@app.route('/api/v1/update', methods=['POST'])
@limiter.limit("10/minute")
def handle_update():
    """Secure endpoint for client updates"""
    try:
        token = request.headers.get('Authorization')
        claims = jwt.decode(token, public_key, algorithms=['RS256'])
        
        encrypted_grads = request.json['gradients']
        aggregator.receive_update(claims['client_id'], encrypted_grads)
        
        return jsonify({"status": "accepted"}), 202
        
    except (jwt.InvalidTokenError, KeyError) as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/v1/aggregate', methods=['POST'])
def perform_aggregation():
    """Initiate secure aggregation round"""
    if aggregator.client_updates < aggregator.aggregation_threshold:
        return jsonify({"error": "Not enough contributions"}), 400
        
    aggregated = aggregator.aggregate_updates()
    aggregator.update_global_model(aggregated)
    
    return jsonify({"status": "aggregation complete"}), 200
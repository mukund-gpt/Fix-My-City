
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from complaint_detector import ComplaintDuplicateDetector, calculate_duplicate_probability
from pymongo import MongoClient # <-- New Import

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

# --- MongoDB Setup ---
# The URL must be provided via the MONGO_URI environment variable.
# Example format: mongodb://user:password@cluster-url:port/
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/') 
DB_NAME = os.getenv('DB_NAME', 'city_complaints') # Default database name

try:
    # Initialize MongoDB Client
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DB_NAME]
    
    # Ping the server to check connection status
    mongo_client.admin.command('ping')
    logging.info(f"Successfully connected to MongoDB at {MONGO_URI} (Database: {DB_NAME})")

    # Define the collection to use
    COMPLAINT_COLLECTION = db['complaints'] 

except Exception as e:
    logging.error(f"Could not connect to MongoDB. Ensure MONGO_URI is correct. Error: {e}")
    mongo_client = None
    db = None

# Initialize detector (with or without sentence transformers)
USE_SENTENCE_TRANSFORMER = os.getenv('USE_SENTENCE_TRANSFORMER', 'false').lower() == 'true'
detector = ComplaintDuplicateDetector(use_sentence_transformer=USE_SENTENCE_TRANSFORMER)


def parse_complaint(complaint_data):
    """Parse complaint data and handle date conversion"""
    if 'created_at' in complaint_data:
        if isinstance(complaint_data['created_at'], str):
            try:
                # Handle ISO format with or without 'Z'
                complaint_data['created_at'] = datetime.fromisoformat(
                    complaint_data['created_at'].replace('Z', '+00:00')
                )
            except:
                complaint_data['created_at'] = datetime.now()
    else:
        complaint_data['created_at'] = datetime.now()
    
    return complaint_data


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint, now includes DB status"""
    db_status = 'connected' if mongo_client else 'disconnected'
    return jsonify({
        'status': 'healthy',
        'db_status': db_status,
        'model': 'sentence-transformer' if USE_SENTENCE_TRANSFORMER else 'tfidf',
        'version': '1.0.1'
    })


@app.route('/api/check-duplicate', methods=['POST'])
def check_duplicate():
    """
    Check if a target complaint is a duplicate against historical complaints fetched from MongoDB.
    
    Request body now only requires 'target'. Historical complaints are fetched from MongoDB.
    
    Request body:
    {
        "target": {
            "title": "string",
            "description": "string",
            "latitude": float,
            "longitude": float,
            "created_at": "ISO date string"
        },
        "config": {
             "title_weight": 0.4,
             "description_weight": 0.3,
             "location_weight": 0.2,
             "time_weight": 0.1,
             "similarity_threshold": 0.6,
             "location_radius_km": 1.0,
             "time_window_days": 30,
             "text_similarity_method": "tfidf"
         }
    }
    """
    if not db:
        return jsonify({
            'error': 'Database connection failed. Cannot fetch historical complaints.'
        }), 503

    try:
        data = request.get_json()
        
        if not data or 'target' not in data:
            return jsonify({
                'error': 'Missing required field: target'
            }), 400
        
        # Parse target complaint
        target = parse_complaint(data['target'])
        
        # Get config or use defaults
        config = data.get('config', None)
        
        # --- DATABASE FETCH LOGIC ---
        query = {}
        # 1. If target has a MongoDB ObjectId (_id), exclude it from the comparison list
        if target.get('_id'):
             query['_id'] = {'$ne': target['_id']} 
             
        # 2. Fetch the last 100 recent complaints for comparison
        historical_complaints = list(COMPLAINT_COLLECTION.find(query)
                                    .sort('created_at', -1)
                                    .limit(100))
                                    
        complaints_to_check = [parse_complaint(c) for c in historical_complaints]

        if not complaints_to_check:
             return jsonify({
                'has_duplicates': False,
                'duplicate_count': 0,
                'similar_count': 0,
                'results': [],
                'message': 'No historical complaints found to compare against.'
            }), 200

        # Find duplicates against the fetched historical data
        results = detector.find_duplicates(target, complaints_to_check, config)
        
        # Add probability scores
        for result in results:
            result['duplicate_probability'] = round(
                calculate_duplicate_probability(result['similarity_scores']),
                3
            )
        
        # Count high-confidence duplicates
        high_confidence = [r for r in results if r['is_duplicate']]
        
        return jsonify({
            'has_duplicates': len(high_confidence) > 0,
            'duplicate_count': len(high_confidence),
            'similar_count': len(results),
            'results': results
        })
    
    except Exception as e:
        logging.error(f"Error checking duplicate: {e}", exc_info=True)
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/find-clusters', methods=['POST'])
def find_clusters():
    """
    Find clusters of duplicate complaints
    """
    try:
        data = request.get_json()
        
        if not data or 'complaints' not in data:
            return jsonify({
                'error': 'Missing required field: complaints'
            }), 400
        
        # Parse complaints
        complaints = [parse_complaint(c) for c in data['complaints']]
        
        # Get config
        config = data.get('config', None)
        
        # Find clusters
        clusters = detector.find_duplicate_clusters(complaints, config)
        
        # Format response
        formatted_clusters = []
        for cluster in clusters:
            formatted_clusters.append({
                'size': len(cluster),
                'complaints': [
                    {
                        'id': str(c.get('_id')), # Ensure ObjectId is converted to string
                        'title': c.get('title'),
                        'created_at': c.get('created_at').isoformat() if c.get('created_at') else None
                    }
                    for c in cluster
                ]
            })
        
        return jsonify({
            'cluster_count': len(formatted_clusters),
            'total_duplicates': sum(c['size'] for c in formatted_clusters) - len(formatted_clusters),
            'clusters': formatted_clusters
        })
    
    except Exception as e:
        logging.error(f"Error finding clusters: {e}", exc_info=True)
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/batch-check', methods=['POST'])
def batch_check():
    """
    Check multiple complaints for duplicates in batch
    """
    try:
        data = request.get_json()
        
        if not data or 'complaints' not in data:
            return jsonify({
                'error': 'Missing required field: complaints'
            }), 400
        
        complaints = [parse_complaint(c) for c in data['complaints']]
        config = data.get('config', None)
        
        results = []
        
        for i, target in enumerate(complaints):
            # Compare against all other complaints
            others = complaints[:i] + complaints[i+1:]
            
            duplicates = detector.find_duplicates(target, others, config)
            
            # Add probability scores
            for r in duplicates:
                r['duplicate_probability'] = round(
                    calculate_duplicate_probability(r['similarity_scores']),
                    3
                )
            
            results.append({
                'complaint_id': target.get('_id'),
                'has_duplicates': any(r['is_duplicate'] for r in duplicates),
                'duplicate_count': sum(1 for r in duplicates if r['is_duplicate']),
                'top_matches': duplicates[:3]  # Top 3 matches
            })
        
        return jsonify({
            'results': results,
            'total_checked': len(complaints)
        })
    
    except Exception as e:
        logging.error(f"Error in batch check: {e}", exc_info=True)
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/similarity', methods=['POST'])
def calculate_similarity():
    """
    Calculate similarity between two texts
    """
    try:
        data = request.get_json()
        
        if not data or 'text1' not in data or 'text2' not in data:
            return jsonify({
                'error': 'Missing required fields: text1 and text2'
            }), 400
        
        method = data.get('method', 'tfidf')
        
        similarity = detector.calculate_text_similarity(
            data['text1'],
            data['text2'],
            method=method
        )
        
        return jsonify({
            'similarity': round(similarity, 3),
            'method': method
        })
    
    except Exception as e:
        logging.error(f"Error calculating similarity: {e}", exc_info=True)
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logging.info(f"Starting Flask server on port {port}")
    logging.info(f"Using model: {'sentence-transformer' if USE_SENTENCE_TRANSFORMER else 'TF-IDF'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

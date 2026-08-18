import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
from complaint_detector import ComplaintDuplicateDetector, calculate_duplicate_probability,predict_complaint_urgency
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

# --- MongoDB Setup ---
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = os.getenv('DB_NAME', 'fixmycity')

try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DB_NAME]
    mongo_client.admin.command('ping')
    logging.info(f"Connected to MongoDB at {MONGO_URI} (Database: {DB_NAME})")
    COMPLAINT_COLLECTION = db['complaints']
except Exception as e:
    logging.error(f"Could not connect to MongoDB: {e}")
    mongo_client = None
    db = None

USE_SENTENCE_TRANSFORMER = os.getenv('USE_SENTENCE_TRANSFORMER', 'false').lower() == 'true'
detector = ComplaintDuplicateDetector(use_sentence_transformer=USE_SENTENCE_TRANSFORMER)


def parse_complaint(complaint_data):
    if 'created_at' in complaint_data:
        if isinstance(complaint_data['created_at'], str):
            try:
                complaint_data['created_at'] = datetime.fromisoformat(
                    complaint_data['created_at'].replace('Z', '+00:00')
                )
            except:
                complaint_data['created_at'] = datetime.now(timezone.utc)
    else:
        complaint_data['created_at'] = datetime.now(timezone.utc)

    if 'latitude' in complaint_data:
        complaint_data['latitude'] = float(complaint_data['latitude'])
    if 'longitude' in complaint_data:
        complaint_data['longitude'] = float(complaint_data['longitude'])
    return complaint_data


def jsonify_safe(obj):
    """
    Recursively convert ObjectId and datetime to JSON-serializable types.
    """
    if isinstance(obj, dict):
        return {k: jsonify_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [jsonify_safe(i) for i in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj


@app.route('/health', methods=['GET'])
def health_check():
    db_status = 'connected' if mongo_client else 'disconnected'
    return jsonify({
        'status': 'healthy',
        'db_status': db_status,
        'model': 'sentence-transformer' if USE_SENTENCE_TRANSFORMER else 'tfidf',
        'version': '1.0.1'
    })


@app.route('/api/check-duplicate', methods=['POST'])
def check_duplicate():
    logging.info("Someone is trying to check complaint duplicacy")
    if db is None:
        return jsonify({'error': 'Database connection failed.'}), 503

    try:
        data = request.get_json()
        if not data or 'target' not in data:
            return jsonify({'error': 'Missing required field: target'}), 400

        target = parse_complaint(data['target'])
        config = data.get('config', None)

        query = {}
        if target.get('_id'):
            query['_id'] = {'$ne': target['_id']}

        historical_complaints = list(COMPLAINT_COLLECTION.find(query)
                                     .sort('created_at', -1)
                                     .limit(100))
        complaints_to_check = [parse_complaint(c) for c in historical_complaints]
        urgency_prediction = predict_complaint_urgency(target)
        target['urgency'] = urgency_prediction
        if not complaints_to_check:
            return jsonify({
                'has_duplicates': False,
                'duplicate_count': 0,
                'similar_count': 0,
                'results': [],
                'message': 'No historical complaints found.'
            }), 200

        results = detector.find_duplicates(target, complaints_to_check, config)

        for result in results:
            result['duplicate_probability'] = round(
                calculate_duplicate_probability(result.get('similarity_scores', {})), 3
            )

        safe_results = jsonify_safe(results)
        high_confidence = [r for r in results if r.get('is_duplicate')]

        return jsonify({
            'has_duplicates': len(high_confidence) > 0,
            'duplicate_count': len(high_confidence),
            'similar_count': len(results),
            'results': safe_results,
            'urgency': urgency_prediction
        })

    except Exception as e:
        logging.error(f"Error checking duplicate: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    logging.info(f"Starting Flask server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)

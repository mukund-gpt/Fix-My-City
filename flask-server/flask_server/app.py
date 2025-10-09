
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from complaint_detector import ComplaintDuplicateDetector, calculate_duplicate_probability

app = Flask(__name__)
CORS(app)

# Initialize detector (with or without sentence transformers)
USE_SENTENCE_TRANSFORMER = os.getenv('USE_SENTENCE_TRANSFORMER', 'false').lower() == 'true'
detector = ComplaintDuplicateDetector(use_sentence_transformer=USE_SENTENCE_TRANSFORMER)


def parse_complaint(complaint_data):
    """Parse complaint data and handle date conversion"""
    if 'created_at' in complaint_data:
        if isinstance(complaint_data['created_at'], str):
            try:
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
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'sentence-transformer' if USE_SENTENCE_TRANSFORMER else 'tfidf',
        'version': '1.0.0'
    })


@app.route('/api/check-duplicate', methods=['POST'])
def check_duplicate():
    """
    Check if a complaint is a duplicate
    
    Request body:
    {
        "target": {
            "title": "string",
            "description": "string",
            "latitude": float,
            "longitude": float,
            "created_at": "ISO date string"
        },
        "complaints": [array of complaint objects],
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
    try:
        data = request.get_json()
        
        if not data or 'target' not in data or 'complaints' not in data:
            return jsonify({
                'error': 'Missing required fields: target and complaints'
            }), 400
        
        # Parse target complaint
        target = parse_complaint(data['target'])
        
        # Parse comparison complaints
        complaints = [parse_complaint(c) for c in data['complaints']]
        
        # Get config or use defaults
        config = data.get('config', None)
        
        # Find duplicates
        results = detector.find_duplicates(target, complaints, config)
        
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
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/find-clusters', methods=['POST'])
def find_clusters():
    """
    Find clusters of duplicate complaints
    
    Request body:
    {
        "complaints": [array of complaint objects],
        "config": {
            "similarity_threshold": 0.75,
            "location_radius_km": 1.0,
            "time_window_days": 7
        }
    }
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
                        'id': c.get('_id'),
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
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/batch-check', methods=['POST'])
def batch_check():
    """
    Check multiple complaints for duplicates in batch
    More efficient than multiple individual calls
    
    Request body:
    {
        "complaints": [array of complaint objects to check],
        "config": {...}
    }
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
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/api/similarity', methods=['POST'])
def calculate_similarity():
    """
    Calculate similarity between two texts
    
    Request body:
    {
        "text1": "string",
        "text2": "string",
        "method": "tfidf" | "jaccard" | "semantic"
    }
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
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    print(f"Starting Flask server on port {port}")
    print(f"Using model: {'sentence-transformer' if USE_SENTENCE_TRANSFORMER else 'TF-IDF'}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
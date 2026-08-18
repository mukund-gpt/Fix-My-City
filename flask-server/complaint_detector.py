"""
Advanced Duplicate Complaint Detection using ML and NLP
Supports multiple similarity algorithms and machine learning models
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# SentenceTransformer is disabled for low-memory deployments.
# from sentence_transformers import SentenceTransformer
from datetime import datetime, timedelta
import re
from typing import List, Dict, Tuple, Optional
import math


class ComplaintDuplicateDetector:
    """
    Advanced duplicate detection using multiple similarity algorithms
    """
    
    def __init__(self, 
                 use_sentence_transformer: bool = False,
                 model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize the duplicate detector
        
        Args:
            use_sentence_transformer: Use SBERT for semantic similarity
            model_name: Name of the sentence transformer model
        """
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words='english',
            lowercase=True
        )
        
        self.use_sentence_transformer = use_sentence_transformer
        # SentenceTransformer model loading is disabled to reduce deployment memory usage.
        # if use_sentence_transformer:
        #     try:
        #         self.sentence_model = SentenceTransformer(model_name)
        #     except:
        #         print("Warning: Could not load sentence transformer. Falling back to TF-IDF only.")
        #         self.use_sentence_transformer = False
    
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def calculate_text_similarity(self, text1: str, text2: str, 
                                  method: str = 'tfidf') -> float:
        """
        Calculate similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
            method: 'tfidf', 'jaccard', or 'semantic'
        
        Returns:
            Similarity score between 0 and 1
        """
        if not text1 or not text2:
            return 0.0
        
        text1 = self.preprocess_text(text1)
        text2 = self.preprocess_text(text2)
        
        if method == 'tfidf':
            return self._tfidf_similarity(text1, text2)
        elif method == 'jaccard':
            return self._jaccard_similarity(text1, text2)
        elif method == 'semantic' and self.use_sentence_transformer:
            return self._semantic_similarity(text1, text2)
        else:
            return self._tfidf_similarity(text1, text2)
    
    def _tfidf_similarity(self, text1: str, text2: str) -> float:
        """TF-IDF cosine similarity"""
        try:
            tfidf_matrix = self.tfidf_vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except:
            return 0.0
    
    def _jaccard_similarity(self, text1: str, text2: str) -> float:
        """Jaccard similarity coefficient"""
        set1 = set(text1.split())
        set2 = set(text2.split())
        
        if not set1 or not set2:
            return 0.0
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
    
    def _semantic_similarity(self, text1: str, text2: str) -> float:
        """Semantic similarity using sentence transformers"""
        embeddings = self.sentence_model.encode([text1, text2])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return float(similarity)
    
    def calculate_geo_distance(self, lat1: float, lon1: float, 
                               lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates using Haversine formula
        Returns distance in kilometers
        """
        if None in [lat1, lon1, lat2, lon2]:
            return float('inf')
        
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def calculate_time_decay(self, date1: datetime, date2: datetime, 
                            decay_days: int = 30) -> float:
        """
        Calculate time-based decay factor
        More recent complaints are weighted higher
        """
        time_diff = abs((date2 - date1).days)
        
        if time_diff > decay_days:
            return 0.0
        
        # Exponential decay
        decay_factor = math.exp(-time_diff / decay_days)
        return decay_factor
    
    def find_duplicates(self, 
                       target_complaint: Dict,
                       complaint_list: List[Dict],
                       config: Optional[Dict] = None) -> List[Dict]:
        """
        Find duplicate complaints for a target complaint
        
        Args:
            target_complaint: Dict with keys: title, description, latitude, 
                            longitude, created_at
            complaint_list: List of complaint dicts to compare against
            config: Configuration dict with thresholds
        
        Returns:
            List of dicts with complaint and similarity scores
        """
        if config is None:
            config = {
                'title_weight': 0.4,
                'description_weight': 0.3,
                'location_weight': 0.2,
                'time_weight': 0.1,
                'similarity_threshold': 0.6,
                'location_radius_km': 1.0,
                'time_window_days': 30,
                'text_similarity_method': 'tfidf'  # 'tfidf', 'jaccard', or 'semantic'
            }
        
        results = []
        
        for complaint in complaint_list:
            # Skip if same complaint
            if complaint.get('_id') == target_complaint.get('_id'):
                continue
            
            # Calculate individual similarities
            title_sim = self.calculate_text_similarity(
                target_complaint.get('title', ''),
                complaint.get('title', ''),
                method=config['text_similarity_method']
            )
            
            desc_sim = self.calculate_text_similarity(
                target_complaint.get('description', ''),
                complaint.get('description', ''),
                method=config['text_similarity_method']
            )
            
            # Location similarity
            location_sim = 0.0
            distance_km = None
            if all(k in target_complaint and k in complaint 
                   for k in ['latitude', 'longitude']):
                distance_km = self.calculate_geo_distance(
                    target_complaint['latitude'],
                    target_complaint['longitude'],
                    complaint['latitude'],
                    complaint['longitude']
                )
                location_sim = 1.0 if distance_km <= config['location_radius_km'] else 0.0
            
            # Time decay
            time_sim = 0.0
            if 'created_at' in target_complaint and 'created_at' in complaint:
                time_sim = self.calculate_time_decay(
                    target_complaint['created_at'],
                    complaint['created_at'],
                    config['time_window_days']
                )
            
            # Calculate weighted overall similarity
            overall_sim = (
                title_sim * config['title_weight'] +
                desc_sim * config['description_weight'] +
                location_sim * config['location_weight'] +
                time_sim * config['time_weight']
            )
            
            # Normalize by sum of weights
            total_weight = (config['title_weight'] + config['description_weight'] + 
                          config['location_weight'] + config['time_weight'])
            overall_sim = overall_sim / total_weight
            
            # Check if above threshold
            if overall_sim >= config['similarity_threshold']:
                results.append({
                    'complaint': complaint,
                    'similarity_scores': {
                        'title': round(title_sim, 3),
                        'description': round(desc_sim, 3),
                        'location': round(location_sim, 3),
                        'time': round(time_sim, 3),
                        'overall': round(overall_sim, 3)
                    },
                    'distance_km': round(distance_km, 2) if distance_km else None,
                    'is_duplicate': overall_sim >= 0.8  # High confidence threshold
                })
        
        # Sort by overall similarity
        results.sort(key=lambda x: x['similarity_scores']['overall'], reverse=True)
        
        return results
    
    def find_duplicate_clusters(self, 
                               complaints: List[Dict],
                               config: Optional[Dict] = None) -> List[List[Dict]]:
        """
        Find clusters of duplicate complaints
        Uses agglomerative clustering approach
        
        Returns:
            List of clusters, each cluster is a list of complaint dicts
        """
        if config is None:
            config = {
                'similarity_threshold': 0.75,
                'location_radius_km': 1.0,
                'time_window_days': 7
            }
        
        n = len(complaints)
        if n == 0:
            return []
        
        # Build similarity matrix
        similarity_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(i + 1, n):
                duplicates = self.find_duplicates(
                    complaints[i],
                    [complaints[j]],
                    config
                )
                
                if duplicates:
                    similarity = duplicates[0]['similarity_scores']['overall']
                    similarity_matrix[i][j] = similarity
                    similarity_matrix[j][i] = similarity
        
        # Simple clustering: group complaints with similarity above threshold
        visited = set()
        clusters = []
        
        for i in range(n):
            if i in visited:
                continue
            
            cluster = [complaints[i]]
            visited.add(i)
            
            for j in range(n):
                if j not in visited and similarity_matrix[i][j] >= config['similarity_threshold']:
                    cluster.append(complaints[j])
                    visited.add(j)
            
            if len(cluster) > 1:
                clusters.append(cluster)
        
        return clusters


def predict_complaint_urgency(complaint_data):
    """
    Predicts the urgency of a complaint based on its text and/or category.
    In a real application, this would use a trained ML model (e.g., using 
    Naive Bayes, BERT, or other classifiers trained on complaint data).
    """
    
    description = complaint_data.get('description', '').lower()
    category = complaint_data.get('category', '').lower()

    # High Urgency Keywords
    high_urgency_keywords = ['leak', 'fire', 'medical', 'emergency', 'danger', 'sewage']
    
    # Medium Urgency Keywords
    medium_urgency_keywords = ['broken', 'no water', 'power outage', 'major problem', 'traffic']

    # Simple Keyword-based Logic
    if any(kw in description or kw in category for kw in high_urgency_keywords):
        return 'HIGH'
    elif any(kw in description or kw in category for kw in medium_urgency_keywords):
        return 'MEDIUM'
    else:
        return 'LOW'

def calculate_duplicate_probability(similarity_scores: Dict) -> float:
    """
    Calculate probability that two complaints are duplicates
    Uses a weighted logistic function
    """
    # Weights for different features
    weights = {
        'title': 2.0,
        'description': 1.5,
        'location': 2.5,
        'time': 1.0
    }
    
    # Calculate weighted score
    weighted_sum = 0
    total_weight = 0
    
    for feature, weight in weights.items():
        if feature in similarity_scores:
            weighted_sum += similarity_scores[feature] * weight
            total_weight += weight
    
    if total_weight == 0:
        return 0.0
    
    normalized_score = weighted_sum / total_weight
    
    # Apply logistic function for probability
    # P(duplicate) = 1 / (1 + e^(-k*(score - threshold)))
    k = 10  # Steepness
    threshold = 0.6
    
    probability = 1 / (1 + math.exp(-k * (normalized_score - threshold)))
    
    return probability


# Example usage
'''
if __name__ == "__main__":
    # Initialize detector
    detector = ComplaintDuplicateDetector(use_sentence_transformer=False)
    
    # Sample complaints
    target = {
        '_id': '1',
        'title': 'Broken streetlight on Main Street',
        'description': 'The streetlight near house number 42 is not working',
        'latitude': 26.8467,
        'longitude': 80.9462,
        'created_at': datetime.now()
    }
    
    complaints = [
        {
        '_id': '4',
        'title': 'Broken streetlight on Main Street',
        'description': 'The streetlight in front of  house number 40- is not working',
        'latitude': 26.8460,
        'longitude': 80.9461,
        'created_at': datetime.now()
    },
        {
            '_id': '2',
            'title': 'Street light not working on Main St',
            'description': 'Streetlight broken near house 42',
            'latitude': 26.8468,
            'longitude': 80.9463,
            'created_at': datetime.now() - timedelta(hours=2)
        },
        {
            '_id': '3',
            'title': 'Pothole on Highway 5',
            'description': 'Large pothole causing traffic issues',
            'latitude': 26.9000,
            'longitude': 81.0000,
            'created_at': datetime.now() - timedelta(days=1)
        }
    ]
    
    # Find duplicates
    # results = detector.find_duplicates(target, complaints)
    
    '''
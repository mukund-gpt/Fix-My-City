import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { useState } from 'react';

const StaffCommentForm = ({ onSubmit, isSubmitting }) => {
    const [commentText, setCommentText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim() === '' && !imageFile) {
            return; // Optionally show a toast error
        }
        // Call the parent handler
        onSubmit({ text: commentText, imageFile });
        // Reset form after submission (assuming parent handles success/error)
        setCommentText('');
        setImageFile(null);
        setImagePreview(null);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} className="space-y-4">
            <TextField
                fullWidth
                multiline
                rows={3}
                label="Add Resolution Details or Comment"
                variant="outlined"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmitting}
            />

            {/* Image Upload Button */}
            <Box className="flex items-center space-x-3">
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="icon-button-file"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                />
                <label htmlFor="icon-button-file">
                    <IconButton color="primary" component="span" aria-label="upload picture" disabled={isSubmitting}>
                        <PhotoCamera />
                    </IconButton>
                </label>
                <Typography variant="body2" color="textSecondary">
                    {imageFile ? imageFile.name : 'Optional: Upload Resolution Image'}
                </Typography>
            </Box>
            
            {/* Image Preview */}
            {imagePreview && (
                <Box className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-contain rounded border" />
                    <Button 
                        size="small" 
                        color="error" 
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="mt-1"
                    >
                        Remove Image
                    </Button>
                </Box>
            )}

            <Button 
                type="submit" 
                variant="contained" 
                color="success" 
                fullWidth
                disabled={isSubmitting || (commentText.trim() === '' && !imageFile)}
            >
                {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    'Submit Resolution Comment'
                )}
            </Button>
        </Box>
    );
};

export default StaffCommentForm;
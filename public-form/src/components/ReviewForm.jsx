import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { submitReview } from '../services/api';

function ReviewForm({ campaign, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const hasProducts = campaign.products && campaign.products.length > 0;

    const onSubmit = async (data) => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (hasProducts && !selectedProduct) {
            setError('Please select a product to review');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            const response = await submitReview({
                ...data,
                campaignId: campaign.id,
                rating,
                productId: selectedProduct || null,
            });
            onSuccess(response.data.promoCode);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-form-container">
            <div className="campaign-header">
                <h1>Leave a Review</h1>
                <p className="campaign-name">{campaign.name}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="review-form">
                {error && <div className="error-message">{error}</div>}

                {/* Product Selection */}
                {hasProducts && (
                    <div className="form-group">
                        <label>Select Product *</label>
                        <div className="product-grid">
                            {campaign.products.map((product) => (
                                <div
                                    key={product.id}
                                    className={`product-card ${selectedProduct === String(product.id) ? 'selected' : ''}`}
                                    onClick={() => setSelectedProduct(String(product.id))}
                                >
                                    {product.image && (
                                        <img src={product.image} alt={product.title} />
                                    )}
                                    <span>{product.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Your Name *</label>
                    <input
                        type="text"
                        {...register('customerName', { required: 'Name is required' })}
                        placeholder="Enter your name"
                    />
                    {errors.customerName && (
                        <span className="field-error">{errors.customerName.message}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Your Email *</label>
                    <input
                        type="email"
                        {...register('customerEmail', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Please enter a valid email',
                            },
                        })}
                        placeholder="Enter your email"
                    />
                    {errors.customerEmail && (
                        <span className="field-error">{errors.customerEmail.message}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Rating *</label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Your Review</label>
                    <textarea
                        {...register('reviewText')}
                        placeholder="Tell us about your experience..."
                        rows={4}
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review & Get Promo Code'}
                </button>
            </form>
        </div>
    );
}

export default ReviewForm;

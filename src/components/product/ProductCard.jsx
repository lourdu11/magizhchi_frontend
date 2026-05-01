import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService, wishlistService } from '../../services';
import { useAuthStore } from '../../store';
import { toast } from 'react-hot-toast';
import SafeImage from '../common/SafeImage';

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const price = product.discountedPrice || product.sellingPrice;
  const hasDiscount = product.discountPercentage > 0;
  const isOutOfStock = product.variants?.every(v => (v.stock || 0) - (v.reservedStock || 0) <= 0);

  const { mutate: addToCart, isPending: addingToCart } = useMutation({
    mutationFn: () => {
      const defaultVariant = product.variants?.[0];
      return cartService.addToCart({
        productId: product._id,
        size: defaultVariant?.size,
        color: defaultVariant?.color,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Added to cart!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add to cart'),
  });

  const { mutate: toggleWishlist } = useMutation({
    mutationFn: () => wishlistService.addToWishlist(product._id),
    onSuccess: () => { queryClient.invalidateQueries(['wishlist']); toast.success('Added to wishlist!'); },
  });

  const handleCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    if (isOutOfStock) return;
    addToCart();
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    toggleWishlist();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <motion.div 
          whileHover={{ 
            rotateY: 5, 
            rotateX: -5,
            z: 50,
            scale: 1.05,
            transition: { type: "spring", stiffness: 300, damping: 20 }
          }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative aspect-[4/5] max-w-xs mx-auto rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-light-bg mb-4 border border-border-light group-hover:border-premium-gold/30 transition-all duration-500 shadow-sm group-hover:shadow-2xl group-hover:shadow-premium-gold/10"
        >

          <SafeImage
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
          />

          {/* Labels */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {isOutOfStock && (
              <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20">Sold Out</span>
            )}
            {product.isNewArrival && !isOutOfStock && (
              <span className="bg-charcoal text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">New</span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="bg-premium-gold text-charcoal text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">-{product.discountPercentage}%</span>
            )}
          </div>

          {/* Wishlist Button (Always Visible) */}
          <div className="absolute top-4 right-4 z-30">
            <button onClick={handleWishlist}
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/70 backdrop-blur-md flex items-center justify-center text-charcoal hover:bg-premium-gold hover:text-white transition-all shadow-lg active:scale-90">
              <Heart size={18} className="md:size-5" />
            </button>
          </div>


          {/* Add to Cart Overlay (Desktop) */}
          {!isOutOfStock && (
            <div className="hidden md:block absolute bottom-6 left-6 right-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
              <button onClick={handleCart} disabled={addingToCart}
                className="w-full py-4 bg-charcoal text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-premium-gold transition-all shadow-xl">
                {addingToCart ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShoppingBag size={16} /> Quick Add</>}
              </button>
            </div>
          )}

          {/* Mobile Direct Action */}
          {!isOutOfStock && (
            <div className="md:hidden absolute bottom-3 right-3 z-30">
              <button onClick={handleCart} disabled={addingToCart}
                className="w-10 h-10 bg-charcoal text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                {addingToCart ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
              </button>
            </div>
          )}
        </motion.div>


        {/* Product Details */}
        <div className="px-2">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="text-sm md:text-lg font-black text-charcoal truncate flex-1 tracking-tight">{product.name}</h3>
            <div className="flex items-center gap-1 shrink-0 pt-1">
              <Star size={10} className="fill-premium-gold text-premium-gold" />
              <span className="text-[10px] font-bold text-text-muted">{product.ratings?.average || '4.8'}</span>
            </div>
          </div>
          
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-3">{product.brand || 'Magizhchi'}</p>
          
          <div className="flex items-center gap-3">
            <span className="text-base md:text-xl font-black text-charcoal tracking-tighter">Rs.{price.toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <span className="text-xs md:text-sm text-text-muted line-through font-medium">Rs.{product.sellingPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

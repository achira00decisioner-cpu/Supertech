'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { supabase } from '../../lib/supabase';
import { Star, ShoppingCart, Heart, Share2, Truck, ShieldCheck, RefreshCw, Minus, Plus, ChevronRight, Check, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const { products, loading } = useProducts();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviews, setReviews] = useState<any[]>([]);
    const [averageRating, setAverageRating] = useState(0);

    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);

    // Fetch Reviews to Calculate Rating
    useEffect(() => {
        const fetchReviewStats = async () => {
            if (!id) return;
            // ... existing
            const { data } = await supabase
                .from('reviews')
                .select('rating')
                .eq('product_id', Number(id));

            if (data && data.length > 0) {
                setReviews(data);
                const avg = data.reduce((acc, curr) => acc + (curr.rating || 0), 0) / data.length;
                setAverageRating(Number(avg.toFixed(1))); // Keep 1 decimal
            } else {
                setReviews([]);
                setAverageRating(0);
            }
        };

        if (id) {
            fetchReviewStats();
        }
    }, [id]);

    // Check if product is favorited
    useEffect(() => {
        const checkFavorite = async () => {
            if (!user || !id) return;
            const { data } = await (supabase.from('favorites' as any) as any)
                .select('id')
                .eq('user_id', user.id)
                .eq('product_id', id)
                .maybeSingle();

            if (data) setIsFavorite(true);
        };
        checkFavorite();
    }, [user, id]);

    const toggleFavorite = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (isFavorite) {
            const { error } = await (supabase.from('favorites' as any) as any)
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', Number(id));

            if (error) {
                console.error('Remove favorite error:', error);
                alert('ไม่สามารถลบรายการโปรดได้: ' + (error.message || 'Unknown error'));
            } else {
                setIsFavorite(false);
            }
        } else {
            const { error } = await (supabase.from('favorites' as any) as any)
                .insert({ user_id: user.id, product_id: Number(id) });

            if (error) {
                console.error('Add favorite error:', error);
                alert('ไม่สามารถเพิ่มรายการโปรดได้: ' + (error.message || 'Unknown error. Table "favorites" might be missing.'));
            } else {
                setIsFavorite(true);
            }
        }
    };

    // If loading, show splash
    if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading Product...</div>;

    // Handle both string and number ID types
    const product = products.find(p => p.id == id);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Product not found</div>;
    }

    const images = product.images || [product.image];

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
    };

    const handleBuyNow = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        router.push('/checkout');
    };

    // ... (rest of logic)

    return (
        <div className="bg-[#f8f9fa] min-h-screen pb-20 pt-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* ... Breadcrumbs ... */}
                <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <Link href="/" className="hover:text-[var(--primary-orange)]">หน้าแรก</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span>{product.category || 'สินค้า'}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left: Images */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group">
                                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={toggleFavorite}
                                        className={`bg-white p-2 rounded-full shadow-md transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="bg-white p-2 rounded-full shadow-md hover:text-blue-500 transition-colors"><Share2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-square rounded-lg border-2 p-1 overflow-hidden transition-all ${selectedImage === idx ? 'border-[var(--primary-orange)]' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:col-span-7 space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">มีสินค้า</span>
                                    <span className="text-sm text-gray-500">รหัสสินค้า: {product.id}-SKU</span>
                                </div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                        <span className="text-yellow-500 font-bold ml-1">{averageRating > 0 ? averageRating : '0.0'}</span>
                                    </div>
                                    <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">({reviews.length} รีวิว)</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl lg:text-4xl font-black text-[var(--primary-orange)]">฿{product.price.toLocaleString()}</span>
                                        {product.discount && (
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">-{product.discount}</span>
                                        )}
                                    </div>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="text-sm lg:text-xl text-gray-400 line-through mb-1">฿{product.originalPrice.toLocaleString()}</span>
                                    )}
                                </div>
                                {product.discount && <div className="text-red-500 font-medium text-xs lg:text-sm flex items-center gap-1"><RefreshCw className="w-3 h-3" /> ราคาพิเศษเฉพาะช่วงนี้</div>}
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-gray-700">จำนวน:</span>
                                    <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                                        <button onClick={() => handleQuantityChange(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"><Minus className="w-4 h-4" /></button>
                                        <input type="text" value={quantity} readOnly className="w-14 text-center text-gray-900 font-bold focus:outline-none" />
                                        <button onClick={() => handleQuantityChange(1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <span className="text-xs lg:text-sm text-gray-500">มีสินค้า 99 ชิ้น</span>
                                </div>

                                {/* Action Buttons - Universal */}
                                <div className="flex gap-2 lg:gap-3 pt-2">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-blue-50 border border-blue-100 text-[var(--primary-blue)] font-bold py-2.5 lg:py-4 rounded-lg lg:rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5 lg:gap-2 text-xs lg:text-lg whitespace-nowrap"
                                    >
                                        <ShoppingCart className="w-4 h-4 lg:w-6 lg:h-6" /> <span className="hidden lg:inline">เพิ่มลงตะกร้า</span><span className="lg:hidden">เพิ่มใส่ตะกร้า</span>
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-[1.5] bg-[var(--primary-orange)] text-white font-bold py-2.5 lg:py-4 rounded-lg lg:rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all text-xs lg:text-lg transform hover:-translate-y-1 whitespace-nowrap"
                                    >
                                        ซื้อสินค้าทันที
                                    </button>
                                </div>
                            </div>

                            {/* Service Badges */}
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Truck className="w-8 h-8 text-[var(--primary-orange)]" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">ส่งฟรีทั่วไทย</div>
                                        <div className="text-xs text-gray-500">เมื่อช้อปครบ 5,000.-</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-8 h-8 text-[var(--primary-orange)]" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">รับประกันศูนย์ไทย</div>
                                        <div className="text-xs text-gray-500">มั่นใจของแท้ 100%</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RefreshCw className="w-8 h-8 text-[var(--primary-orange)]" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">คืนสินค้าได้</div>
                                        <div className="text-xs text-gray-500">ภายใน 7 วัน</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Check className="w-8 h-8 text-[var(--primary-orange)]" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-800">เก็บเงินปลายทาง</div>
                                        <div className="text-xs text-gray-500">รอรับของหน้าบ้าน</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Tabs */}
                <div className="bg-white rounded-xl shadow-sm mt-8 overflow-hidden">
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {['description', 'specifications', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-4 font-bold text-sm lg:text-base capitalize transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                                    ? 'border-[var(--primary-orange)] text-[var(--primary-orange)] bg-orange-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {tab === 'description' && 'รายละเอียดสินค้า'}
                                {tab === 'specifications' && 'คุณสมบัติสินค้า'}
                                {tab === 'reviews' && 'รีวิวจากลูกค้า'}
                            </button>
                        ))}
                    </div>
                    <div className="p-8 min-h-[400px] animate-fade-in">
                        {activeTab === 'description' && (
                            <div className="prose max-w-none">
                                <h3 className="text-xl font-bold mb-4">{product.name}</h3>
                                <div className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                                    {(product.description || '').split('--- ข้อมูลจำเพาะ ---')[0].trim() || 'ไม่มีรายละเอียดเพิ่มเติม'}
                                </div>

                                <div className="bg-gray-50 p-8 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
                                    <div className="text-center">
                                        <h4 className="text-2xl font-black text-[var(--primary-blue)] mb-2 italic">SUPER<span className="text-[var(--primary-orange)]">TECH</span> <span className="not-italic text-gray-400 font-medium text-lg">GUARANTEE</span></h4>
                                        <p className="text-gray-500">สินค้าคุณภาพระดับพรีเมียม คัดสรรเพื่อคุณโดยเฉพาะ</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'specifications' && (
                            <div>
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-[var(--primary-orange)]"></div>
                                    คุณสมบัติสินค้า
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-gray-100">
                                            {/* Default Rows */}
                                            {product.brand && <tr className="bg-gray-50"><td className="p-4 font-medium w-1/3 text-gray-500">แบรนด์</td><td className="p-4 text-gray-900 font-medium">{product.brand}</td></tr>}
                                            <tr><td className="p-4 font-medium w-1/3 text-gray-500">ประเภท</td><td className="p-4 text-gray-900 font-medium">{product.category}</td></tr>

                                            {/* Dynamic Parsed Rows */}
                                            {(product.description || '').includes('--- ข้อมูลจำเพาะ ---') ? (
                                                (product.description || '').split('--- ข้อมูลจำเพาะ ---')[1]
                                                    .split('\n')
                                                    .filter(line => line.trim().startsWith('-'))
                                                    .map((line, idx) => {
                                                        const [key, ...values] = line.replace('-', '').split(':');
                                                        return (
                                                            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                                <td className="p-4 font-medium w-1/3 text-gray-500">{key?.trim()}</td>
                                                                <td className="p-4 text-gray-900 font-medium">{values.join(':').trim()}</td>
                                                            </tr>
                                                        );
                                                    })
                                            ) : (
                                                <tr className="bg-gray-50"><td className="p-4 text-gray-400 text-center" colSpan={2}>ไม่มีข้อมูลจำเพาะเพิ่มเติม</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <ProductReviews productId={product.id} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Reviews
function ProductReviews({ productId }: { productId: any }) {
    // supabase imported from lib

    // TEMPORARY: I will use a dummy fetch logic that assumes `supabase` is available or I will inject the import.
    // I'll add the import at the top in another edit if missing. For now, let's assume I can get data.

    // Wait, I can't easily add imports without messing up line numbers if I replace bottom block.
    // I will use `useProducts` context if it has supabase, usually it doesn't expose it publically in all my previous memory of this stack.
    // I will write the component to Fetch from supabase directly.

    // Let's assume `createClientComponentClient` is needed. I'll add the import at the TOP in a separate small edit first? 
    // No, I can replace the whole file content in 2 chunks, or just add the Review component at the bottom but I need imports.
    // BETTER STRATEGY: 
    // 1. Add `ProductReviews` component within the same file at the bottom.
    // 2. Add necessary imports at the top.

    // Let's try to stick to the requested change -> Add Review Tab.

    return (
        <div className="space-y-8">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                รีวิวจากลูกค้า
            </h3>

            <ReviewList productId={productId} />
        </div>
    );
}



function ReviewList({ productId }: { productId: any }) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');

    const fetchReviews = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            // 1. Fetch Reviews
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('id, rating, comment, created_at, user_id')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });

            if (reviewsError) {
                console.error('Error fetching reviews:', reviewsError);
                setLoading(false);
                return;
            }

            if (!reviewsData || reviewsData.length === 0) {
                setReviews([]);
                setLoading(false);
                return;
            }

            // 2. Fetch Profiles
            const userIds = Array.from(new Set(reviewsData.map(r => r.user_id).filter(Boolean)));
            let profilesMap = new Map();

            if (userIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds);

                if (profilesData) {
                    profilesData.forEach(p => profilesMap.set(p.id, p));
                }
            }

            // 3. Merge Data
            const mergedReviews = reviewsData.map(review => ({
                ...review,
                profiles: profilesMap.get(review.user_id) || { full_name: 'ผู้ใช้งานระบบ' }
            }));

            setReviews(mergedReviews);

        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleDelete = async (reviewId: number) => {
        if (!confirm('คุณแน่ใจว่าต้องการลบรีวิวนี้?')) return;

        const { error } = await supabase.from('reviews').delete().eq('id', reviewId).eq('user_id', user?.id || '');

        if (error) {
            alert('ลบไม่สำเร็จ: ' + error.message);
        } else {
            alert('ลบรีวิวเรียบร้อย');
            fetchReviews();
        }
    };

    const handleEdit = (review: any) => {
        setEditingReviewId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditRating(5);
        setEditComment('');
    };

    const handleSaveEdit = async (reviewId: number) => {
        if (!user) return;

        const { error } = await supabase.from('reviews').update({
            rating: editRating,
            comment: editComment,
            created_at: new Date().toISOString() // Optional: update timestamp
        }).eq('id', reviewId).eq('user_id', user.id);

        if (error) {
            alert('แก้ไขไม่สำเร็จ: ' + error.message);
        } else {
            alert('แก้ไขรีวิวเรียบร้อย');
            setEditingReviewId(null);
            fetchReviews();
        }
    };

    if (loading) return <div className="text-gray-400 text-center py-8 flex flex-col items-center"><div className="w-6 h-6 border-2 border-[var(--primary-orange)] border-t-transparent rounded-full animate-spin mb-2"></div>กำลังโหลดรีวิว...</div>;

    if (reviews.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
                <p className="text-xs text-gray-400 mt-1">เป็นคนแรกที่รีวิวสินค้านี้หลังจากสั่งซื้อ!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg flex-shrink-0 border border-gray-200">
                        {review.profiles?.full_name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div className="w-full">
                                <div className="flex justify-between items-center w-full">
                                    <h4 className="font-bold text-gray-900">{review.profiles?.full_name || 'ผู้ใช้งานระบบ'}</h4>
                                    {user && user.id === review.user_id && !editingReviewId && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(review)} className="text-gray-400 hover:text-blue-600 transition-colors" title="แก้ไข">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(review.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="ลบ">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editingReviewId === review.id ? (
                                    <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button key={star} onClick={() => setEditRating(star)} type="button" className="focus:outline-none transition-transform hover:scale-110">
                                                    <Star className={`w-6 h-6 ${star <= editRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                                </button>
                                            ))}
                                            <span className="text-sm text-gray-500 ml-2">คะแนน: {editRating}/5</span>
                                        </div>
                                        <textarea
                                            value={editComment}
                                            onChange={(e) => setEditComment(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-yellow-400/50 outline-none mb-3"
                                            rows={3}
                                            placeholder="แก้ไขความคิดเห็นของคุณ..."
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={handleCancelEdit} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors">ยกเลิก</button>
                                            <button onClick={() => handleSaveEdit(review.id)} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm">บันทึก</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                            ))}
                                            <span className="text-xs text-gray-400 ml-2">{new Date(review.created_at).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-50 mt-2">
                                            {review.comment || 'ไม่มีความคิดเห็น'}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

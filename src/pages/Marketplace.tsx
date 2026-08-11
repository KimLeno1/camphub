import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { 
  Search, Tag, ShoppingBag, Plus, X, User, Mail, 
  Layers, Package, Check, HelpCircle, Sparkles, Filter, Trash2, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

// Types
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Textbooks' | 'Electronics' | 'Furniture' | 'Services' | 'Other';
  condition: 'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair';
  image: string;
  sellerName: string;
  sellerContact: string;
  createdAt: string;
  isCustom?: boolean; // to allow deletion of newly added items
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Textbooks': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
  'Electronics': 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&q=80&w=600',
  'Furniture': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600',
  'Services': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
  'Other': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
};

const INITIAL_ITEMS: MarketplaceItem[] = [
  {
    id: 'item-1',
    title: 'Introduction to Algorithms (4th Edition)',
    description: 'Essential textbook for computer science majors. Pristine condition, no highlights or markings. Can meet up in the library or campus student lounge.',
    price: 45,
    category: 'Textbooks',
    condition: 'Like New',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Alex Rivera',
    sellerContact: 'alex.rivera@campus.edu',
    createdAt: '2026-08-08',
  },
  {
    id: 'item-2',
    title: 'Ergonomic Desk Chair',
    description: 'Very comfortable desk chair with mesh back and adjustable lumbar support. Ideal for long study and coding sessions. Only used for one semester.',
    price: 60,
    category: 'Furniture',
    condition: 'Very Good',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Marcus Vance',
    sellerContact: 'marcus.v@campus.edu',
    createdAt: '2026-08-09',
  },
  {
    id: 'item-3',
    title: 'iPad Air 4 (64GB, Space Gray) + Pencil',
    description: 'Great for digital note-taking and sketching. Screen protector has been installed since day one. Comes with Apple Pencil Gen 2, magnetic case, and original box.',
    price: 320,
    category: 'Electronics',
    condition: 'Very Good',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Sophia Chen',
    sellerContact: 'sophia.c@campus.edu',
    createdAt: '2026-08-07',
  },
  {
    id: 'item-4',
    title: 'Linear Algebra & Calc II Private Tutoring',
    description: 'Struggling with formulas? Experienced peer tutor offering high-quality 1-on-1 exam prep and assignment reviews. Rates are per hour, can meet in library study room 4B.',
    price: 20,
    category: 'Services',
    condition: 'New',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    sellerName: 'David Kim',
    sellerContact: 'david.k@campus.edu',
    createdAt: '2026-08-10',
  },
  {
    id: 'item-5',
    title: 'Scientific Calculator TI-84 Plus CE',
    description: 'Required color graphics calculator for advanced mathematics and engineering classes. Rechargeable battery, includes charger and slide cover.',
    price: 75,
    category: 'Electronics',
    condition: 'Like New',
    image: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Priya Patel',
    sellerContact: 'priya.p@campus.edu',
    createdAt: '2026-08-05',
  },
  {
    id: 'item-6',
    title: 'Minimalist Dorm Desk Lamp',
    description: 'Compact metal desk lamp with adjustable neck. Has multiple warm/cool light settings and built-in USB ports for charging your devices.',
    price: 15,
    category: 'Furniture',
    condition: 'Good',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Marcus Vance',
    sellerContact: 'marcus.v@campus.edu',
    createdAt: '2026-08-06',
  }
];

const STORAGE_KEY = 'campus_marketplace_listings_v1';

export function Marketplace() {
  const { user, profile } = useAuthStore();

  // Listings State
  const [items, setItems] = useState<MarketplaceItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing stored marketplace listings:', e);
    }
    return INITIAL_ITEMS;
  });

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');

  // Modals Toggle State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  // New Listing Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'Textbooks' | 'Electronics' | 'Furniture' | 'Services' | 'Other'>('Textbooks');
  const [formCondition, setFormCondition] = useState<'New' | 'Like New' | 'Very Good' | 'Good' | 'Fair'>('Very Good');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');

  // Persist listings to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving marketplace listings:', e);
    }
  }, [items]);

  // Set default seller email on load or auth changes
  useEffect(() => {
    if (user?.email) {
      setFormContactEmail(user.email);
    } else {
      setFormContactEmail('student@campus.edu');
    }
  }, [user]);

  // Handle Form Submission
  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      toast.error('Please enter an item title');
      return;
    }
    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Please enter a valid price (minimum ₵0)');
      return;
    }
    if (!formDescription.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const sellerName = profile?.displayName || user?.displayName || 'Active Student';
    const finalImage = formImage.trim() || CATEGORY_IMAGES[formCategory];

    const newItem: MarketplaceItem = {
      id: `custom_item_${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      condition: formCondition,
      price: priceNum,
      description: formDescription.trim(),
      image: finalImage,
      sellerName: sellerName,
      sellerContact: formContactEmail.trim() || 'student@campus.edu',
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true
    };

    setItems((prev) => [newItem, ...prev]);
    toast.success('Listing posted successfully to Campus Marketplace!');
    
    // Automatically switch to the category of the new item and clear search so the user sees it immediately
    setSelectedCategory(formCategory);
    setSearchQuery('');
    
    // Reset Form & Close Modal
    setFormTitle('');
    setFormPrice('');
    setFormDescription('');
    setFormImage('');
    setIsCreateOpen(false);
  };

  // Handle Deleting a Listing
  const handleDeleteListing = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    toast.success('Listing removed from marketplace');
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  // Reset to seed listings
  const handleResetToDefaults = () => {
    setItems(INITIAL_ITEMS);
    toast.info('Marketplace reset to standard seed data');
  };

  // Filter listings based on category and search query
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All Items' || item.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.sellerName.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  const categories = ['All Items', 'Textbooks', 'Electronics', 'Furniture', 'Services', 'Other'];

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'New':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'Like New':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'Very Good':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'Good':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-fade-in px-4">
      
      {/* Banner / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-700 to-indigo-800 text-white p-6 md:p-10 shadow-lg">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-white via-teal-200 to-indigo-900 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wide uppercase">
              <ShoppingBag className="w-3.5 h-3.5" /> Peer-to-Peer Trading
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading">
              Campus Marketplace
            </h1>
            <p className="text-emerald-50 text-sm md:text-base leading-relaxed">
              Skip the high retail markups and logistics. Securely trade textbooks, electronics, dorm furniture, and student services directly with verified students in your campus community.
            </p>
          </div>

          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="self-start md:self-center bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold px-5 py-6 rounded-xl shrink-0 gap-2 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>New Listing</span>
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Real-time search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search listings by keyword, seller, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-sm bg-card border-border rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Reset helper */}
          {items.length !== INITIAL_ITEMS.length && (
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="h-11 px-4 border-dashed border-border hover:bg-muted text-xs font-bold rounded-xl shrink-0"
              title="Reset marketplace listings to default items"
            >
              Reset to Defaults
            </Button>
          )}
        </div>

        {/* Category Filter Pills (Housing replaced with Furniture!) */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-4 rounded-full text-xs font-bold shrink-0 transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {cat === 'All Items' ? '🌐 All Items' : cat === 'Textbooks' ? '📚 Textbooks' : cat === 'Electronics' ? '💻 Electronics' : cat === 'Furniture' ? '🪑 Furniture' : cat === 'Services' ? '🤝 Services' : '🏷️ Other'}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTINGS GRID CONTAINER */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-border rounded-2xl bg-card/40 flex flex-col items-center justify-center space-y-3 p-6 max-w-lg mx-auto">
          <ShoppingBag className="w-12 h-12 text-muted-foreground opacity-30" />
          <h3 className="text-base font-bold text-foreground font-heading">No Marketplace Listings Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {searchQuery 
              ? `We couldn't find anything matching "${searchQuery}" in ${selectedCategory}. Try broadening your keywords.`
              : `There are currently no listings active in the "${selectedCategory}" category.`}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Items');
            }}
            className="text-xs h-8 rounded-lg"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="overflow-hidden border-border bg-card hover:shadow-md hover:border-border/80 transition-all flex flex-col group cursor-pointer h-full"
            >
              {/* Card Image Cover */}
              <div className="relative h-48 w-full overflow-hidden bg-muted/20 border-b border-border/40">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[90%]">
                  <Badge className="bg-background/95 backdrop-blur-xs text-foreground border border-border/80 text-[10px] font-bold py-0.5 px-2">
                    {item.category}
                  </Badge>
                  <Badge className={`text-[10px] font-bold py-0.5 px-2 ${getConditionColor(item.condition)}`}>
                    {item.condition}
                  </Badge>
                </div>

                {item.isCustom && (
                  <button
                    onClick={(e) => handleDeleteListing(item.id, e)}
                    className="absolute top-3 right-3 p-1.5 bg-background/95 backdrop-blur-xs text-muted-foreground hover:text-red-500 rounded-lg shadow-sm hover:scale-105 border border-border/80 transition-all"
                    title="Delete your listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Card Title & Content */}
              <CardHeader className="p-4 pb-2 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-bold font-heading line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span>Posted by {item.sellerName}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-0 pb-3 flex-1">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </CardContent>

              {/* Card Footer with Pricing */}
              <CardFooter className="p-4 pt-3 border-t border-border/50 bg-muted/10 flex items-center justify-between text-xs mt-auto">
                <div>
                  <span className="text-[10px] text-muted-foreground block font-medium">Price</span>
                  <div className="text-base font-extrabold text-foreground font-heading flex items-center text-emerald-600 dark:text-emerald-400">
                    <span className="font-bold mr-0.5">₵</span>
                    <span>{item.price}</span>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="secondary"
                  className="h-8 text-[11px] font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE NEW LISTING MODAL DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Post New Marketplace Listing</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              List textbooks, gadgets, services, or furniture. Keep it campus friendly!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="space-y-4 py-2 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Item Title <span className="text-red-500">*</span></label>
              <Input
                placeholder="e.g. Introduction to Algorithms textbook, Desk lamp, iPad case"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            {/* Category & Condition Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Category <span className="text-red-500">*</span></label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Textbooks">📚 Textbooks</option>
                  <option value="Electronics">💻 Electronics</option>
                  <option value="Furniture">🪑 Furniture</option>
                  <option value="Services">🤝 Services</option>
                  <option value="Other">🏷️ Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Condition <span className="text-red-500">*</span></label>
                <select
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="New">New (Unopened)</option>
                  <option value="Like New">Like New (Mint)</option>
                  <option value="Very Good">Very Good (Minimal Wear)</option>
                  <option value="Good">Good (Standard Wear)</option>
                  <option value="Fair">Fair (Noticeable wear but functional)</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Price (₵) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">₵</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                  className="pl-7 h-9 text-xs"
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="font-bold text-foreground">Image URL (Optional)</label>
                <span className="text-[10px] text-muted-foreground">Category fallback is used if blank</span>
              </div>
              <Input
                placeholder="Paste Unsplash or other public image URL"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Contact Email / Communication <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="e.g. name@campus.edu"
                  value={formContactEmail}
                  onChange={(e) => setFormContactEmail(e.target.value)}
                  required
                  className="pl-8 h-9 text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold text-foreground">Description <span className="text-red-500">*</span></label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe your item's condition, meeting locations, specs, etc..."
                required
                rows={3}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Post Listing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL VIEW MODAL DIALOG */}
      <Dialog open={selectedItem !== null} onOpenChange={(open) => { if (!open) setSelectedItem(null); }}>
        {selectedItem && (
          <DialogContent className="sm:max-w-lg max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold py-0.5 px-2">
                  {selectedItem.category}
                </Badge>
                <Badge className={`text-[10px] font-bold py-0.5 px-2 ${getConditionColor(selectedItem.condition)}`}>
                  {selectedItem.condition}
                </Badge>
              </div>
              <DialogTitle className="font-heading text-xl font-extrabold text-foreground mt-2">
                {selectedItem.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Listed on {selectedItem.createdAt}</span>
              </DialogDescription>
            </DialogHeader>

            {/* Detail Layout */}
            <div className="space-y-4 py-2 text-xs">
              {/* Product Image Cover */}
              <div className="h-56 w-full rounded-xl overflow-hidden bg-muted border border-border/40 relative">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-border/60 text-base font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 shadow-md">
                  <span className="font-bold">₵</span>
                  <span>{selectedItem.price}</span>
                </div>
              </div>

              {/* Description box */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-foreground text-sm">Description</h4>
                <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                  {selectedItem.description}
                </p>
              </div>

              {/* Seller details Box */}
              <div className="p-3 bg-muted/60 rounded-xl border border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground block text-[10px]">Seller Info</span>
                    <span className="font-bold text-foreground text-xs">{selectedItem.sellerName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-card border border-border py-1 px-2.5 rounded-lg">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground select-all">{selectedItem.sellerContact}</span>
                </div>
              </div>

              {/* Transaction notice */}
              <div className="p-2.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg border border-yellow-500/20 text-[10px] leading-relaxed">
                ⚠️ <strong>Safety Guard Reminder:</strong> Always perform transactions in public, brightly lit campus spaces (like the Student Center lobby) and examine items carefully before finalizing trades.
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t border-border/40 pt-3">
              {selectedItem.isCustom && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    handleDeleteListing(selectedItem.id, e);
                  }}
                  className="mr-auto font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete My Listing
                </Button>
              )}

              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>

              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(selectedItem.sellerContact);
                  toast.success(`Copied seller contact email (${selectedItem.sellerContact})! Paste in mail client or chat.`);
                }}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Seller</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

    </div>
  );
}

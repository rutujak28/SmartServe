import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Modal } from '@/components/admin/Modal';
import { Plus, Search, Edit, Trash2, Upload, Grid3x3, List } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { menuService } from '@/lib/services/menuService';
import { MenuItem, MenuCategory } from '@/lib/types/database';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function Menu() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    preparation_time: '',
    description: '',
    ingredients: '',
    is_available: true,
    image_url: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
        },
        () => {
          fetchMenuItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await menuService.getCategories();
      setCategories(data);
      if (data.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryId === 'all' || item.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = async () => {
    try {
      await menuService.createMenuItem({
        name: formData.name,
        category_id: formData.category_id,
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time),
        description: formData.description || undefined,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : undefined,
        is_available: formData.is_available,
        image_url: formData.image_url || undefined,
        is_vegetarian: false,
        is_vegan: false,
        display_order: 0,
      });
      toast.success('Menu item added successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price.toString(),
      preparation_time: item.preparation_time?.toString() || '15',
      description: item.description || '',
      ingredients: item.ingredients?.join(', ') || '',
      is_available: item.is_available,
      image_url: item.image_url || ''
    });
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    
    try {
      await menuService.updateMenuItem(editingItem.id, {
        name: formData.name,
        category_id: formData.category_id,
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time),
        description: formData.description || undefined,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : undefined,
        is_available: formData.is_available,
        image_url: formData.image_url || undefined,
      });
      toast.success('Menu item updated successfully');
      setEditingItem(null);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await menuService.deleteMenuItem(itemId);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      preparation_time: '15',
      description: '',
      ingredients: '',
      is_available: true,
      image_url: ''
    });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Menu Management' }]}>
        <div className="flex items-center justify-center h-[50vh]">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Menu Management' }]}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage food items, categories, and availability.
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategoryId}>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{getCategoryName(item.category_id)}</p>
                          </div>
                          <Badge variant={item.is_available ? 'default' : 'secondary'}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div>
                            <p className="text-lg font-bold">₹{item.price}</p>
                            <p className="text-xs text-muted-foreground">{item.preparation_time || 15} mins</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center flex-1">
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{getCategoryName(item.category_id)} • {item.preparation_time || 15} mins</p>
                          </div>
                          <p className="text-lg font-bold">₹{item.price}</p>
                          <Badge variant={item.is_available ? 'default' : 'secondary'}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingItem}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
          resetForm();
        }}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="image">Item Image</Label>
            <ImageUpload
              bucket="menu-images"
              currentImageUrl={formData.image_url}
              onUploadComplete={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
              onDelete={() => setFormData(prev => ({ ...prev, image_url: '' }))}
            />
          </div>

          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="preparationTime">Preparation Time (minutes) *</Label>
            <Input
              id="preparationTime"
              type="number"
              value={formData.preparation_time}
              onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
              placeholder="15"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="ingredients">Ingredients</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              placeholder="Enter ingredients (comma separated)"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
            <Label htmlFor="available">Item Available</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => {
              setIsAddModalOpen(false);
              setEditingItem(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

import { supabase } from '../lib/supabase';
import { AnalyticsData, Branch, Order, OrderStatus, User, UserRole } from '../types';

export const api = {
  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  login: async (email: string, password: string): Promise<User | null> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Login Failed:', authError?.message);
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile Fetch Failed:', profileError?.message);
      return null;
    }

    return {
      id: profile.id,
      username: profile.username || email,
      role: profile.role as UserRole,
      full_name: profile.full_name,
      branch_id: profile.branch_id
    } as unknown as User;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  // ----------------------------------------------------
  // ORDERS
  // ----------------------------------------------------
  getOrders: async (branchId?: number): Promise<Order[]> => {
    let query = supabase
      .from('orders')
      .select('*, customers(full_name, phone_number), customer_addresses(address_text, latitude, longitude)')
      .order('created_at', { ascending: false });

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    // Map the joined data to flat Order structure
    return data.map((order: any) => ({
      ...order,
      customer_name: order.customers?.full_name || 'App Customer',
      customer_phone: order.customers?.phone_number || 'N/A',
      address_text: order.customer_addresses?.address_text || 'Pick Up',
      customer_lat: order.customer_addresses?.latitude,
      customer_lng: order.customer_addresses?.longitude
    })) as Order[];
  },

  updateOrderStatus: async (orderId: number, status: OrderStatus): Promise<void> => {
    const updateData: any = { status };
    const now = new Date().toISOString();

    if (status === 'accepted') updateData.accepted_at = now;
    if (status === 'in_kitchen') updateData.in_kitchen_at = now;
    if (status === 'out_for_delivery') updateData.out_for_delivery_at = now;
    if (status === 'done') updateData.done_at = now;

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  },

  cancelOrder: async (orderId: number, reason: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  },

  dismissCancelledOrder: async (orderId: number): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({ cancellation_dismissed: true })
      .eq('id', orderId);

    if (error) throw error;
  },

  sendCustomerAlert: async (orderId: number, message: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({ customer_alert_message: message })
      .eq('id', orderId);

    if (error) throw error;
  },

  // ----------------------------------------------------
  // REQUEST MODIFICATIONS (Agent/Kitchen Workflow)
  // ----------------------------------------------------
  requestOrderModification: async (orderId: number, newItems: any[], newNotes: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({
        modification_pending: true, // <--- CRITICAL: Set Flag to TRUE
        modification_request: {
          items: newItems,
          notes: newNotes,
          requested_at: new Date().toISOString()
        }
      })
      .eq('id', orderId);

    if (error) throw error;
  },

  resolveOrderModification: async (orderId: number, action: 'accept' | 'decline'): Promise<void> => {
    // 1. If Declined: Just clear the request and turn off the flag
    if (action === 'decline') {
      const { error } = await supabase
        .from('orders')
        .update({
          modification_request: null,
          modification_pending: false // <--- CRITICAL: Set Flag to FALSE
        })
        .eq('id', orderId);
      if (error) throw error;
      return;
    }

    // 2. If Accepted: Apply changes AND turn off the flag
    const { data: order } = await supabase.from('orders').select('modification_request').eq('id', orderId).single();

    if (!order || !order.modification_request) return;

    const newItems = order.modification_request.items;
    const newNotes = order.modification_request.notes;

    // Recalculate Totals
    const subtotal = newItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    // Note: total_price is generated by DB usually, but we update subtotal

    const { error } = await supabase
      .from('orders')
      .update({
        items: newItems,
        kitchen_notes: newNotes,
        subtotal: subtotal,
        modification_request: null, // Clear JSON
        modification_pending: false // <--- CRITICAL: Set Flag to FALSE
      })
      .eq('id', orderId);

    if (error) throw error;
  },

  // ----------------------------------------------------
  // BRANCHES
  // ----------------------------------------------------
  getBranches: async (): Promise<Branch[]> => {
    const { data, error } = await supabase.from('branches').select('*');
    if (error) return [];
    return data as Branch[];
  },

  saveBranch: async (branch: Partial<Branch>): Promise<void> => {
    if (branch.id && branch.id !== 0) {
      const { error } = await supabase
        .from('branches')
        .update({
          name: branch.name,
          phone_contact: branch.phone_contact,
          zones: branch.zones,
          is_active: branch.is_active
        })
        .eq('id', branch.id);
      if (error) throw error;
    } else {
      const { id, ...newBranch } = branch;
      const { error } = await supabase.from('branches').insert(newBranch);
      if (error) throw error;
    }
  },

  // ----------------------------------------------------
  // ANALYTICS
  // ----------------------------------------------------
  getAnalytics: async (startDate?: string, endDate?: string): Promise<AnalyticsData> => {
    let query = supabase.from('orders').select('*, branches(name)');

    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
    if (endDate) query = query.lte('created_at', new Date(endDate).toISOString());

    const { data: orders, error } = await query;
    if (error || !orders) return {
      totalRevenue: 0, totalOrders: 0, avgDeliveryTime: 0, avgOrderValue: 0,
      revenuePerBranch: [], ordersPerHour: [], ordersByStatus: [], topItems: []
    };

    const validOrders = orders.filter((o: any) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // Calculate orders per hour
    const hourCounts: { [hour: string]: number } = {};
    orders.forEach((order: any) => {
      const hour = new Date(order.created_at).getHours();
      const hourKey = `${hour}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });
    const ordersPerHour = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: hourCounts[`${i}:00`] || 0
    }));

    // Calculate orders by status
    const statusColors: { [status: string]: string } = {
      pending: '#F59E0B',
      accepted: '#3B82F6',
      in_kitchen: '#8B5CF6',
      out_for_delivery: '#06B6D4',
      done: '#10B981',
      cancelled: '#EF4444'
    };
    const ordersByStatus = Object.entries(
      orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({
      name,
      value: value as number,
      color: statusColors[name] || '#6B7280'
    }));

    // Calculate top items
    const itemCounts: { [name: string]: { sales: number; revenue: number } } = {};
    validOrders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const name = item.name || 'Unknown Item';
          if (!itemCounts[name]) {
            itemCounts[name] = { sales: 0, revenue: 0 };
          }
          itemCounts[name].sales += item.qty || 1;
          itemCounts[name].revenue += (item.price || 0) * (item.qty || 1);
        });
      }
    });
    const topItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate revenue per branch
    const branchRevenue: { [branchName: string]: number } = {};
    validOrders.forEach((order: any) => {
      const branchName = order.branches?.name || 'Unknown Branch';
      branchRevenue[branchName] = (branchRevenue[branchName] || 0) + (order.total_price || 0);
    });
    const revenuePerBranch = Object.entries(branchRevenue).map(([name, revenue]) => ({
      name,
      revenue
    }));

    return {
      totalRevenue,
      totalOrders,
      avgDeliveryTime: 30, // TODO: Calculate from delivery timestamps
      avgOrderValue,
      revenuePerBranch,
      ordersPerHour,
      ordersByStatus,
      topItems
    };
  },

  // ----------------------------------------------------
  // MENU MANAGEMENT (CMS)
  // ----------------------------------------------------
  getCategories: async () => {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  saveCategory: async (category: any) => {
    if (category.id) {
      // Update
      const { error } = await supabase.from('menu_categories').update(category).eq('id', category.id);
      if (error) throw error;
    } else {
      // Create
      const { error } = await supabase.from('menu_categories').insert(category);
      if (error) throw error;
    }
  },

  deleteCategory: async (id: number) => {
    const { error } = await supabase.from('menu_categories').delete().eq('id', id);
    if (error) throw error;
  },

  getMenuItems: async (categoryId?: number) => {
    let query = supabase.from('menu_items').select('*').order('id', { ascending: false });
    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },


  saveMenuItem: async (item: any) => {
    if (item.id) {
      const { error } = await supabase.from('menu_items').update(item).eq('id', item.id);
      if (error) throw error;
      return { id: item.id };
    } else {
      const { id, ...newItem } = item; // Remove ID 0 if present
      const { data, error } = await supabase.from('menu_items').insert(newItem).select('id').single();
      if (error) throw error;
      return data;
    }
  },

  deleteMenuItem: async (id: number) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  },

  // ----------------------------------------------------
  // SITE SETTINGS (Brand Colors, etc)
  // ----------------------------------------------------
  getSiteSettings: async () => {
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    return data;
  },

  updateSiteSetting: async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value }); // Upsert = Update if exists, Insert if new
    if (error) throw error;
  },

  // ----------------------------------------------------
  // BRANCH SPECIFIC PRICING (The Override System)
  // ----------------------------------------------------

  // 1. Get all items with their specific price for a branch
  getBranchMenuSettings: async (branchId: number) => {
    // Fetch all items + LEFT JOIN the specific branch price
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        id, category_id, name_ar, base_price,
        branch_item_prices!left ( price, is_available )
      `)
      .eq('branch_item_prices.branch_id', branchId)
      .order('category_id');

    if (error) throw error;
    return data;
  },

  // 2. Save a specific price override
  updateBranchPrice: async (branchId: number, itemId: number, price: number, isAvailable: boolean) => {
    const { error } = await supabase
      .from('branch_item_prices')
      .upsert({
        branch_id: branchId,
        item_id: itemId,
        price: price,
        is_available: isAvailable
      }); // Upsert handles insert (new override) or update (existing override)

    if (error) throw error;
  },

  // ----------------------------------------------------
  // FILE UPLOAD
  // ----------------------------------------------------
  uploadImage: async (file: File): Promise<string | null> => {
    try {
      // 1. Create a unique file name (e.g. 123456789_burger.jpg)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase 'menu_images' bucket
      const { error: uploadError } = await supabase.storage
        .from('menu_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the Public URL
      const { data } = supabase.storage
        .from('menu_images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  },

  // ----------------------------------------------------
  // OPTION GROUPS & CHOICES (Variations Management)
  // ----------------------------------------------------

  // Get all option groups with their choices
  getOptionGroups: async () => {
    const { data, error } = await supabase
      .from('option_groups')
      .select(`
        *,
        option_choices (*)
      `)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Save (create or update) an option group
  saveOptionGroup: async (group: any) => {
    if (group.id) {
      const { error } = await supabase
        .from('option_groups')
        .update({
          name_ar: group.name_ar,
          name_en: group.name_en,
          name_other: group.name_other,
          min_selection: group.min_selection,
          max_selection: group.max_selection,
          is_price_replacement: group.is_price_replacement,
          is_active: group.is_active
        })
        .eq('id', group.id);
      if (error) throw error;
    } else {
      const { id, ...newGroup } = group;
      const { error } = await supabase.from('option_groups').insert(newGroup);
      if (error) throw error;
    }
  },

  // Delete an option group
  deleteOptionGroup: async (id: number) => {
    const { error } = await supabase.from('option_groups').delete().eq('id', id);
    if (error) throw error;
  },

  // Get choices for a specific group
  getOptionChoices: async (groupId: number) => {
    const { data, error } = await supabase
      .from('option_choices')
      .select('*')
      .eq('group_id', groupId)
      .order('id', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Save (create or update) an option choice
  saveOptionChoice: async (choice: any) => {
    if (choice.id) {
      const { error } = await supabase
        .from('option_choices')
        .update({
          name_ar: choice.name_ar,
          name_en: choice.name_en,
          name_other: choice.name_other,
          price_modifier: choice.price_modifier,
          is_available: choice.is_available
        })
        .eq('id', choice.id);
      if (error) throw error;
    } else {
      const { id, ...newChoice } = choice;
      const { error } = await supabase.from('option_choices').insert(newChoice);
      if (error) throw error;
    }
  },

  // Delete an option choice
  deleteOptionChoice: async (id: number) => {
    const { error } = await supabase.from('option_choices').delete().eq('id', id);
    if (error) throw error;
  },

  // Get option groups linked to a specific item (with choice_prices)
  getItemOptionGroups: async (itemId: number) => {
    const { data, error } = await supabase
      .from('item_option_links')
      .select(`
        group_id,
        sort_order,
        choice_prices,
        option_groups (
          *,
          option_choices (*)
        )
      `)
      .eq('item_id', itemId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  // Save item-option links with choice_prices
  // groupPrices: { groupId: { choiceId: price, ... }, ... }
  saveItemOptionLinks: async (itemId: number, groupPrices: Record<number, Record<number, number>>) => {
    // 1. Delete existing links
    const { error: deleteError } = await supabase
      .from('item_option_links')
      .delete()
      .eq('item_id', itemId);
    if (deleteError) throw deleteError;

    // 2. Insert new links with choice_prices
    const groupIds = Object.keys(groupPrices).map(id => parseInt(id));
    if (groupIds.length > 0) {
      const links = groupIds.map((groupId, index) => ({
        item_id: itemId,
        group_id: groupId,
        sort_order: index,
        choice_prices: groupPrices[groupId] || {}
      }));
      const { error: insertError } = await supabase
        .from('item_option_links')
        .insert(links);
      if (insertError) throw insertError;
    }
  }
};
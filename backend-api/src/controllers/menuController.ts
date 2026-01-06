import { Request, Response } from 'express';
import { supabase } from '../config/supabase'; // Adjusted path to config folder
import { MenuCategory, MenuItem, OptionGroup } from '../types';

// 1. Get Website Colors & Logo
export const getSiteSettings = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('site_settings').select('*');
        if (error) throw error;

        // Convert DB rows to a simple JSON object
        const settings: any = {};
        data.forEach((row: any) => {
            settings[row.key] = row.value;
        });

        res.json(settings);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get Menu with Branch-Specific Prices
export const getBranchMenu = async (req: Request, res: Response) => {
    try {
        const branchId = parseInt(req.params.id);
        if (isNaN(branchId)) return res.status(400).json({ error: 'Invalid Branch ID' });

        // A. Fetch Categories
        const { data: categories, error: catError } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (catError) throw catError;

        // B. Fetch Items + Specific Branch Price
        const { data: rawItems, error: itemError } = await supabase
            .from('menu_items')
            .select(`
                *,
                branch_item_prices ( price, is_available )
            `)
            .eq('is_active', true)
            .eq('branch_item_prices.branch_id', branchId);

        if (itemError) throw itemError;

        // C. Fetch Options (Groups + Choices + Choice Prices)
        const { data: optionsData, error: optError } = await supabase
            .from('item_option_links')
            .select(`
                item_id,
                choice_prices,
                option_groups (
                    id, name_ar, name_en, min_selection, max_selection, is_price_replacement,
                    option_choices ( id, name_ar, name_en )
                )
            `)
            .order('sort_order');

        if (optError) throw optError;

        // D. Combine everything
        const menu: MenuCategory[] = categories.map((cat: any) => ({
            id: cat.id,
            name_ar: cat.name_ar,
            name_en: cat.name_en,
            items: []
        }));

        rawItems.forEach((item: any) => {
            // Check availability
            const branchPriceData = item.branch_item_prices && item.branch_item_prices[0];
            if (branchPriceData && branchPriceData.is_available === false) return;

            // Calculate Price (Override or Base)
            const finalPrice = branchPriceData ? branchPriceData.price : item.base_price;

            // Find Options with item-specific prices
            const itemOptions = optionsData
                .filter((link: any) => link.item_id === item.id)
                .map((link: any) => {
                    const group = link.option_groups;
                    const choicePrices = link.choice_prices || {};

                    // Apply item-specific prices and filter out price=0
                    const choices = (group.option_choices || [])
                        .map((choice: any) => ({
                            ...choice,
                            price_modifier: choicePrices[choice.id] ?? 0
                        }))
                        .filter((choice: any) => choice.price_modifier > 0); // Hide 0-price items

                    return {
                        ...group,
                        choices
                    };
                })
                .filter((group: any) => group.choices.length > 0); // Hide empty groups

            const processedItem: MenuItem = {
                id: item.id,
                category_id: item.category_id,
                name_ar: item.name_ar,
                name_en: item.name_en,
                description_ar: item.description_ar,
                description_en: item.description_en,
                image_url: item.image_url,
                base_price: item.base_price,
                current_price: finalPrice,
                options: itemOptions as unknown as OptionGroup[]
            };

            const cat = menu.find(c => c.id === item.category_id);
            if (cat) cat.items.push(processedItem);
        });

        // Remove empty categories
        const nonEmptyMenu = menu.filter(c => c.items.length > 0);

        res.json(nonEmptyMenu);

    } catch (err: any) {
        console.error("Menu Error:", err);
        res.status(500).json({ error: err.message });
    }
};

import { supabase } from '../config/supabase';
import { MenuItem, OptionGroup } from '../types';

async function testMenu() {
    try {
        console.log("Fetching menu items...");
        const { data: rawItems, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('is_active', true)
            .limit(1);

        if (error) {
            console.error("Supabase Error:", error);
            return;
        }

        if (!rawItems || rawItems.length === 0) {
            console.log("No menu items found.");
            return;
        }

        console.log("Raw Item Keys:", Object.keys(rawItems[0]));

        const item = rawItems[0];

        // Try to access badge fields
        console.log("Accessing badge_text_ar:", item.badge_text_ar);

        const processedItem: MenuItem = {
            id: item.id,
            category_id: item.category_id,
            name_ar: item.name_ar,
            name_en: item.name_en,
            description_ar: item.description_ar,
            description_en: item.description_en,
            base_price: item.base_price,
            image_url: item.image_url,
            current_price: 100,
            is_available: true,
            options: [],
            // Explicitly checking these property assignments
            badge_text_ar: item.badge_text_ar,
            badge_text_en: item.badge_text_en,
            badge_text_other: item.badge_text_other
        };

        console.log("Processed Item Constructed Successfully");

    } catch (err: any) {
        console.error("Runtime Error Stack:", err.stack);
        console.error("Runtime Error Message:", err.message);
    }
}

testMenu();

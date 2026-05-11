import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type Category = Tables<"categories">;

export type ProductFilters = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  trending?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  sort?: "popular" | "price-asc" | "price-desc" | "rating" | "newest";
  limit?: number;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let q = supabase.from("products").select("*");

  if (filters.category && filters.category !== "all") q = q.eq("category_slug", filters.category);
  if (filters.search) q = q.ilike("name", `%${filters.search}%`);
  if (filters.minPrice != null) q = q.gte("discount_price", filters.minPrice);
  if (filters.maxPrice != null) q = q.lte("discount_price", filters.maxPrice);
  if (filters.minRating != null) q = q.gte("rating", filters.minRating);
  if (filters.trending) q = q.eq("trending", true);
  if (filters.bestSeller) q = q.eq("best_seller", true);
  if (filters.isNew) q = q.eq("is_new", true);

  switch (filters.sort) {
    case "price-asc":
      q = q.order("discount_price", { ascending: true });
      break;
    case "price-desc":
      q = q.order("discount_price", { ascending: false });
      break;
    case "rating":
      q = q.order("rating", { ascending: false });
      break;
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    default:
      q = q.order("review_count", { ascending: false });
  }

  if (filters.limit) q = q.limit(filters.limit);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchRelatedProducts(categorySlug: string, excludeSlug: string, limit = 6) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_slug", categorySlug)
    .neq("slug", excludeSlug)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function searchProducts(term: string, limit = 8): Promise<Product[]> {
  if (!term.trim()) return [];
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${term}%`)
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export const discountPercent = (p: Pick<Product, "original_price" | "discount_price">) =>
  Math.max(0, Math.round(((Number(p.original_price) - Number(p.discount_price)) / Number(p.original_price)) * 100));

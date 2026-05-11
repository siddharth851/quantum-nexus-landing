
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  gradient text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  long_description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  category_slug text NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  initials text NOT NULL,
  gradient text NOT NULL,
  original_price numeric(10,2) NOT NULL,
  discount_price numeric(10,2) NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 4.8,
  review_count integer NOT NULL DEFAULT 0,
  badge text,
  trending boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  in_stock boolean NOT NULL DEFAULT true,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_idx ON public.products(category_slug);
CREATE INDEX products_trending_idx ON public.products(trending);
CREATE INDEX products_best_seller_idx ON public.products(best_seller);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Public read products"
  ON public.products FOR SELECT
  USING (true);

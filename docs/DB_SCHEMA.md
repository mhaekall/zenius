# 🗄️ Supabase Database Schema

> *Auto-generated using Service Role Key.*

## 📋 Table: `orders`

| Column Name | Data Type | Default Value | Notes |
|---|---|---|---|
| `id` | uuid | `gen_random_uuid()` | 🔑 **PK** |
| `store_id` | uuid | `-` | 🔗 **FK** to `stores` |
| `customer_name` | text | `-` |  |
| `customer_whatsapp` | text | `-` |  |
| `items_snapshot` | jsonb | `-` |  |
| `total_amount` | numeric | `-` |  |
| `status` | text | `pending` |  |
| `utm_source` | text | `-` |  |
| `created_at` | timestamp with time zone | `now()` |  |
| `confirmed_at` | timestamp with time zone | `-` |  |

## 📋 Table: `products`

| Column Name | Data Type | Default Value | Notes |
|---|---|---|---|
| `id` | uuid | `gen_random_uuid()` | 🔑 **PK** |
| `store_id` | uuid | `-` | 🔗 **FK** to `stores` |
| `name` | text | `-` |  |
| `description` | text | `-` |  |
| `price` | numeric | `-` |  |
| `image_url` | text | `-` |  |
| `category` | text | `Lainnya` |  |
| `is_available` | boolean | `true` |  |
| `sort_order` | integer | `-` |  |
| `created_at` | timestamp with time zone | `now()` |  |
| `updated_at` | timestamp with time zone | `now()` |  |
| `options` | jsonb | `-` |  |

## 📋 Table: `analytics_events`

| Column Name | Data Type | Default Value | Notes |
|---|---|---|---|
| `id` | uuid | `gen_random_uuid()` | 🔑 **PK** |
| `store_id` | uuid | `-` | 🔗 **FK** to `stores` |
| `event_type` | text | `-` |  |
| `product_id` | uuid | `-` | 🔗 **FK** to `products` |
| `referrer` | text | `-` |  |
| `created_at` | timestamp with time zone | `now()` |  |

## 📋 Table: `stores`

| Column Name | Data Type | Default Value | Notes |
|---|---|---|---|
| `id` | uuid | `gen_random_uuid()` | 🔑 **PK** |
| `owner_id` | uuid | `-` |  |
| `slug` | text | `-` |  |
| `name` | text | `-` |  |
| `description` | text | `-` |  |
| `logo_url` | text | `-` |  |
| `qris_url` | text | `-` |  |
| `wa_number` | text | `-` |  |
| `is_active` | boolean | `true` |  |
| `theme_color` | text | `#6366f1` |  |
| `created_at` | timestamp with time zone | `now()` |  |
| `updated_at` | timestamp with time zone | `now()` |  |
| `onboarding_completed` | boolean | `-` |  |
| `address` | text | `-` |  |
| `city` | text | `-` |  |
| `operating_hours` | text | `-` |  |
| `instagram_username` | text | `-` |  |
| `tiktok_username` | text | `-` |  |
| `announcement` | text | `-` |  |


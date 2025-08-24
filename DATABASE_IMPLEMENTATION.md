# Menuop Database Model Implementation

This document outlines the database model implementation for the Menuop application that allows users to create, manage, and publish their digital menus.

## Database Schema

The database consists of three main tables with a hierarchical relationship:

### 1. `menus` Table

Stores the basic information about each menu.

**Columns:**

- `id` (UUID, Primary Key) - Unique identifier for the menu
- `user_id` (UUID, Foreign Key) - References the authenticated user who owns the menu
- `name` (TEXT, NOT NULL) - The name of the menu (e.g., "Dinner Menu", "Lunch Specials")
- `restaurant_name` (TEXT, NOT NULL) - The name of the restaurant
- `description` (TEXT, NULLABLE) - Optional description of the menu
- `is_published` (BOOLEAN, DEFAULT false) - Whether the menu is publicly accessible
- `slug` (TEXT, UNIQUE, NULLABLE) - URL-friendly identifier for public access
- `created_at` (TIMESTAMP WITH TIME ZONE) - When the menu was created
- `updated_at` (TIMESTAMP WITH TIME ZONE) - When the menu was last updated

### 2. `menu_sections` Table

Organizes menu items into logical sections (e.g., "Appetizers", "Main Courses", "Desserts").

**Columns:**

- `id` (UUID, Primary Key) - Unique identifier for the section
- `menu_id` (UUID, Foreign Key) - References the parent menu
- `name` (TEXT, NOT NULL) - The name of the section
- `description` (TEXT, NULLABLE) - Optional description of the section
- `sort_order` (INTEGER, DEFAULT 0) - Controls the display order of sections
- `created_at` (TIMESTAMP WITH TIME ZONE) - When the section was created
- `updated_at` (TIMESTAMP WITH TIME ZONE) - When the section was last updated

### 3. `menu_items` Table

Contains the individual menu items with their details.

**Columns:**

- `id` (UUID, Primary Key) - Unique identifier for the item
- `section_id` (UUID, Foreign Key) - References the parent section
- `name` (TEXT, NOT NULL) - The name of the menu item
- `description` (TEXT, NULLABLE) - Description of the menu item
- `price` (DECIMAL(10,2), NOT NULL) - Price of the item
- `image_url` (TEXT, NULLABLE) - URL to an image of the item (for future use)
- `is_available` (BOOLEAN, DEFAULT true) - Whether the item is currently available
- `sort_order` (INTEGER, DEFAULT 0) - Controls the display order of items within a section
- `created_at` (TIMESTAMP WITH TIME ZONE) - When the item was created
- `updated_at` (TIMESTAMP WITH TIME ZONE) - When the item was last updated

## Key Features

### 1. Row Level Security (RLS)

All tables implement Row Level Security policies to ensure:

- Users can only access their own menus and related data
- Public can access published menus (read-only)
- Proper data isolation between different users

### 2. Automatic Timestamps

All tables have triggers that automatically update the `updated_at` field when records are modified.

### 3. Automatic Slug Generation

The `menus` table has a trigger that automatically generates a unique, URL-friendly slug based on the restaurant name and menu name.

### 4. Cascading Deletes

When a menu is deleted, all its sections and items are automatically deleted. When a section is deleted, all its items are automatically deleted.

### 5. Flexible Ordering

Both sections and items have `sort_order` fields that allow for custom ordering within their parent containers.

## TypeScript Types

The implementation includes comprehensive TypeScript types for:

- Database table definitions
- Insert and update operations
- Extended types for working with nested data
- Form data types for the UI
- Public menu data for display

## Service Layer

### MenuService (Client-side)

Provides methods for:

- CRUD operations on menus, sections, and items
- Publishing/unpublishing menus
- Bulk operations for saving complete menus
- User menu management

### ServerMenuService (Server-side)

Provides methods for:

- Fetching public menus by slug or ID
- Server-side data access for published menus

## React Hooks

### useMenu

A comprehensive hook for managing menu creation and editing:

- Form state management
- Validation
- Save/load operations
- Section and item management
- Unsaved changes tracking

### useUserMenus

A hook for managing the user's menu list:

- Loading user's menus
- Delete operations
- Publish/unpublish toggles

## Database Migration

The SQL migration file (`supabase/migrations/20241201000001_create_menu_tables.sql`) includes:

- Table creation with proper relationships
- Index creation for performance
- RLS policies for security
- Triggers for automatic updates
- Helper functions for slug generation

## Usage Example

```typescript
// Creating a new menu
const { saveMenu, updateMenuField, addSection, addMenuItem } = useMenu();

// Update basic info
updateMenuField("name", "Dinner Menu");
updateMenuField("restaurant_name", "My Restaurant");

// Add a section
addSection();

// Add items to the section
addMenuItem(0); // Add to first section

// Save the complete menu
await saveMenu();
```

## Security Considerations

1. **Authentication Required**: All menu operations require a valid user session
2. **Data Isolation**: Users can only access their own menus through RLS policies
3. **Public Access Control**: Only published menus are accessible to the public
4. **Input Validation**: All user inputs are validated before database operations

## Performance Optimizations

1. **Database Indexes**: Strategic indexes on frequently queried columns
2. **Efficient Queries**: Service methods use optimized queries with proper joins
3. **Bulk Operations**: Complete menu saving is done in a single transaction
4. **Client-side Caching**: React hooks provide local state management

This implementation provides a robust, scalable foundation for the Menuop application's menu management system.

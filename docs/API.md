# Menuop API Documentation

## Overview

The Menuop API provides endpoints for managing digital menus for restaurants. The API is built using Next.js API routes and uses Supabase for authentication and data storage.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://menuop.com/api`

## Authentication

Most endpoints require authentication via Supabase session cookies. The authentication is handled automatically by the Supabase middleware.

### Public Endpoints

- `GET /public/menus/{id}` - View published menus (no auth required)
- `GET /auth/callback` - OAuth callback (handled by Supabase)

### Protected Endpoints

All other endpoints require a valid user session.

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Description                      |
| ---- | -------------------------------- |
| 200  | Success                          |
| 201  | Created successfully             |
| 400  | Bad request (validation error)   |
| 401  | Unauthorized (not authenticated) |
| 403  | Forbidden (not allowed)          |
| 404  | Not found                        |
| 500  | Internal server error            |

## API Endpoints

### Menus

#### GET /menus

Get all menus owned by the authenticated user.

**Response:**

```json
{
  "menus": [
    {
      "id": "uuid",
      "name": "Dinner Menu",
      "restaurant_name": "Mario's Restaurant",
      "description": "Evening menu",
      "is_published": false,
      "slug": "marios-dinner-menu",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /menus

Create a new menu with sections and items.

**Request Body:**

```json
{
  "name": "Lunch Menu",
  "restaurant_name": "Mario's Restaurant",
  "description": "Our delicious lunch offerings",
  "currency": "USD",
  "sections": [
    {
      "name": "Salads",
      "description": "Fresh and healthy options",
      "items": [
        {
          "name": "Caesar Salad",
          "description": "Crisp romaine with parmesan",
          "price": 12.99,
          "is_available": true
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "menu": {
    "id": "uuid",
    "name": "Lunch Menu",
    "restaurant_name": "Mario's Restaurant",
    "sections": [
      {
        "id": "uuid",
        "name": "Salads",
        "items": [
          {
            "id": "uuid",
            "name": "Caesar Salad",
            "price": 12.99
          }
        ]
      }
    ]
  }
}
```

#### POST /menus/developer-import

**Developer Mode Endpoint** - Bulk import menus using JSON data structure. Provides enhanced validation and error messages for rapid menu creation.

**Request Body:**

```json
{
  "name": "Quick Import Menu",
  "restaurant_name": "Dev Restaurant",
  "description": "Imported via developer mode",
  "sections": [
    {
      "name": "Appetizers",
      "description": "Starters",
      "items": [
        {
          "name": "Garlic Bread",
          "description": "Fresh baked with herbs",
          "price": 8.99,
          "image_url": "https://example.com/image.jpg",
          "is_available": true
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "menu": {
    "id": "uuid",
    "name": "Quick Import Menu",
    "restaurant_name": "Dev Restaurant",
    "sections": [...]
  },
  "message": "Menu imported successfully"
}
```

**Enhanced Features:**

- Detailed validation error messages with field-specific feedback
- Automatic sort order assignment
- Batch processing for large menu imports
- Optional fields handling with sensible defaults

````

#### GET /menus/{id}

Get a specific menu by ID.

**Parameters:**

- `id` (path) - Menu UUID

**Response:** Same as POST /menus response

#### PUT /menus/{id}

Update an existing menu. This replaces all sections and items.

**Parameters:**

- `id` (path) - Menu UUID

**Request Body:** Same as POST /menus

**Response:** Same as POST /menus response

#### DELETE /menus/{id}

Delete a menu (soft delete by default).

**Parameters:**

- `id` (path) - Menu UUID
- `permanent` (query, optional) - Set to `true` for permanent deletion (only works on already soft-deleted menus)

**Response:**

```json
{
  "success": true
}
````

#### PATCH /menus/{id}/publish

Publish or unpublish a menu.

**Parameters:**

- `id` (path) - Menu UUID

**Request Body:**

```json
{
  "is_published": true
}
```

**Response:**

```json
{
  "menu": {
    "id": "uuid",
    "is_published": true,
    "slug": "generated-slug"
  }
}
```

#### PATCH /menus/{id}/restore

Restore a soft-deleted menu.

**Note:** Currently returns 403 Forbidden as restoration is not allowed for regular users.

**Response:**

```json
{
  "error": "Forbidden: Menu restoration is not allowed for users"
}
```

#### GET /menus/deleted

Get all soft-deleted menus owned by the authenticated user.

**Response:**

```json
{
  "menus": [
    {
      "id": "uuid",
      "name": "Old Menu",
      "deleted_on": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Public Endpoints

#### GET /public/menus/{id}

Get a published menu by ID. No authentication required.

**Parameters:**

- `id` (path) - Menu UUID

**Response:**

```json
{
  "menu": {
    "id": "uuid",
    "name": "Dinner Menu",
    "restaurant_name": "Mario's Restaurant",
    "description": "Evening menu",
    "slug": "marios-dinner-menu",
    "sections": [
      {
        "id": "uuid",
        "name": "Appetizers",
        "description": "Light bites",
        "items": [
          {
            "id": "uuid",
            "name": "Caesar Salad",
            "description": "Crisp romaine",
            "price": 12.99,
            "is_available": true
          }
        ]
      }
    ]
  }
}
```

## Data Models

### Menu

```typescript
interface Menu {
  id: string; // UUID
  user_id: string; // UUID of owner
  name: string; // Menu name
  restaurant_name: string; // Restaurant name
  description?: string; // Optional description
  currency: string; // Currency code (ISO 4217)
  is_published: boolean; // Public visibility
  slug?: string; // URL-friendly identifier
  deleted_on?: string; // Soft delete timestamp
  created_at: string; // Creation timestamp
  updated_at: string; // Last update timestamp
}
```

### MenuSection

```typescript
interface MenuSection {
  id: string; // UUID
  menu_id: string; // Parent menu UUID
  name: string; // Section name
  description?: string; // Optional description
  sort_order: number; // Display order
  created_at: string;
  updated_at: string;
}
```

### MenuItem

```typescript
interface MenuItem {
  id: string; // UUID
  section_id: string; // Parent section UUID
  name: string; // Item name
  description?: string; // Optional description
  price: number; // Item price
  image_url?: string; // Optional image URL
  is_available: boolean; // Availability status
  sort_order: number; // Display order
  created_at: string;
  updated_at: string;
}
```

## Form Data Models

When creating or updating menus, use these simplified models:

### MenuFormData

```typescript
interface MenuFormData {
  name: string;
  restaurant_name: string;
  description?: string;
  sections: MenuSectionFormData[];
}
```

### MenuSectionFormData

```typescript
interface MenuSectionFormData {
  id?: string; // For updates only
  name: string;
  description?: string;
  items: MenuItemFormData[];
}
```

### MenuItemFormData

```typescript
interface MenuItemFormData {
  id?: string; // For updates only
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean; // Defaults to true
}
```

## Usage Examples

### Creating a Menu

```javascript
const menuData = {
  name: "Lunch Menu",
  restaurant_name: "Mario's Restaurant",
  description: "Our lunch offerings",
  sections: [
    {
      name: "Salads",
      description: "Fresh options",
      items: [
        {
          name: "Caesar Salad",
          description: "Romaine, parmesan, croutons",
          price: 12.99,
          is_available: true,
        },
      ],
    },
  ],
};

const response = await fetch("/api/menus", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(menuData),
});

const result = await response.json();
```

### Publishing a Menu

```javascript
const response = await fetch(`/api/menus/${menuId}/publish`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ is_published: true }),
});
```

### Getting Public Menu

```javascript
// No authentication required
const response = await fetch(`/api/public/menus/${menuId}`);
const { menu } = await response.json();
```

## Rate Limiting

Currently, there are no rate limits implemented, but they may be added in the future.

## Versioning

The API is currently at version 1.0. Any breaking changes will result in a new version.

## Support

For API support, please refer to the project documentation or contact the development team.

---

**Generated from OpenAPI specification** - See `docs/api-spec.yaml` for the complete OpenAPI 3.0 specification.

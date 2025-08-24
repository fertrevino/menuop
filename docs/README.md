# Menuop API Documentation

This folder contains comprehensive API documentation for the Menuop platform.

## 📚 Documentation Files

### 1. **OpenAPI Specification** (`api-spec.yaml`)

- Complete OpenAPI 3.0 specification
- Machine-readable API contract
- Can be used with Swagger UI, Postman, and other tools
- Includes all endpoints, request/response schemas, and examples

### 2. **Interactive Documentation** (`index.html`)

- Swagger UI interface for exploring the API
- Test endpoints directly in the browser
- Auto-generated from the OpenAPI spec

### 3. **Markdown Documentation** (`API.md`)

- Human-readable API documentation
- Includes usage examples and explanations
- Perfect for developers and AI agents
- Easy to read in any text editor or GitHub

### 4. **Postman Collection** (`postman-collection.json`)

- Ready-to-use collection for Postman or Insomnia
- Includes all endpoints with example requests
- Variables configured for easy testing

## 🚀 How to Use

### Option 1: View Interactive Documentation

1. **Start the documentation server:**

   ```bash
   ./serve-docs.sh
   ```

2. **Open in browser:**

   ```
   http://localhost:8080
   ```

3. **Explore the API:**
   - Browse all endpoints
   - See request/response examples
   - Test endpoints (requires authentication)

### Option 2: Use with Postman

1. **Import the collection:**

   - Open Postman
   - Import `postman-collection.json`

2. **Set up environment:**

   - Create new environment
   - Add variable `baseUrl` = `http://localhost:3000/api`
   - Add variable `menuId` with an actual menu ID

3. **Test endpoints:**
   - Make sure your dev server is running
   - Authenticate via browser first (for session cookies)

### Option 3: Read Markdown Documentation

Simply open `API.md` in any markdown viewer or text editor for comprehensive API documentation.

## 🤖 Benefits for AI Development

This documentation setup provides several benefits for AI-assisted development:

### **1. Complete API Contract**

- AI agents can understand all available endpoints
- Request/response formats are clearly defined
- Validation rules and constraints are documented

### **2. Machine-Readable Format**

- OpenAPI spec can be parsed programmatically
- AI tools can generate client code automatically
- Integration testing can be automated

### **3. Examples and Usage Patterns**

- Real request/response examples
- Common usage patterns documented
- Error handling examples provided

### **4. Consistent Documentation**

- Single source of truth for API behavior
- Automatically testable documentation
- Version controlled with code

## 📋 API Endpoints Summary

### **Authenticated Endpoints**

- `GET /menus` - List user's menus
- `POST /menus` - Create new menu
- `GET /menus/{id}` - Get specific menu
- `PUT /menus/{id}` - Update menu
- `DELETE /menus/{id}` - Delete menu (soft/permanent)
- `PATCH /menus/{id}/publish` - Publish/unpublish menu
- `PATCH /menus/{id}/restore` - Restore deleted menu (admin only)
- `GET /menus/deleted` - List deleted menus

### **Public Endpoints**

- `GET /public/menus/{id}` - View published menu (no auth)
- `GET /auth/callback` - OAuth callback

## 🔧 Updating Documentation

When you modify API endpoints:

1. **Update the OpenAPI spec** (`api-spec.yaml`)
2. **Update the markdown docs** (`API.md`)
3. **Update Postman collection** if needed
4. **Test the documentation** using the serve script

## 🎯 Next Steps

Consider adding:

- **API versioning** documentation
- **Rate limiting** information when implemented
- **Webhook documentation** if webhooks are added
- **SDK generation** using OpenAPI spec
- **Integration examples** for common frameworks

---

This documentation setup ensures that both human developers and AI agents have comprehensive, up-to-date information about your API, making development and integration much easier and safer.

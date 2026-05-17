# Fashcon | Admin Control Center

This is the dedicated administrative command center for the Fashcon ecosystem. Designed for high-density editorial workflows and inventory orchestration, it provides the tools necessary to maintain a premium fashion platform.

---

## 🛠 Core Modules

### 📝 Editorial Hub
- **Manuscript Management**: Complete CRUD operations for blog posts and articles.
- **TipTap Editorial Studio**: A rich-text experience tailored for fashion editors, featuring custom "Shop the Look" and "Gallery" node views.
- **SEO Orchestrator**: Integrated tools for slug generation, meta descriptions, and real-time previews.

### 📦 Inventory Suite
- **Product Vault**: Centralized management of luxury fashion items.
- **Variant Orchestration**: Manage colors, sizes, and specific affiliate links for every product variant.
- **Affiliate Integration**: Simplified management of external retail links and CTA configurations.

### 🖼 Media Vault
- **Asset Repository**: High-performance gallery for managing all visual assets.
- **Media Picker**: Seamlessly link images from the vault into articles or product cards.
- **Contextual Search**: Find the right asset instantly by name, format, or date.

---

## 🚀 Setup & Development

1. **Enter Subdomain**:
   ```bash
   cd subdomain/admin
   ```

2. **Initialize Environment**:
   ```bash
   npm install
   cp .env.example .env.local
   ```
   *Note: Ensure your `MONGODB_URI` and other credentials match the root configuration.*

3. **Launch Command Center**:
   ```bash
   npm run dev
   ```
   The admin panel will be accessible at [http://localhost:3001](http://localhost:3001).

---

## 🌐 Deployment Configuration

To host this on a dedicated subdomain (e.g., `admin.fashcon.store`):

### Vercel Deployment
1. Create a **new project** in Vercel.
2. Link the repository.
3. Set the **Root Directory** to `subdomain/admin`.
4. Configure environment variables in the Vercel Dashboard.
5. Map your subdomain in the **Settings > Domains** section.

---

<div align="center">
  <p>© 2026 Fashcon. All Rights Reserved.</p>
</div>

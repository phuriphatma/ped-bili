# ped-bili

Neonatal Age & Bilirubin management tool for hyperbilirubinemia assessment.

## Cache Management

This application uses a Service Worker for offline functionality and caching. To force cache refresh on all devices when deploying updates:

1. **Update the cache version** in `sw.js`:
   ```javascript
   // Update this timestamp when deploying new version to force cache refresh on all devices
   const CACHE_VERSION = '2024-08-19-001';  // ← Change this version
   ```

2. **Manual cache refresh**: Users can click the "🔄 Refresh Cache" button in the header to manually refresh the cache.

3. **Automatic updates**: The app will detect new service worker versions and show update notifications.

### Cache Version Format
Use format: `YYYY-MM-DD-NNN` where NNN is an increment for multiple deployments on the same day.

Examples:
- `2024-08-19-001` - First deployment on Aug 19, 2024
- `2024-08-19-002` - Second deployment on the same day
- `2024-08-20-001` - First deployment on Aug 20, 2024
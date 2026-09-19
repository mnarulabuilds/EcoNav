# CityConnect — product roadmap

Ideas to increase utility beyond the current demo platform. Prioritized by impact vs. effort.

## Near term (high impact, fits current stack)

| Feature | Why it matters |
|---------|----------------|
| **Push / SMS notifications** | Wire `notificationOutbox` to Twilio/MSG91; citizens get ticket updates. |
| **Hindi + regional i18n** | `preferredLanguage` on users; JSON catalogs for UI and scheme summaries. |
| **Photo attachments** | S3/R2 presigned uploads on civic & waste tickets (evidence for officials). |
| **Ward auto-detect** | Reverse-geocode map pin → suggest ward (Mapbox/Google Geocoding). |
| **Official assignment rules** | Auto-assign tickets by ward/category to field staff queues. |
| **Citizen satisfaction** | Close-the-loop rating after `resolved` status. |

## Medium term (operations & analytics)

| Feature | Why it matters |
|---------|----------------|
| **GIS export** | GeoJSON/CSV of open tickets for QGIS or city BI tools. |
| **SLA dashboards** | Trends, heatmaps by ward, breach alerts for commissioners. |
| **Waste route ↔ pickups** | Feed scheduled pickups into `/admin/waste-ops` as collection sites. |
| **Scheme application handoff** | Deep links to state portals + checklist of uploaded docs. |
| **Audit log** | Immutable log of admin status changes for transparency module. |
| **Role-based fine permissions** | Ward-scoped officials, read-only auditors. |

## Longer term (platform scale)

| Feature | Why it matters |
|---------|----------------|
| **Multi-ULB tenancy** | `ulbId` on all records; subdomain per city. |
| **SSO / DigiLocker** | Real auth instead of demo OTP. |
| **Open311 / standard APIs** | Interop with existing grievance systems. |
| **Mobile offline mode** | Expo queue reports when connectivity returns. |
| **AI triage** | Classify duplicate reports, suggest priority from description. |

## UX already improved in this pass

- Toast feedback, API offline banner, loading/empty states  
- Track requests with SLA hints  
- Help center with FAQ and helplines  
- Mobile nav, skip link, focus rings, Inter font  
- Color-coded ticket status badges  

Contributions: pick an item, open an issue, and align API + web + migrations in one PR.

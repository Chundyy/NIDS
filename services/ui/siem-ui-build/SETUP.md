# NIDS Sentinel UI - Setup Guide

## Changes Made

### 1. **Removed All Mockups**
   - Eliminated hardcoded mock data from `/lib/mock-data.ts`
   - Kept only utility types and constants (labels, colors)

### 2. **Created API Client** (`/lib/api.ts`)
   - Centralized API communication layer
   - Functions for all routes:
     - **Auth**: `login()`
     - **Alerts**: `fetchAlerts()`, `fetchAlertById()`, `createAlert()`
     - **Rules**: `fetchRules()`, `createRule()`, `updateRule()`
     - **Malware**: `analyzeMalware()`, `fetchMalwareAnalyses()`
     - **Scans**: `initiateScan()`, `fetchScans()`, `fetchScanStatus()`

### 3. **Updated Authentication System**
   - Modified `/lib/auth-context.tsx`:
     - Now calls actual API login endpoint
     - Stores user session in localStorage
     - Persists session on page reload
   - Updated backend `/routers/auth.py`:
     - Simplified login (no database required)
     - Accepts any username/password combination
     - Returns user role as "Security Analyst"

### 4. **Integrated Real Data**
   - **Alerts Component** (`/components/alerts-list.tsx`):
     - Fetches alerts from `/alerts` endpoint
     - Supports filtering by severity
     - Loading and error states
   
   - **Dashboard** (`/components/dashboard-overview.tsx`):
     - Real-time KPI metrics from alert data
     - Dynamic category and severity distribution charts
     - Live alert feed from API

### 5. **Environment Configuration**
   - Created `.env.local` with API URL:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```

## Running the Application

### Prerequisites
- Node.js 18+ (for Next.js)
- Python 3.9+ (for FastAPI backend)
- Docker (optional, for containerized deployment)

### Backend Setup
```bash
cd services/api

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### Frontend Setup
```bash
cd services/ui/siem-ui-build

# Install dependencies
npm install

# Run development server
npm run dev
```

The UI will be available at: `http://localhost:3000`

## Login Credentials
Since there's no database yet:
- **Username**: Any value (e.g., `admin`, `user`, etc.)
- **Password**: Any value

You can leave the password empty if the backend accepts it.

## API Routes Available

### Authentication
- `POST /auth/login` - Login with username/password
- `POST /auth/logout` - Logout

### Alerts
- `GET /alerts/` - List all alerts (supports filtering by severity, source_ip, destination_ip)
- `GET /alerts/{id}` - Get specific alert details
- `POST /alerts/` - Create new alert

### Rules
- `GET /rules/` - List all detection rules
- `POST /rules/` - Create new rule
- `PUT /rules/{rule_id}` - Update rule
- `DELETE /rules/{rule_id}` - Delete rule

### Malware
- `GET /malware/` - List malware reports
- `POST /malware/analyze` - Analyze file for malware

### Scans
- `GET /scans/results` - List all security scans
- `POST /scans/initiate` - Start new security scan
- `GET /scans/{scan_id}/status` - Get scan status

## Database Integration (Future)

To add database support for user authentication:

1. Create users table in your database
2. Modify `/services/api/routers/auth.py` to query the database
3. Add hash-based password verification
4. Update connection string in environment variables

## CORS Configuration

The API is already configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- Additional origins can be added in `/services/api/main.py`

## Troubleshooting

### API Connection Issues
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in FastAPI

### Authentication Issues
- Backend accepts any username/password (no validation yet)
- Session is stored in browser localStorage
- Clear browser storage if having login issues

### Data Not Loading
- Check browser console for API errors
- Verify Elasticsearch is running (for alerts data)
- Check backend logs for database connection issues

## Future Enhancements

- [ ] Add real user database with authentication
- [ ] Implement JWT tokens for secure sessions
- [ ] Add role-based access control (RBAC)
- [ ] Create admin panel for user management
- [ ] Add data persistence layer for scans and rules

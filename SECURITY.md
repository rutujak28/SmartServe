# SmartServe Security Documentation

## Overview
SmartServe implements comprehensive security measures to protect user data, prevent unauthorized access, and ensure compliance with security best practices.

## Security Features Implemented

### 1. Authentication & Authorization
- **Supabase Authentication**: Secure user authentication with JWT tokens
- **Role-Based Access Control (RBAC)**: Three user roles (customer, staff, admin) with granular permissions
- **Session Management**: Automatic token refresh and persistent sessions
- **Password Requirements**: 
  - Minimum 8 characters
  - Must contain uppercase and lowercase letters
  - Must contain at least one number
  - Maximum 128 characters

### 2. Row-Level Security (RLS) Policies
All database tables have RLS enabled with the following security model:

#### Customer-Facing Tables:
- **profiles**: Users can only view/update their own profile; staff can view for support
- **orders**: Users can view their own orders; staff/admin can view all
- **order_items**: Tied to order permissions
- **payments**: Users can view their own payments; staff/admin can view all for reconciliation
- **wishlists**: Users can manage their own wishlist
- **feedback**: Users can submit feedback for their orders; admins can view all

#### Admin-Only Tables:
- **canteens**: Public can view active canteens (basic info); staff can view full details
- **dining_tables**: Only staff/admin can view (QR codes protected)
- **menu_categories**: Public can view active categories; admin can manage
- **menu_items**: Public can view available items; admin can manage
- **user_roles**: Only admins can manage roles
- **audit_logs**: Only admins can view audit trails

#### AI & Notifications:
- **ai_conversations**: Users can view their own conversations; admins can view all
- **notifications**: Users can view/update their own notifications

### 3. Input Validation & Sanitization

#### Client-Side Validation (Zod):
- Email validation with format checking and length limits
- Phone number validation with international format support
- Password strength validation
- Name validation (letters, spaces, hyphens, apostrophes only)
- Table number validation (alphanumeric with hyphens)
- Order quantity limits (1-100 items)
- Price and amount validation
- Special instructions length limits (500 characters)

#### Server-Side Validation:
- All validation repeated on database level
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization
- HTML/script tag removal from text inputs

### 4. Rate Limiting
Client-side rate limiting implemented on sensitive endpoints:
- **Login**: 5 attempts per 15 minutes
- **Signup**: 3 attempts per 30 minutes
- Prevents brute force attacks
- User-friendly error messages on limit exceeded

### 5. Audit Logging
Comprehensive audit trail for sensitive operations:
- **Tracked Operations**: INSERT, UPDATE, DELETE on sensitive tables
- **Logged Tables**: user_roles, payments
- **Captured Data**: Old and new values, user_id, timestamp, IP address
- **Retention**: 90-day automatic cleanup for compliance
- **Admin Access**: View audit logs through `/admin/audit-logs`

### 6. Data Protection

#### Sensitive Data Handling:
- Payment credentials stored securely with Razorpay integration
- Phone numbers and emails protected by RLS
- QR codes restricted to staff only
- No plaintext password storage (handled by Supabase Auth)

#### Data Retention:
- Audit logs: 90 days automatic cleanup
- User data: Retained until account deletion
- Order history: Indefinite retention for business records

### 7. Error Handling
- **Error Boundaries**: React error boundaries catch and display user-friendly errors
- **Development Mode**: Detailed error information in development only
- **Production Mode**: Generic error messages without sensitive details
- **Logging**: All errors logged to console for monitoring

### 8. Performance & Optimization

#### Database Optimization:
- Indexed columns for fast queries:
  - orders: user_id, created_at, status
  - order_items: order_id
  - payments: order_id, user_id
  - menu_items: category_id
  - notifications: user_id, read status
  - wishlists: user_id

#### Security Functions:
- `has_role()`: Security definer function prevents RLS recursion
- `audit_trigger()`: Automatic audit logging for sensitive operations
- `clean_old_audit_logs()`: Automated data retention management

## Security Best Practices

### For Administrators:
1. **Enable Leaked Password Protection**: Navigate to Supabase dashboard → Auth → Password Protection and enable
2. **Review Audit Logs Regularly**: Check `/admin/audit-logs` for suspicious activity
3. **Monitor User Roles**: Regularly audit user_roles table for unauthorized role assignments
4. **Backup Strategy**: Implement regular database backups
5. **Update Dependencies**: Keep all npm packages and Supabase up to date

### For Developers:
1. **Never Hardcode Credentials**: Use environment variables and Supabase secrets
2. **Validate All Inputs**: Use Zod schemas for both client and server validation
3. **Use Parameterized Queries**: Always use Supabase client methods, never raw SQL with user input
4. **Test RLS Policies**: Verify policies work correctly for all user roles
5. **Follow Principle of Least Privilege**: Grant minimum necessary permissions

### For Users:
1. **Strong Passwords**: Use unique, complex passwords
2. **Account Security**: Never share login credentials
3. **Report Issues**: Report suspicious activity immediately
4. **Keep Information Updated**: Maintain accurate profile information

## Security Checklist

- [x] Authentication with Supabase Auth
- [x] Role-based access control (RBAC)
- [x] Row-Level Security (RLS) on all tables
- [x] Input validation with Zod
- [x] SQL injection prevention
- [x] XSS protection
- [x] Rate limiting on authentication
- [x] CSRF protection (handled by Supabase)
- [x] Secure session management
- [x] Audit logging for sensitive operations
- [x] Error boundaries and handling
- [x] Database indexes for performance
- [x] Data sanitization
- [ ] Leaked password protection (manual Supabase dashboard setting)

## Remaining Security Tasks

### Manual Configuration Required:
1. **Enable Leaked Password Protection**: 
   - Navigate to Supabase dashboard
   - Go to Auth → Password Security
   - Enable "Password Strength and Leaked Password Protection"
   - Documentation: https://supabase.com/docs/guides/auth/password-security

### Recommended Additional Security:
1. **SSL/HTTPS Enforcement**: Ensure production deployment uses HTTPS
2. **Content Security Policy (CSP)**: Configure CSP headers
3. **DDoS Protection**: Implement CloudFlare or similar service
4. **Monitoring**: Set up error tracking (Sentry, LogRocket)
5. **Penetration Testing**: Conduct regular security audits
6. **Compliance**: Ensure GDPR/CCPA compliance if applicable

## Incident Response

### In Case of Security Incident:
1. **Immediate Actions**:
   - Revoke affected user sessions via Supabase dashboard
   - Change affected credentials
   - Review audit logs for scope of breach
   - Block affected IP addresses if applicable

2. **Investigation**:
   - Check audit_logs table for unauthorized access
   - Review recent database changes
   - Examine authentication logs in Supabase

3. **Communication**:
   - Notify affected users
   - Document incident details
   - Update security measures

4. **Prevention**:
   - Implement additional controls
   - Update security policies
   - Conduct post-mortem analysis

## Contact

For security concerns or to report vulnerabilities, contact:
- Email: security@smartserve.example (replace with actual email)
- Emergency: Create issue in GitHub with "SECURITY" tag

## Version History

- **v1.0.0** (Current): Initial security implementation
  - RLS policies on all tables
  - Audit logging system
  - Rate limiting on authentication
  - Comprehensive input validation

---

**Last Updated**: 2025-11-11
**Security Review**: Phase 9 Complete
**Next Review**: Quarterly (or after major updates)

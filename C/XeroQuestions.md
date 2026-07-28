# C1. How would you prove that our Xero API connection is working before checking invoices?
Answer:
Before checking invoices, I would first verify that the OAuth connection and API authentication are working.
Step: 
1.Check that we have a valid OAuth 2.0 access token.
2.Call the Xero Connections endpoint: GET https://api.xero.com/connections
3.If it returns a successful response (HTTP 200) with the connected tenant information, the API connection is working.
Only after this should we test invoice endpoints.

# C2. If /connections works but GET /Invoices fails, what would you check?
If /connections works but invoices fail, the authentication is probably OK. I would check:

1. Scopes / permissions
Verify the OAuth scopes include:
accounting.transactions
Without this permission, invoice APIs will fail.

2. Correct tenant ID
Xero uses Xero-tenant-id header.
Example:
GET /api.xro/2.0/Invoices
Headers:
Authorization: Bearer ACCESS_TOKEN
Xero-tenant-id: TENANT_ID
Make sure the tenant ID comes from /connections.

3. API endpoint URL
Check we are calling the correct endpoint:
Correct:
GET https://api.xero.com/api.xro/2.0/Invoices
Not:
/connections/Invoices

4. Access token expiration
Check:
HTTP status code
Token expiry time
Refresh token flow
If expired:
401 Unauthorized
refresh the token.

5. Request headers
Verify:
Authorization: Bearer {token}
Accept: application/json
Xero-tenant-id: {tenantId}

# C3. What endpoint would you call to check invoices?
Use:
GET /Invoices
Full endpoint:
GET https://api.xero.com/api.xro/2.0/Invoices
Example:
GET /api.xro/2.0/Invoices?page=1
It retrieves invoices from the connected Xero organization.

# C4. How would you check one specific invoice?
Use the invoice ID.
Endpoint:
GET /Invoices/{InvoiceID}
Example:
GET https://api.xero.com/api.xro/2.0/Invoices/{invoiceId}
Example:
GET /Invoices/12345678-abcd

# C5. If the invoice API returns 429, how should the backend handle it?
HTTP 429 means:
Too Many Requests
The backend should handle rate limiting.

Steps:
1. Read Retry-After header
Example:
Retry-After: 60
Wait before retrying.

2. Implement exponential backoff
Example:
Retry after:
1 second
2 seconds
4 seconds
8 seconds
...
with a maximum retry limit.

3. Do not retry immediately
Bad:
request fails
↓
retry immediately
↓
fail again

Good:
429
↓
wait
↓
retry
↓
success/final failure

4. Add monitoring/logging
Log:
endpoint
timestamp
tenant ID
request ID
retry count

5. Return a friendly response to frontend
Example:
{
  "message": "Xero API is temporarily busy. Please try again later."
}
Do not expose raw Xero errors.
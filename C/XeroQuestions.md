# Xero API Questions & Answers

## C1. How would you prove that our Xero API connection is working before checking invoices?

### Answer

Before checking invoices, I would first verify that the OAuth authentication and API connection are working correctly.

### Steps

1. Verify that we have a valid **OAuth 2.0 access token**.
2. Call the **Connections** endpoint:

```http
GET https://api.xero.com/connections
```

3. If the request returns **HTTP 200** along with the connected tenant information, the API connection is working successfully.

Only after confirming the connection would I proceed to test the invoice-related endpoints.

---

# C2. If `/connections` works but `GET /Invoices` fails, what would you check?

Since `/connections` is working, authentication is likely valid. I would check the following:

## 1. OAuth Scopes / Permissions

Ensure the application has the required scope:

```text
accounting.transactions
```

Without this permission, invoice endpoints cannot be accessed.

---

## 2. Correct Tenant ID

Xero requires the `Xero-tenant-id` header for all Accounting API requests.

Example:

```http
GET /api.xro/2.0/Invoices

Authorization: Bearer ACCESS_TOKEN
Xero-tenant-id: TENANT_ID
```

Make sure the tenant ID comes from the `/connections` response.

---

## 3. API Endpoint

Verify that the request is sent to the correct endpoint.

✅ Correct

```http
GET https://api.xero.com/api.xro/2.0/Invoices
```

❌ Incorrect

```http
GET https://api.xero.com/connections/Invoices
```

---

## 4. Access Token Expiration

Check:

* HTTP status code
* Token expiration time
* Refresh token flow

If the access token has expired, the API will typically return:

```http
401 Unauthorized
```

In this case, refresh the token before retrying the request.

---

## 5. Request Headers

Verify that all required headers are included:

```http
Authorization: Bearer {access_token}
Accept: application/json
Xero-tenant-id: {tenantId}
```

---

# C3. What endpoint would you call to check invoices?

Use the **Invoices** endpoint.

### Endpoint

```http
GET https://api.xero.com/api.xro/2.0/Invoices
```

Example:

```http
GET https://api.xero.com/api.xro/2.0/Invoices?page=1
```

This endpoint retrieves invoices from the connected Xero organization.

---

# C4. How would you check one specific invoice?

Use the invoice's unique **InvoiceID**.

### Endpoint

```http
GET https://api.xero.com/api.xro/2.0/Invoices/{InvoiceID}
```

Example:

```http
GET https://api.xero.com/api.xro/2.0/Invoices/12345678-abcd
```

---

# C5. If the invoice API returns `429`, how should the backend handle it?

**HTTP 429** indicates:

> **Too Many Requests**

The backend should implement proper rate-limit handling.

## 1. Read the `Retry-After` Header

Example:

```http
Retry-After: 60
```

Wait for the specified duration before retrying.

---

## 2. Implement Exponential Backoff

Retry with increasing delays, for example:

```text
1 second
2 seconds
4 seconds
8 seconds
...
```

Always enforce a maximum retry limit.

---

## 3. Avoid Immediate Retries

❌ Bad

```text
Request
   ↓
429
   ↓
Retry immediately
   ↓
429 again
```

✅ Good

```text
Request
   ↓
429
   ↓
Wait (Retry-After / Backoff)
   ↓
Retry
   ↓
Success or Final Failure
```

---

## 4. Add Monitoring & Logging

Log useful information, such as:

* Endpoint
* Timestamp
* Tenant ID
* Request ID
* Retry count

This helps with troubleshooting and monitoring API usage.

---

## 5. Return a Friendly Response to the Frontend

Example:

```json
{
  "message": "The Xero API is temporarily busy. Please try again later."
}
```

Avoid exposing raw Xero error messages directly to end users.

# Database Schema for Electronic Signature System

## Overview
This document outlines the database schema for our electronic signature system, similar to Signaturely. The schema is designed to support document uploads, signature field placement, signer designation, and the signing process.

## Tables

### Users
```
users {
  id: string (primary key)
  email: string (unique)
  name: string
  password_hash: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Documents
```
documents {
  id: string (primary key)
  name: string
  created_at: timestamp
  created_by: string (foreign key -> users.id)
  status: enum ['draft', 'pending', 'completed']
  file_url: string
  file_type: string
  file_size: number
  updated_at: timestamp
}
```

### Signers
```
signers {
  id: string (primary key)
  document_id: string (foreign key -> documents.id)
  email: string
  name: string
  status: enum ['pending', 'completed']
  sign_url: string
  created_at: timestamp
  updated_at: timestamp
  completed_at: timestamp (nullable)
}
```

### Signature Fields
```
signature_fields {
  id: string (primary key)
  document_id: string (foreign key -> documents.id)
  assigned_to: string (foreign key -> signers.id)
  page: number
  x: number
  y: number
  width: number
  height: number
  type: enum ['signature', 'initial', 'date', 'text', 'checkbox']
  value: string (nullable)
  required: boolean
  completed: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Document Access
```
document_access {
  id: string (primary key)
  document_id: string (foreign key -> documents.id)
  user_id: string (foreign key -> users.id)
  access_type: enum ['owner', 'editor', 'viewer']
  created_at: timestamp
  updated_at: timestamp
}
```

### Templates
```
templates {
  id: string (primary key)
  name: string
  created_by: string (foreign key -> users.id)
  file_url: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Template Fields
```
template_fields {
  id: string (primary key)
  template_id: string (foreign key -> templates.id)
  page: number
  x: number
  y: number
  width: number
  height: number
  type: enum ['signature', 'initial', 'date', 'text', 'checkbox']
  role: string
  required: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Audit Logs
```
audit_logs {
  id: string (primary key)
  document_id: string (foreign key -> documents.id)
  user_id: string (nullable, foreign key -> users.id)
  signer_id: string (nullable, foreign key -> signers.id)
  action: string
  ip_address: string
  user_agent: string
  created_at: timestamp
}
```

## Relationships

1. **Users to Documents**: One-to-many. A user can create multiple documents.

2. **Documents to Signers**: One-to-many. A document can have multiple signers.

3. **Documents to Signature Fields**: One-to-many. A document can have multiple signature fields.

4. **Signers to Signature Fields**: One-to-many. A signer can be assigned multiple signature fields.

5. **Users to Document Access**: One-to-many. A user can have access to multiple documents.

6. **Documents to Document Access**: One-to-many. A document can be accessed by multiple users.

7. **Users to Templates**: One-to-many. A user can create multiple templates.

8. **Templates to Template Fields**: One-to-many. A template can have multiple template fields.

9. **Documents to Audit Logs**: One-to-many. A document can have multiple audit log entries.

## Indexes

1. **users**: email (unique)
2. **documents**: created_by, status
3. **signers**: document_id, email, status
4. **signature_fields**: document_id, assigned_to
5. **document_access**: document_id, user_id
6. **templates**: created_by
7. **template_fields**: template_id
8. **audit_logs**: document_id, created_at

## Security Considerations

1. **User Authentication**: Passwords should be hashed and salted before storage.
2. **Document Access Control**: Implement row-level security to ensure users can only access documents they own or have been granted access to.
3. **Signature Verification**: Store metadata about signatures (timestamp, IP address, etc.) for verification purposes.
4. **Audit Logging**: Log all important actions for compliance and security purposes.

## Implementation Notes

For our React TypeScript application, we'll use:
1. **Firebase Firestore** or a similar NoSQL database for flexible schema evolution
2. **Firebase Storage** for document file storage
3. **Firebase Authentication** for user management

Alternatively, we could use:
1. **PostgreSQL** for relational data with JSON support for flexible fields
2. **Amazon S3** or similar for document storage
3. **JWT-based authentication** with secure password storage

The schema is designed to be flexible and scalable, supporting the core features of our electronic signature system while allowing for future enhancements.

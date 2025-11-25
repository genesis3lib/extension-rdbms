# RDBMS Database Support

This extension adds database connectivity to your backend application. It supports PostgreSQL, MySQL, MariaDB, and H2 databases with automatic schema management and connection pooling.

## What This Does

This extension provides:
- Database connection configuration
- JPA (Java Persistence API) for Spring Boot
- Django ORM for Django REST Framework
- Database migration tools (Liquibase for Spring, Django migrations)
- Connection pooling for performance
- Development database scripts

---

## Configuration Fields

### Scaffold Configuration

#### Database Type `databaseType`
**What it is**: Which database management system you want to use.

**Options**:
- `postgresql` (recommended for production)
- `mysql`
- `mariadb`
- `h2` (for development/testing only)

**When to choose**:

**PostgreSQL** (recommended):
- Best for production applications
- Most feature-rich and reliable
- Excellent for complex queries
- Free and open source
- Used by: Instagram, Reddit, Spotify

**MySQL**:
- Good for production
- Widely supported hosting
- Good performance
- Popular in shared hosting

**MariaDB**:
- MySQL alternative (fully compatible)
- Community-driven
- Slightly better performance than MySQL

**H2**:
- **Only for development/testing**
- In-memory database (data lost on restart)
- Fast startup
- Zero configuration
- **Never use in production!**

---

#### JPA Version `jpaVersion` (Spring Only)
**What it is**: Java Persistence API version for object-relational mapping in Spring Boot.

**Options**:
- `3.1.0` - Older stable version
- `3.2.0` - Latest stable version (recommended)

**When to choose**:
- **3.2.0**: New projects, want latest features
- **3.1.0**: Compatibility with older libraries

**Note**: This only applies to Spring Boot projects, not Django.

---

#### Connection Pool Size `connectionPoolSize`
**What it is**: Maximum number of simultaneous database connections your application can use.

**Default**: 20 connections

**How to choose**:

**Small apps** (< 100 users): `10-20`
**Medium apps** (100-1000 users): `20-50`
**Large apps** (1000+ users): `50-100`

**Formula**: Roughly `(number of CPU cores × 2) + number of disk drives`

**Why it matters**:
- Too low: Requests wait for available connections (slow)
- Too high: Database gets overwhelmed (crashes)

**Best practice**: Start with 20, monitor actual usage, adjust if needed.

---

#### DDL Auto Mode `ddlAuto` (Spring Only)
**What it is**: How Hibernate should handle database schema (tables, columns) changes.

**Options**:

**`validate`** (recommended for production):
- Checks if database schema matches code
- Doesn't make any changes
- Throws error if mismatch
- Safest option

**`update`** (for development):
- Automatically updates schema to match code
- Adds new tables/columns
- **Never removes** anything (can cause issues)
- Risky for production

**`create-drop`** (for testing):
- Drops all tables on shutdown
- Creates fresh schema on startup
- **Destroys all data!**
- Only for automated tests

**`none`**:
- No automatic schema management
- You handle all migrations manually
- Most control, most work

**Recommendation**:
- **Production**: `validate` + Liquibase migrations
- **Development**: `update` (careful with it)
- **Testing**: `create-drop`

**Note**: This only applies to Spring Boot projects, not Django.

---

## Database Connection String

You'll need to provide a connection string in your environment variables:

**Format**:
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

**Examples**:

**Local PostgreSQL**:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/myapp_dev
```

**Heroku Postgres**:
```
DATABASE_URL=postgres://user:pass@ec2-host.compute-1.amazonaws.com:5432/dbname
```

**MySQL**:
```
DATABASE_URL=mysql://user:password@localhost:3306/myapp
```

**H2 (in-memory)**:
```
DATABASE_URL=jdbc:h2:mem:testdb
```

---

## Setting Up Local Database

### PostgreSQL (Recommended)

**Install PostgreSQL**:

Mac:
```bash
brew install postgresql@17
brew services start postgresql
```

Ubuntu/Linux:
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Windows:
- Download from https://www.postgresql.org/download/windows/
- Run installer
- Remember the password you set!

**Create Database**:
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE myapp_dev;

# Create user (optional)
CREATE USER myapp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE myapp_dev TO myapp_user;

# Exit
\q
```

**Connection string**:
```
DATABASE_URL=postgresql://myapp_user:secure_password@localhost:5432/myapp_dev
```

---

### MySQL

**Install MySQL**:

Mac:
```bash
brew install mysql
brew services start mysql
```

Ubuntu/Linux:
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

**Create Database**:
```bash
mysql -u root -p

CREATE DATABASE myapp_dev;
CREATE USER 'myapp_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON myapp_dev.* TO 'myapp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Connection string**:
```
DATABASE_URL=mysql://myapp_user:secure_password@localhost:3306/myapp_dev
```

---

### Docker (Easy Way)

**PostgreSQL**:
```bash
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=myapp_dev \
  -p 5432:5432 \
  -d postgres:17
```

**MySQL**:
```bash
docker run --name mysql-dev \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=myapp_dev \
  -p 3306:3306 \
  -d mysql:8
```

---

## Common Issues

### "Connection Refused"
**Problem**: Can't connect to database.

**Solutions**:
- Check database is running: `brew services list` (Mac) or `systemctl status postgresql` (Linux)
- Verify host and port in connection string
- Check firewall isn't blocking the port
- Ensure database actually exists

### "Authentication Failed"
**Problem**: Wrong username or password.

**Solutions**:
- Double-check connection string credentials
- Try connecting with psql/mysql command line tool
- Reset database user password if forgotten
- Check pg_hba.conf (PostgreSQL) for auth settings

### "Too Many Connections"
**Problem**: Connection pool exhausted.

**Solutions**:
- Increase `connectionPoolSize` setting
- Check for connection leaks in code
- Ensure connections are properly closed
- Monitor database max_connections setting

### "Table Doesn't Exist"
**Problem**: Database schema not created.

**Solutions**:
- Run Liquibase migrations: `./gradlew update` (Spring)
- Run Django migrations: `python manage.py migrate` (Django)
- Check `ddlAuto` setting
- Verify DATABASE_URL is correct

### "Schema Validation Failed"
**Problem**: Database schema doesn't match code (with `ddlAuto=validate`).

**Solutions**:
- Run pending migrations
- Check if you're connecting to correct database
- Temporarily use `ddlAuto=update` to sync (be careful!)
- Drop and recreate database for clean start (development only!)

---

## Best Practices

1. **Development**:
   - Use H2 or Docker database for quick local setup
   - Use `ddlAuto=update` carefully
   - Keep migrations in version control

2. **Production**:
   - Always use `ddlAuto=validate`
   - Use managed database (AWS RDS, Google Cloud SQL, etc.)
   - Regular backups!
   - Monitor connection pool usage

3. **Security**:
   - Never commit database passwords to code
   - Use strong passwords
   - Limit database user permissions
   - Use SSL connections in production

4. **Performance**:
   - Add database indexes for frequently queried columns
   - Monitor slow queries
   - Adjust connection pool size based on actual usage
   - Use connection pool monitoring

---

## Database Migrations

### Spring Boot (Liquibase)
Migrations are in `src/main/resources/db/changelog/`

Run migrations:
```bash
./gradlew update  # Gradle
mvn liquibase:update  # Maven
```

### Django
Migrations are in `<app>/migrations/`

Create migration:
```bash
python manage.py makemigrations
```

Run migrations:
```bash
python manage.py migrate
```

---

## Additional Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **Django ORM**: https://docs.djangoproject.com/en/5.2/topics/db/
- **Liquibase**: https://www.liquibase.org/get-started

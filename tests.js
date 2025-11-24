/**
 * Genesis3 Module Test Configuration - Database Extension
 */

module.exports = {
  moduleId: 'extension-rdbms',
  moduleName: 'RDBMS Database Configuration',

  scenarios: [
    {
      name: 'postgresql-basic',
      description: 'Basic PostgreSQL database setup',
      config: {
        moduleId: 'db-postgres',
        kind: 'extension',
        type: 'database',
        layers: ['ops'],
        enabled: true,
        fieldValues: {
          databaseType: 'postgresql',
          databaseName: 'myapp_db',
          enableBackups: true,
          enableReplication: false
        }
      },
      expectedFiles: [
        'ops/database/postgresql-config.yaml',
        'ops/database/backup-policy.yaml'
      ]
    },
    {
      name: 'mysql-with-replication',
      description: 'MySQL with read replicas',
      config: {
        moduleId: 'db-mysql',
        kind: 'extension',
        type: 'database',
        layers: ['ops'],
        enabled: true,
        fieldValues: {
          databaseType: 'mysql',
          databaseName: 'production_db',
          enableBackups: true,
          enableReplication: true,
          replicaCount: 2
        }
      },
      expectedFiles: [
        'ops/database/mysql-config.yaml',
        'ops/database/backup-policy.yaml',
        'ops/database/replication-config.yaml'
      ]
    },
    {
      name: 'mongodb-cluster',
      description: 'MongoDB cluster configuration',
      config: {
        moduleId: 'db-mongo',
        kind: 'extension',
        type: 'database',
        layers: ['ops'],
        enabled: true,
        fieldValues: {
          databaseType: 'mongodb',
          databaseName: 'app_data',
          enableBackups: true,
          enableSharding: true,
          shardCount: 3
        }
      },
      expectedFiles: [
        'ops/database/mongodb-config.yaml',
        'ops/database/sharding-config.yaml'
      ]
    }
  ]
};

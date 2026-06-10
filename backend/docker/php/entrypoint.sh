#!/usr/bin/env bash
set -e

cd /var/www/html

if [ ! -d vendor ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64' .env; then
    php artisan key:generate --force
fi

# Ensure Laravel (running as www-data) can write logs, cache and sessions on
# the bind mount. The entrypoint runs as root, so it can hand ownership over.
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwX storage bootstrap/cache || true

echo "Waiting for the database..."
until php -r '
    $host = getenv("DB_HOST") ?: "db";
    $port = getenv("DB_PORT") ?: 3306;
    exit(@fsockopen($host, (int) $port) ? 0 : 1);
'; do
    sleep 2
done

echo "Running migrations..."
php artisan migrate --force

php artisan config:clear

exec "$@"

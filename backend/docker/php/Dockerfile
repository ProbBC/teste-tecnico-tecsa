FROM php:8.4-fpm-alpine

RUN apk add --no-cache bash git unzip icu-dev oniguruma-dev sqlite-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite bcmath intl

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]

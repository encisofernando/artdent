server {
    listen      %ip%:%web_port%;
    server_name %domain_idn% %alias_idn%;
    root        %home%/%user%/web/%domain%/public_html;
    index       index.html;

    access_log  /var/log/%web_system%/domains/%domain%.log combined;
    error_log   /var/log/%web_system%/domains/%domain%.error.log error;

    # Archivos estáticos
    location ~* \.(jpg|jpeg|gif|png|svg|webp|css|js|map|ico|woff2?|ttf|eot)$ {
        expires 7d; access_log off;
        try_files $uri =404;
    }

    # Fallback SPA (history API)
    location / {
        try_files $uri /index.html;
    }

    client_max_body_size 16m;
    include %home%/%user%/conf/web/%domain%/nginx.forcessl.conf*;
}

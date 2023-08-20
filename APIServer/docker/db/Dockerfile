FROM mysql:latest
COPY ["./privileges.sql", "/docker-entrypoint-initdb.d"]
ARG ExecCommand=mysql -u root -p${MYSQL_ROOT_PASSWORD} < /root/privileges.sql

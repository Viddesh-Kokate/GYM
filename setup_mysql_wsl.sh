#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

echo "Updating packages..."
apt-get update

echo "Installing MySQL/MariaDB server..."
apt-get install -y default-mysql-server

echo "Configuring bind-address..."
# Allow remote connections if needed by WSL2 bridge
if [ -f /etc/mysql/mariadb.conf.d/50-server.cnf ]; then
    sed -i "s/^\s*bind-address.*/bind-address = 0.0.0.0/" /etc/mysql/mariadb.conf.d/50-server.cnf
fi

echo "Starting MySQL service..."
service mysql start
sleep 3

echo "Configuring database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS gym_management;"
mysql -u root -e "CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '';"
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;"
mysql -u root -e "FLUSH PRIVILEGES;"

echo "Database gym_management setup complete!"

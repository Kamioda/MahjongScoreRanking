#!/bin/bash

until mysqladmin ping -h mysql --silent; do
    sleep 2
done
